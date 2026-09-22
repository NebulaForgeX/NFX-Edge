package get

import (
	"context"

	certDomain "nfxedge/modules/sites/domain/certificate"
	"nfxedge/modules/sites/infrastructure/rdb/models"
	"nfxedge/modules/sites/infrastructure/repository/certificate/mapper"
)

func (h *Handler) ByDomain(ctx context.Context, domain string) (*certDomain.Certificate, error) {
	var m models.Certificate
	if err := h.db.WithContext(ctx).First(&m, "domain = ?", domain).Error; err != nil {
		return nil, err
	}
	return mapper.CertificateModelToDomain(&m), nil
}
