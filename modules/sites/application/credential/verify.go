package credential

import (
	"context"
	"time"

	sitesErr "nfxedge/errors/src/sites"
	sitesmsg "nfxedge/messages/src/sites"
	"nfxedge/modules/sites/application/credential/commands"
	"nfxedge/modules/sites/application/credential/results"
	"nfxedge/modules/sites/infrastructure/namecheap"
	"nfxedge/pkgs/transaction"

	"github.com/google/uuid"
)

func (s *Service) ncCred(ctx context.Context, accountID, credentialID uuid.UUID) (namecheap.Credentials, error) {
	sec, err := s.ownedSecret(ctx, accountID, credentialID)
	if err != nil {
		return namecheap.Credentials{}, err
	}
	return namecheap.Credentials{
		APIUser:  sec.APIUser,
		UserName: sec.APIUser,
		APIKey:   sec.APIKey,
		ClientIP: sec.ClientIP,
		Sandbox:  sec.Sandbox,
	}, nil
}

func (s *Service) persistVerify(ctx context.Context, credentialID uuid.UUID, verifyAt *time.Time, errMsg *string) {
	row, err := s.repoFactory.Credential(none()).Get.ByID(ctx, credentialID)
	if err != nil || row == nil {
		return
	}
	if verifyAt != nil {
		row.MarkVerified(*verifyAt)
	} else if errMsg != nil {
		row.RecordError(*errMsg)
	}
	_ = s.repoFactory.Credential(transaction.UoW{}).Update.Generic(ctx, row)
}

func (s *Service) VerifyCredential(ctx context.Context, cmd commands.VerifyCredentialCmd) (results.CommandRO, error) {
	cred, err := s.ncCred(ctx, cmd.AccountID, cmd.CredentialID)
	if err != nil {
		return results.CommandRO{}, err
	}
	_, _, err = s.nc.GetList(ctx, cred, 1, 20)
	now := time.Now().UTC()
	if err != nil {
		msg := err.Error()
		s.persistVerify(ctx, cmd.CredentialID, nil, &msg)
		return results.CommandRO{Success: false, Message: sitesErr.CodeNamecheapAPI}, nil
	}
	s.persistVerify(ctx, cmd.CredentialID, &now, nil)
	return results.CommandRO{Success: true, Message: sitesmsg.NAMECHEAP_CONNECTED}, nil
}
