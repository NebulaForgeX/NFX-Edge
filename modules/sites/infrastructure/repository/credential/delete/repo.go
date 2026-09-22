package delete

import (
	credDomain "nfxedge/modules/sites/domain/credential"

	"gorm.io/gorm"
)

type Handler struct{ db *gorm.DB }

func NewHandler(db *gorm.DB) credDomain.Delete { return &Handler{db: db} }
