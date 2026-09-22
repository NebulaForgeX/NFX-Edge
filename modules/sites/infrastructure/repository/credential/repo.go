package credential

import (
	credDomain "nfxedge/modules/sites/domain/credential"
	"nfxedge/modules/sites/infrastructure/repository/credential/check"
	"nfxedge/modules/sites/infrastructure/repository/credential/create"
	"nfxedge/modules/sites/infrastructure/repository/credential/delete"
	"nfxedge/modules/sites/infrastructure/repository/credential/get"
	"nfxedge/modules/sites/infrastructure/repository/credential/update"

	"gorm.io/gorm"
)

func NewRepo(db *gorm.DB) *credDomain.Repo {
	return &credDomain.Repo{
		Create: create.NewHandler(db),
		Get:    get.NewHandler(db),
		Check:  check.NewHandler(db),
		Update: update.NewHandler(db),
		Delete: delete.NewHandler(db),
	}
}
