package list

import (
	"context"

	"nfxedge/modules/sites/infrastructure/rdb/views"
	certQuery "nfxedge/modules/sites/query/certificate"
)

func (h *Handler) Page(ctx context.Context, accountID, keyword string, offset, limit int, stripSecrets bool) ([]certQuery.CertificateVO, int64, error) {
	q := h.db.WithContext(ctx).Table(views.TlsCertificatesActiveView{}.TableName())
	if accountID != "" {
		q = q.Where("account_id = ?", accountID)
	}
	if keyword != "" {
		like := "%" + keyword + "%"
		q = q.Where("domain ILIKE ? OR folder_name ILIKE ? OR email ILIKE ?", like, like, like)
	}
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var rows []views.TlsCertificatesActiveView
	if err := q.Order("updated_at desc").Offset(offset).Limit(limit).Find(&rows).Error; err != nil {
		return nil, 0, err
	}
	out := make([]certQuery.CertificateVO, 0, len(rows))
	for _, r := range rows {
		vo := toVO(r)
		if stripSecrets {
			vo.Certificate = nil
			vo.PrivateKey = nil
		}
		out = append(out, vo)
	}
	return out, total, nil
}
