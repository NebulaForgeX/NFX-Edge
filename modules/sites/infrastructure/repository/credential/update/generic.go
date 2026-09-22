package update

import (
	"context"

	credDomain "nfxedge/modules/sites/domain/credential"
	"nfxedge/modules/sites/infrastructure/repository/credential/mapper"
)

func (h *Handler) Generic(ctx context.Context, c *credDomain.Credential) error {
	return h.db.WithContext(ctx).Save(mapper.CredentialDomainToModel(c)).Error
}
