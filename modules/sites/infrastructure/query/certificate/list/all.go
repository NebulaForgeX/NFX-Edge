package list

import (
	"context"

	"nfxedge/modules/sites/infrastructure/rdb/views"
	certQuery "nfxedge/modules/sites/query/certificate"
)

func (h *Handler) All(ctx context.Context) ([]certQuery.CertificateVO, error) {
	var rows []views.TlsCertificatesActiveView
	if err := h.db.WithContext(ctx).Table(views.TlsCertificatesActiveView{}.TableName()).Find(&rows).Error; err != nil {
		return nil, err
	}
	out := make([]certQuery.CertificateVO, 0, len(rows))
	for _, r := range rows {
		out = append(out, toVO(r))
	}
	return out, nil
}
