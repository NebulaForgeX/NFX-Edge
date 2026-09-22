package credential

import (
	"nfxedge/modules/sites/infrastructure/query/credential/list"
	credQuery "nfxedge/modules/sites/query/credential"

	"gorm.io/gorm"
)

func NewQuery(db *gorm.DB) *credQuery.Query {
	return &credQuery.Query{List: list.NewHandler(db)}
}
