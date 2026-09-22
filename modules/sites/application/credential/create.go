package credential

import (
	"context"

	"nfxedge/modules/sites/application/credential/commands"
	"nfxedge/modules/sites/application/credential/results"
	credDomain "nfxedge/modules/sites/domain/credential"
	"nfxedge/pkgs/transaction"
)

func (s *Service) CreateCredential(ctx context.Context, cmd commands.CreateCredentialCmd) (*results.CredentialRO, error) {
	var id = cmd.AccountID
	err := s.tx.WithUoW(ctx, func(ctx context.Context, uow transaction.UoW) error {
		created, cerr := credDomain.NewCredential(credDomain.NewCredentialParams{
			AccountID: cmd.AccountID,
			ProfileID: profilePtr(cmd.ProfileID),
			Label:     cmd.Label,
			APIUser:   cmd.APIUser,
			APIKey:    cmd.APIKey,
			ClientIP:  cmd.ClientIP,
			Sandbox:   cmd.Sandbox,
		})
		if cerr != nil {
			return mapCredentialErr(cerr)
		}
		id = created.ID()
		return s.repoFactory.Credential(uow).Create.New(ctx, created)
	})
	if err != nil {
		return nil, err
	}
	return s.GetCredential(ctx, cmd.AccountID, id)
}
