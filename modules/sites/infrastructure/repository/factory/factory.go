package factory

import (
	certDomain "nfxedge/modules/sites/domain/certificate"
	credDomain "nfxedge/modules/sites/domain/credential"
	certRepo "nfxedge/modules/sites/infrastructure/repository/certificate"
	credRepo "nfxedge/modules/sites/infrastructure/repository/credential"
	"nfxedge/pkgs/transaction"

	"gorm.io/gorm"
)

type TxRepoFactory struct{ db *gorm.DB }

func NewTxRepoFactory(db *gorm.DB) *TxRepoFactory { return &TxRepoFactory{db: db} }

func (f *TxRepoFactory) dbOr(uow transaction.UoW) *gorm.DB {
	if uow.DB != nil {
		return uow.DB
	}
	return f.db
}

func (f *TxRepoFactory) Certificate(uow transaction.UoW) *certDomain.Repo {
	return certRepo.NewRepo(f.dbOr(uow))
}

func (f *TxRepoFactory) Credential(uow transaction.UoW) *credDomain.Repo {
	return credRepo.NewRepo(f.dbOr(uow))
}
