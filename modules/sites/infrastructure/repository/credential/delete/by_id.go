package delete

import (
	"context"

	"nfxedge/modules/sites/infrastructure/rdb/models"

	"github.com/google/uuid"
)

func (h *Handler) ByID(ctx context.Context, id uuid.UUID) error {
	return h.db.WithContext(ctx).Delete(&models.NamecheapCredential{}, "id = ?", id).Error
}
