package credential

import (
	"errors"

	sitesErr "nfxedge/errors/src/sites"
	credDomain "nfxedge/modules/sites/domain/credential"
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

func isMissing(err error) bool {
	e := errx.AsError(err)
	return e != nil && e.Kind == errx.KindNotFound
}

func mapCredentialErr(err error) error {
	if err == nil {
		return nil
	}
	switch {
	case errors.Is(err, credDomain.ErrAPIUserRequired),
		errors.Is(err, credDomain.ErrAPIKeyRequired),
		errors.Is(err, credDomain.ErrClientIPRequired),
		errors.Is(err, credDomain.ErrInvalidClientIP),
		errors.Is(err, credDomain.ErrAccountIDRequired):
		return sitesErr.ErrInvalidNamecheapCredential
	default:
		return err
	}
}

func profilePtr(id uuid.UUID) *uuid.UUID {
	if id == uuid.Nil {
		return nil
	}
	v := id
	return &v
}
