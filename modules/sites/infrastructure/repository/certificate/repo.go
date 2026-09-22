package certificate

import (
	certDomain "nfxedge/modules/sites/domain/certificate"
	"nfxedge/modules/sites/infrastructure/repository/certificate/create"
	"nfxedge/modules/sites/infrastructure/repository/certificate/delete"
	"nfxedge/modules/sites/infrastructure/repository/certificate/get"
	"nfxedge/modules/sites/infrastructure/repository/certificate/update"

	"gorm.io/gorm"
)

func NewRepo(db *gorm.DB) *certDomain.Repo {
	return &certDomain.Repo{
		Create: create.NewHandler(db),
		Get:    get.NewHandler(db),
		Update: update.NewHandler(db),
		Delete: delete.NewHandler(db),
	}
}
