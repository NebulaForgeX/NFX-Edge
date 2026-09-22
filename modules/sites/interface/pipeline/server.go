package pipeline

import (
	"time"

	fileapp "nfxedge/modules/sites/application/file"
	tlsapp "nfxedge/modules/sites/application/tls"
	"nfxedge/modules/sites/interface/pipeline/handler"
	"nfxedge/pkgs/kafkax"
	"nfxedge/pkgs/kafkax/eventbus"
	"nfxedge/pkgs/logx"

	wmMiddleware "github.com/ThreeDotsLabs/watermill/message/router/middleware"
)

type Deps interface {
	KafkaConfig() *kafkax.Config
	TLSSvc() *tlsapp.Service
	FileSvc() *fileapp.Service
}

func NewServer(d Deps) (*Router, error) {
	sub, err := kafkax.NewSubscriber(d.KafkaConfig())
	if err != nil {
		return nil, err
	}
	registry := &Registry{
		TLS:  handler.NewTLSHandler(d.TLSSvc()),
		File: handler.NewFileHandler(d.FileSvc()),
	}
	router, err := NewRouter(sub, registry, eventbus.EventRouterConfig{
		CloseTimeout: 10 * time.Second,
		Logger:       logx.NewZapWatermillLogger(logx.L()),
	})
	if err != nil {
		return nil, err
	}
	router.AddMiddleware(
		wmMiddleware.CorrelationID,
		wmMiddleware.Recoverer,
		wmMiddleware.Retry{MaxRetries: 3, InitialInterval: 200 * time.Millisecond, MaxInterval: 2 * time.Second, Multiplier: 2.0}.Middleware,
		wmMiddleware.Timeout(30*time.Second),
	)
	router.RegisterRoutes()
	return router, nil
}
