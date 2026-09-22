package create

import (
	certDomain "nfxedge/modules/sites/domain/certificate"

	"gorm.io/gorm"
)

type Handler struct{ db *gorm.DB }

func NewHandler(db *gorm.DB) certDomain.Create { return &Handler{db: db} }
