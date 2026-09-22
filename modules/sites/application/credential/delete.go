package credential

import (
	"context"

	sitesErr "nfxedge/errors/src/sites"
	sitesmsg "nfxedge/messages/src/sites"
	"nfxedge/modules/sites/application/credential/commands"
	"nfxedge/modules/sites/application/credential/results"
	"nfxedge/pkgs/transaction"
)

func (s *Service) DeleteCredential(ctx context.Context, cmd commands.DeleteCredentialCmd) (results.CommandRO, error) {
	existing, err := s.repoFactory.Credential(none()).Get.ByID(ctx, cmd.CredentialID)
	if err != nil {
		return results.CommandRO{}, err
	}
	if existing.AccountID() != cmd.AccountID {
		return results.CommandRO{}, sitesErr.ErrNamecheapCredentialNotFound
	}
	err = s.tx.WithUoW(ctx, func(ctx context.Context, uow transaction.UoW) error {
		return s.repoFactory.Credential(uow).Delete.ByID(ctx, cmd.CredentialID)
	})
	if err != nil {
		return results.CommandRO{}, err
	}
	return results.CommandRO{Success: true, Message: sitesmsg.NAMECHEAP_CREDENTIAL_DELETED}, nil
}
