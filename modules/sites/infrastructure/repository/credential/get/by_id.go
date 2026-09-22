package get

import (
	"context"
	"errors"

	sitesErr "nfxedge/errors/src/sites"
	credDomain "nfxedge/modules/sites/domain/credential"
	"nfxedge/modules/sites/infrastructure/rdb/models"
	"nfxedge/modules/sites/infrastructure/repository/credential/mapper"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (h *Handler) ByID(ctx context.Context, id uuid.UUID) (*credDomain.Credential, error) {
	var m models.NamecheapCredential
	if err := h.db.WithContext(ctx).Where("id = ?", id).First(&m).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, sitesErr.ErrNamecheapCredentialNotFound
		}
		return nil, err
	}
	return mapper.CredentialModelToDomain(&m), nil
}
