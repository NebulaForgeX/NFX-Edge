package list

import (
	"context"
	"errors"

	"nfxedge/modules/sites/infrastructure/rdb/views"
	credQuery "nfxedge/modules/sites/query/credential"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (h *Handler) ByID(ctx context.Context, id uuid.UUID) (*credQuery.CredentialVO, error) {
	var row views.NamecheapCredentialsActiveView
	if err := h.db.WithContext(ctx).Table(views.NamecheapCredentialsActiveView{}.TableName()).
		Where("id = ?", id).First(&row).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	vo := toVO(row)
	return &vo, nil
}
