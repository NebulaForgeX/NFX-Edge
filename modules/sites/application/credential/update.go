package credential

import (
	"context"

	sitesErr "nfxedge/errors/src/sites"
	"nfxedge/modules/sites/application/credential/commands"
	"nfxedge/modules/sites/application/credential/results"
	"nfxedge/pkgs/transaction"
)

func (s *Service) UpdateCredential(ctx context.Context, cmd commands.UpdateCredentialCmd) (*results.CredentialRO, error) {
	existing, err := s.repoFactory.Credential(none()).Get.ByID(ctx, cmd.CredentialID)
	if err != nil {
		return nil, err
	}
	if existing.AccountID() != cmd.AccountID {
		return nil, sitesErr.ErrNamecheapCredentialNotFound
	}
	err = s.tx.WithUoW(ctx, func(ctx context.Context, uow transaction.UoW) error {
		if aerr := existing.ApplySecret(cmd.Label, cmd.APIUser, cmd.APIKey, cmd.ClientIP, cmd.Sandbox); aerr != nil {
			return mapCredentialErr(aerr)
		}
		existing.BindProfile(profilePtr(cmd.ProfileID))
		return s.repoFactory.Credential(uow).Update.Generic(ctx, existing)
	})
	if err != nil {
		return nil, err
	}
	return s.GetCredential(ctx, cmd.AccountID, cmd.CredentialID)
}
