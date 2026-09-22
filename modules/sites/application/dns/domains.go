package dns

import (
	"context"

	"nfxedge/modules/sites/application/dns/commands"
	"nfxedge/modules/sites/application/dns/results"
)

func (s *Service) ListDomains(ctx context.Context, cmd commands.ListDomainsCmd) ([]results.DomainRO, error) {
	cred, err := s.ncCred(ctx, cmd.AccountID, cmd.CredentialID)
	if err != nil {
		return nil, err
	}
	items, err := s.nc.GetAllDomains(ctx, cred)
	if err != nil {
		s.persistNcError(ctx, cmd.CredentialID, err)
		return nil, mapNamecheap(err)
	}
	return results.DomainsMapper(items), nil
}

func (s *Service) GetBalances(ctx context.Context, cmd commands.ListDomainsCmd) (results.BalancesRO, error) {
	cred, err := s.ncCred(ctx, cmd.AccountID, cmd.CredentialID)
	if err != nil {
		return results.BalancesRO{}, err
	}
	row, err := s.nc.GetBalances(ctx, cred)
	if err != nil {
		s.persistNcError(ctx, cmd.CredentialID, err)
		return results.BalancesRO{}, mapNamecheap(err)
	}
	return results.BalancesMapper(row), nil
}

func (s *Service) ListSSL(ctx context.Context, cmd commands.ListDomainsCmd) ([]results.SSLCertificateRO, error) {
	cred, err := s.ncCred(ctx, cmd.AccountID, cmd.CredentialID)
	if err != nil {
		return nil, err
	}
	items, err := s.nc.GetSslList(ctx, cred)
	if err != nil {
		s.persistNcError(ctx, cmd.CredentialID, err)
		return nil, mapNamecheap(err)
	}
	return results.SSLMapper(items), nil
}
