package dns

import (
	"context"

	sitesErr "nfxedge/errors/src/sites"
	"nfxedge/modules/sites/application/dns/results"
)

func (s *Service) OutboundIPv4(ctx context.Context) (results.OutboundIPRO, error) {
	ip, err := s.nc.OutboundIPv4(ctx)
	if err != nil {
		return results.OutboundIPRO{}, sitesErr.ErrOutboundIPFailed
	}
	return results.OutboundIPRO{IPv4: ip}, nil
}
