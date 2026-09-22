package list

import (
	"context"

	certQuery "nfxedge/modules/sites/query/certificate"
)

func (h *Handler) ByID(ctx context.Context, id string) (*certQuery.CertificateVO, error) {
	return h.one(ctx, "id = ?", id)
}
