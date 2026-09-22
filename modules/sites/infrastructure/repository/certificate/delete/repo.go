package delete

import (
	certDomain "nfxedge/modules/sites/domain/certificate"

	"gorm.io/gorm"
)

type Handler struct{ db *gorm.DB }

func NewHandler(db *gorm.DB) certDomain.Delete { return &Handler{db: db} }
