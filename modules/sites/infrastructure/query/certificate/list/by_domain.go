package list

import (
	"context"

	certQuery "nfxedge/modules/sites/query/certificate"
)

func (h *Handler) ByDomain(ctx context.Context, domain string) (*certQuery.CertificateVO, error) {
	return h.one(ctx, "domain = ?", domain)
}
