package get

import (
	"context"

	certDomain "nfxedge/modules/sites/domain/certificate"
	"nfxedge/modules/sites/infrastructure/rdb/models"
	"nfxedge/modules/sites/infrastructure/repository/certificate/mapper"
)

func (h *Handler) ByID(ctx context.Context, id string) (*certDomain.Certificate, error) {
	var m models.Certificate
	if err := h.db.WithContext(ctx).First(&m, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return mapper.CertificateModelToDomain(&m), nil
}
