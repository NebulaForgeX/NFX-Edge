package create

import (
	"context"

	credDomain "nfxedge/modules/sites/domain/credential"
	"nfxedge/modules/sites/infrastructure/repository/credential/mapper"
)

func (h *Handler) New(ctx context.Context, c *credDomain.Credential) error {
	return h.db.WithContext(ctx).Create(mapper.CredentialDomainToModel(c)).Error
}
