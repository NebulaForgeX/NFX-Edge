package list

import (
	certQuery "nfxedge/modules/sites/query/certificate"

	"gorm.io/gorm"
)

type Handler struct{ db *gorm.DB }

func NewHandler(db *gorm.DB) certQuery.List { return &Handler{db: db} }
