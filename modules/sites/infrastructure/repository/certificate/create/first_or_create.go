package create

import (
	"context"

	certDomain "nfxedge/modules/sites/domain/certificate"
	"nfxedge/modules/sites/infrastructure/repository/certificate/mapper"
)

func (h *Handler) FirstOrCreateByDomain(ctx context.Context, c *certDomain.Certificate) error {
	m := mapper.CertificateDomainToModel(c)
	if err := h.db.WithContext(ctx).Where("domain = ?", c.State().Domain).Attrs(m).FirstOrCreate(m).Error; err != nil {
		return err
	}
	c.Load(mapper.CertificateModelToDomain(m).State())
	return nil
}
