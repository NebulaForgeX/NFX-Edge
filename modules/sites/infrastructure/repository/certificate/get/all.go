package get

import (
	"context"

	certDomain "nfxedge/modules/sites/domain/certificate"
	"nfxedge/modules/sites/infrastructure/rdb/models"
	"nfxedge/modules/sites/infrastructure/repository/certificate/mapper"
)

func (h *Handler) All(ctx context.Context) ([]*certDomain.Certificate, error) {
	var rows []models.Certificate
	if err := h.db.WithContext(ctx).Find(&rows).Error; err != nil {
		return nil, err
	}
	out := make([]*certDomain.Certificate, 0, len(rows))
	for i := range rows {
		out = append(out, mapper.CertificateModelToDomain(&rows[i]))
	}
	return out, nil
}
