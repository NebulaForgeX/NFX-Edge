package delete

import (
	"context"

	"nfxedge/modules/sites/infrastructure/rdb/models"
)

func (h *Handler) ByID(ctx context.Context, id string) (int64, error) {
	res := h.db.WithContext(ctx).Delete(&models.Certificate{}, "id = ?", id)
	return res.RowsAffected, res.Error
}
