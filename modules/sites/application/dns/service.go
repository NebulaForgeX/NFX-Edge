package dns

import (
	"context"

	sitesErr "nfxedge/errors/src/sites"
	"nfxedge/modules/sites/infrastructure/namecheap"
	repofactory "nfxedge/modules/sites/infrastructure/repository/factory"
	credQuery "nfxedge/modules/sites/query/credential"
	"nfxedge/pkgs/errx"
	"nfxedge/pkgs/transaction"

	"github.com/google/uuid"
)

type Service struct {
	tx          transaction.TxManager
	repoFactory *repofactory.TxRepoFactory
	credQuery   *credQuery.Query
	nc          *namecheap.Client
}

func NewService(
	tx transaction.TxManager,
	repoFactory *repofactory.TxRepoFactory,
	credQuery *credQuery.Query,
	nc *namecheap.Client,
) *Service {
	return &Service{tx: tx, repoFactory: repoFactory, credQuery: credQuery, nc: nc}
}

func none() transaction.UoW { return transaction.UoW{} }

func (s *Service) ncCred(ctx context.Context, accountID, credentialID uuid.UUID) (namecheap.Credentials, error) {
	sec, err := s.credQuery.List.SecretByID(ctx, credentialID)
	if err != nil {
		return namecheap.Credentials{}, err
	}
	if sec == nil || sec.AccountID != accountID || sec.APIKey == "" {
		return namecheap.Credentials{}, sitesErr.ErrNamecheapCredentialNotFound
	}
	return namecheap.Credentials{
		APIUser:  sec.APIUser,
		UserName: sec.APIUser,
		APIKey:   sec.APIKey,
		ClientIP: sec.ClientIP,
		Sandbox:  sec.Sandbox,
	}, nil
}

func mapNamecheap(err error) error {
	if err == nil {
		return nil
	}
	if e := errx.AsError(err); e != nil {
		return e
	}
	return sitesErr.ErrNamecheapAPI.WithMsg(err.Error()).WithCause(err)
}

func (s *Service) persistNcError(ctx context.Context, credentialID uuid.UUID, err error) {
	if err == nil {
		return
	}
	row, gerr := s.repoFactory.Credential(none()).Get.ByID(ctx, credentialID)
	if gerr != nil || row == nil {
		return
	}
	row.RecordError(err.Error())
	_ = s.repoFactory.Credential(none()).Update.Generic(ctx, row)
}
