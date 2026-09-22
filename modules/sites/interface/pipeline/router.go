package pipeline

import (
	"context"

	"nfxedge/pkgs/kafkax/eventbus"
	"nfxedge/pkgs/logx"
)

type Router struct {
	*eventbus.EventRouter
	registry *Registry
}

func NewRouter(sub *eventbus.BusSubscriber, registry *Registry, config eventbus.EventRouterConfig) (*Router, error) {
	router, err := eventbus.NewEventRouter(sub, config)
	if err != nil {
		return nil, err
	}
	return &Router{EventRouter: router, registry: registry}, nil
}

func (r *Router) RegisterRoutes() {
	eventbus.RegisterHandler(r.EventRouter, r.registry.TLS.DiskRefresh)
	eventbus.RegisterHandler(r.EventRouter, r.registry.TLS.CacheInvalidate)
	eventbus.RegisterHandler(r.EventRouter, r.registry.TLS.ParseCertificate)
	eventbus.RegisterHandler(r.EventRouter, r.registry.File.DeleteFolder)
	eventbus.RegisterHandler(r.EventRouter, r.registry.File.DeleteFileOrFolder)
	eventbus.RegisterHandler(r.EventRouter, r.registry.File.ExportCertificate)
}

func (r *Router) Run(ctx context.Context) error {
	logx.S().Info("Starting pipeline router...")
	return r.Router.Run(ctx)
}

func (r *Router) Close() error {
	return r.Router.Close()
}
