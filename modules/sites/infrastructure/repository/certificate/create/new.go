package create

import (
	"context"

	certDomain "nfxedge/modules/sites/domain/certificate"
	"nfxedge/modules/sites/infrastructure/repository/certificate/mapper"
)

func (h *Handler) New(ctx context.Context, c *certDomain.Certificate) error {
	return h.db.WithContext(ctx).Create(mapper.CertificateDomainToModel(c)).Error
}
