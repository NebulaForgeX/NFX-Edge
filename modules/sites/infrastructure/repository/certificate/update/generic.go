package update

import (
	"context"

	certDomain "nfxedge/modules/sites/domain/certificate"
	"nfxedge/modules/sites/infrastructure/repository/certificate/mapper"
)

func (h *Handler) Generic(ctx context.Context, c *certDomain.Certificate) error {
	return h.db.WithContext(ctx).Save(mapper.CertificateDomainToModel(c)).Error
}
