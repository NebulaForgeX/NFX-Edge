package dns

import (
	"context"
	"strings"

	sitesErr "nfxedge/errors/src/sites"
	"nfxedge/modules/sites/application/dns/commands"
	"nfxedge/modules/sites/application/dns/results"
	"nfxedge/modules/sites/infrastructure/namecheap"
)

func normalizeDomain(domain string) string {
	return strings.ToLower(strings.TrimSuffix(strings.TrimSpace(domain), "."))
}

func (s *Service) GetDomain(ctx context.Context, cmd commands.GetDomainCmd) (*results.DomainDetailRO, error) {
	domain := normalizeDomain(cmd.Domain)
	if domain == "" {
		return nil, sitesErr.ErrInvalidDomain
	}
	cred, err := s.ncCred(ctx, cmd.AccountID, cmd.CredentialID)
	if err != nil {
		return nil, err
	}
	info, err := s.nc.GetInfo(ctx, cred, domain)
	if err != nil {
		s.persistNcError(ctx, cmd.CredentialID, err)
		return nil, mapNamecheap(err)
	}
	hosts, herr := s.nc.GetHosts(ctx, cred, domain)
	out := &results.DomainDetailRO{Info: results.DomainInfoMapper(info)}
	if herr != nil {
		out.Hosts = &results.HostsRO{Domain: domain, Hosts: []results.HostRO{}}
		return out, nil
	}
	out.Hosts = results.HostsMapper(hosts)
	return out, nil
}

func (s *Service) AddHost(ctx context.Context, cmd commands.HostCmd) error {
	return s.mutateHost(ctx, cmd, func(cred namecheap.Credentials, domain string, host namecheap.Host) error {
		return s.nc.AddHost(ctx, cred, domain, host)
	})
}

func (s *Service) UpdateHost(ctx context.Context, cmd commands.HostCmd) error {
	return s.mutateHost(ctx, cmd, func(cred namecheap.Credentials, domain string, host namecheap.Host) error {
		return s.nc.UpdateHost(ctx, cred, domain, host)
	})
}

func (s *Service) DeleteHost(ctx context.Context, cmd commands.HostCmd) error {
	domain := normalizeDomain(cmd.Domain)
	if domain == "" {
		return sitesErr.ErrInvalidDomain
	}
	cred, err := s.ncCred(ctx, cmd.AccountID, cmd.CredentialID)
	if err != nil {
		return err
	}
	if err := s.nc.DeleteHost(ctx, cred, domain, cmd.HostID, cmd.Name, cmd.Type); err != nil {
		s.persistNcError(ctx, cmd.CredentialID, err)
		return mapNamecheap(err)
	}
	return nil
}

func (s *Service) mutateHost(ctx context.Context, cmd commands.HostCmd, fn func(namecheap.Credentials, string, namecheap.Host) error) error {
	domain := normalizeDomain(cmd.Domain)
	if domain == "" {
		return sitesErr.ErrInvalidDomain
	}
	if strings.TrimSpace(cmd.Type) == "" || strings.TrimSpace(cmd.Address) == "" {
		return sitesErr.ErrInvalidHost
	}
	cred, err := s.ncCred(ctx, cmd.AccountID, cmd.CredentialID)
	if err != nil {
		return err
	}
	host := namecheap.Host{
		HostID:  strings.TrimSpace(cmd.HostID),
		Name:    cmd.Name,
		Type:    strings.TrimSpace(cmd.Type),
		Address: strings.TrimSpace(cmd.Address),
		TTL:     strings.TrimSpace(cmd.TTL),
		MXPref:  strings.TrimSpace(cmd.MXPref),
	}
	if err := fn(cred, domain, host); err != nil {
		s.persistNcError(ctx, cmd.CredentialID, err)
		return mapNamecheap(err)
	}
	return nil
}

func (s *Service) PreviewBulkHosts(ctx context.Context, cmd commands.BulkHostCmd) (*results.BulkHostRO, error) {
	return s.collectBulk(ctx, cmd, false)
}

func (s *Service) BulkHosts(ctx context.Context, cmd commands.BulkHostCmd) (*results.BulkHostRO, error) {
	return s.collectBulk(ctx, cmd, true)
}

func (s *Service) collectBulk(ctx context.Context, cmd commands.BulkHostCmd, commit bool) (*results.BulkHostRO, error) {
	action := strings.ToLower(strings.TrimSpace(cmd.Action))
	if action != "update" && action != "add" && action != "delete" {
		return nil, sitesErr.ErrInvalidHostAction
	}
	filter := namecheap.HostFilter{
		IDs: append([]string{}, cmd.Filter.IDs...), Keys: append([]string{}, cmd.Filter.Keys...),
		Name: strings.TrimSpace(cmd.Filter.Name), Type: strings.TrimSpace(cmd.Filter.Type),
		Address: strings.TrimSpace(cmd.Filter.Address), TTL: strings.TrimSpace(cmd.Filter.TTL), MXPref: strings.TrimSpace(cmd.Filter.MXPref),
	}
	patch := namecheap.HostPatch{
		Address: strings.TrimSpace(cmd.Patch.Address), TTL: strings.TrimSpace(cmd.Patch.TTL), MXPref: strings.TrimSpace(cmd.Patch.MXPref),
		AddressSelf: cmd.Patch.AddressSelf,
	}
	adds := make([]namecheap.HostAdd, 0, len(cmd.Adds))
	for _, row := range cmd.Adds {
		adds = append(adds, namecheap.HostAdd{
			Name: strings.TrimSpace(row.Name), Type: strings.TrimSpace(row.Type),
			Address: strings.TrimSpace(row.Address), TTL: strings.TrimSpace(row.TTL), MXPref: strings.TrimSpace(row.MXPref),
			AddressSelf: row.AddressSelf,
		})
	}
	if action == "add" {
		if len(adds) == 0 {
			return nil, sitesErr.ErrInvalidHost
		}
		for _, row := range adds {
			if row.Name == "" || strings.EqualFold(row.Name, "all") || row.Type == "" || strings.EqualFold(row.Type, "all") {
				return nil, sitesErr.ErrInvalidHost
			}
			if !row.AddressSelf && row.Address == "" {
				return nil, sitesErr.ErrInvalidHost
			}
		}
	}
	if action == "update" && patch.Address == "" && patch.TTL == "" && patch.MXPref == "" && !patch.AddressSelf {
		return nil, sitesErr.ErrInvalidHost
	}
	if action == "delete" && !filter.Specified() {
		return nil, sitesErr.ErrInvalidHostFilter
	}
	domains := uniqueDomains(cmd.Domains)
	if len(domains) == 0 {
		return nil, sitesErr.ErrInvalidHostCollection
	}
	cred, err := s.ncCred(ctx, cmd.AccountID, cmd.CredentialID)
	if err != nil {
		return nil, err
	}
	spec := namecheap.HostCollectionSpec{Action: action, Filter: filter, Patch: patch, Adds: adds}
	out := &results.BulkHostRO{Items: make([]results.BulkHostItemRO, 0, len(domains))}
	for _, domain := range domains {
		var outcome namecheap.CollectionOutcome
		var applyErr error
		if commit {
			outcome, applyErr = s.nc.ApplyHostCollection(ctx, cred, domain, spec)
		} else {
			outcome, applyErr = s.nc.PlanHostCollection(ctx, cred, domain, spec)
		}
		item := results.BulkHostItemRO{Domain: domain, Status: outcome.Status, Changes: mapHostChanges(outcome.Changes)}
		if applyErr != nil {
			s.persistNcError(ctx, cmd.CredentialID, applyErr)
			item.Status = "failed"
			item.Message = applyErr.Error()
		}
		out.Items = append(out.Items, item)
	}
	return out, nil
}

func mapHostChanges(rows []namecheap.HostChange) []results.BulkHostChangeRO {
	out := make([]results.BulkHostChangeRO, 0, len(rows))
	for _, row := range rows {
		item := results.BulkHostChangeRO{}
		if row.Before != nil {
			snap := results.HostSnap(*row.Before)
			item.Before = &snap
		}
		if row.After != nil {
			snap := results.HostSnap(*row.After)
			item.After = &snap
		}
		out = append(out, item)
	}
	return out
}

func uniqueDomains(values []string) []string {
	seen := make(map[string]struct{}, len(values))
	out := make([]string, 0, len(values))
	for _, raw := range values {
		domain := normalizeDomain(raw)
		if domain == "" {
			continue
		}
		if _, ok := seen[domain]; ok {
			continue
		}
		seen[domain] = struct{}{}
		out = append(out, domain)
	}
	return out
}
