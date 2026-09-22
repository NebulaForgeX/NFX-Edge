package list

import (
	"context"

	"nfxedge/modules/sites/infrastructure/rdb/views"
	credQuery "nfxedge/modules/sites/query/credential"

	"github.com/google/uuid"
)

func (h *Handler) AllByAccountID(ctx context.Context, accountID uuid.UUID) ([]credQuery.CredentialVO, error) {
	var rows []views.NamecheapCredentialsActiveView
	if err := h.db.WithContext(ctx).Table(views.NamecheapCredentialsActiveView{}.TableName()).
		Where("account_id = ?", accountID).
		Order("updated_at DESC").
		Find(&rows).Error; err != nil {
		return nil, err
	}
	out := make([]credQuery.CredentialVO, 0, len(rows))
	for _, row := range rows {
		out = append(out, toVO(row))
	}
	return out, nil
}
