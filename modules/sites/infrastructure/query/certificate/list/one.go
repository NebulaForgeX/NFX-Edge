package list

import (
	"context"

	"nfxedge/modules/sites/infrastructure/rdb/views"
	certQuery "nfxedge/modules/sites/query/certificate"
)

func (h *Handler) one(ctx context.Context, where string, arg any) (*certQuery.CertificateVO, error) {
	var row views.TlsCertificatesActiveView
	tx := h.db.WithContext(ctx).Table(views.TlsCertificatesActiveView{}.TableName()).Where(where, arg).Limit(1).Find(&row)
	if tx.Error != nil {
		return nil, tx.Error
	}
	if tx.RowsAffected == 0 {
		return nil, nil
	}
	vo := toVO(row)
	return &vo, nil
}
