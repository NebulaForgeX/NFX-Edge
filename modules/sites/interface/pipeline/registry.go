package pipeline

import (
	"nfxedge/modules/sites/interface/pipeline/handler"
)

type Registry struct {
	TLS  *handler.TLSHandler
	File *handler.FileHandler
}
