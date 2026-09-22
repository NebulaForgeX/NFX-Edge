package update

import (
	"context"

	"nfxedge/modules/sites/infrastructure/rdb/models"
)

func (h *Handler) Fields(ctx context.Context, id string, fields map[string]any) error {
	return h.db.WithContext(ctx).Model(&models.Certificate{}).Where("id = ?", id).Updates(fields).Error
}
