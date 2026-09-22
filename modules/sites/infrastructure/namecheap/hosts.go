package namecheap

import (
	"context"
	"fmt"
	"strings"

	"nfxedge/pkgs/namecheapx"
)

func (c *Client) AddHost(ctx context.Context, cred Credentials, domain string, host Host) error {
	return c.mutateHosts(ctx, cred, domain, func(current []Host) ([]Host, error) {
		host.Name = namecheapx.NormalizeHost(host.Name)
		if host.Type == "" {
			return nil, fmt.Errorf("record type is required")
		}
		if host.Address == "" {
			return nil, fmt.Errorf("address is required")
		}
		if host.TTL == "" {
			host.TTL = "1800"
		}
		if host.MXPref == "" {
			host.MXPref = "10"
		}
		return append(current, host), nil
	})
}

func (c *Client) UpdateHost(ctx context.Context, cred Credentials, domain string, host Host) error {
	return c.mutateHosts(ctx, cred, domain, func(current []Host) ([]Host, error) {
		host.Name = namecheapx.NormalizeHost(host.Name)
		idx := -1
		if host.HostID != "" {
			for i := range current {
				if current[i].HostID == host.HostID {
					idx = i
					break
				}
			}
		}
		if idx < 0 {
			for i := range current {
				if strings.EqualFold(current[i].Name, host.Name) && strings.EqualFold(current[i].Type, host.Type) {
					idx = i
					break
				}
			}
		}
		if idx < 0 {
			return nil, fmt.Errorf("host %s %s not found", host.Type, host.Name)
		}
		if host.Type == "" {
			host.Type = current[idx].Type
		}
		if host.TTL == "" {
			host.TTL = current[idx].TTL
		}
		if host.MXPref == "" {
			host.MXPref = current[idx].MXPref
		}
		current[idx] = host
		return current, nil
	})
}

func (c *Client) DeleteHost(ctx context.Context, cred Credentials, domain, hostID, name, recordType string) error {
	name = namecheapx.NormalizeHost(name)
	return c.mutateHosts(ctx, cred, domain, func(current []Host) ([]Host, error) {
		next := make([]Host, 0, len(current))
		removed := false
		for _, h := range current {
			match := false
			if hostID != "" && h.HostID == hostID {
				match = true
			} else if hostID == "" && strings.EqualFold(h.Name, name) && strings.EqualFold(h.Type, recordType) {
				match = true
			}
			if match {
				removed = true
				continue
			}
			next = append(next, h)
		}
		if !removed {
			return nil, fmt.Errorf("host %s %s not found", recordType, name)
		}
		return next, nil
	})
}

func (c *Client) mutateHosts(ctx context.Context, cred Credentials, domain string, fn func([]Host) ([]Host, error)) error {
	current, err := c.GetHosts(ctx, cred, domain)
	if err != nil {
		return err
	}
	if !current.IsOurDNS && len(current.Hosts) == 0 {
		return fmt.Errorf("domain %s is not using Namecheap DNS", domain)
	}
	next, err := fn(append([]Host{}, current.Hosts...))
	if err != nil {
		return err
	}
	return c.SetHosts(ctx, cred, domain, current.EmailType, next)
}
