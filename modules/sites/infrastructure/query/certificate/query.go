package certificate

import (
	"nfxedge/modules/sites/infrastructure/query/certificate/list"
	certQuery "nfxedge/modules/sites/query/certificate"

	"gorm.io/gorm"
)

func NewQuery(db *gorm.DB) *certQuery.Query {
	return &certQuery.Query{List: list.NewHandler(db)}
}
