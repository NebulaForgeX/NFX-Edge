package list

import (
	credQuery "nfxedge/modules/sites/query/credential"

	"gorm.io/gorm"
)

type Handler struct{ db *gorm.DB }

func NewHandler(db *gorm.DB) credQuery.List { return &Handler{db: db} }
