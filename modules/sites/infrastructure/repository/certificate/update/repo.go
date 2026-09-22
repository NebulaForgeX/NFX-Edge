package update

import (
	certDomain "nfxedge/modules/sites/domain/certificate"

	"gorm.io/gorm"
)

type Handler struct{ db *gorm.DB }

func NewHandler(db *gorm.DB) certDomain.Update { return &Handler{db: db} }
