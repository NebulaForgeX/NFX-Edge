package http

import (
	"nfxedge/pkgs/fiberx/middleware"
	"nfxedge/pkgs/security/token"

	"github.com/gofiber/fiber/v3"
)

type Router struct {
	app           fiber.Router
	tokenVerifier token.Verifier
	handlers      *Registry
}

func NewRouter(app fiber.Router, v token.Verifier, h *Registry) *Router {
	return &Router{app: app, tokenVerifier: v, handlers: h}
}

func (r *Router) RegisterRoutes() {
	r.app.Get("/.well-known/acme-challenge/:token", r.handlers.TLS.ACMEChallenge)
	r.registerTLS()
	r.registerFile()
	r.registerAnalysis()
	r.registerDNS()
}

func (r *Router) registerLocales(g fiber.Router) {
	locales := g.Group("/locales")
	locales.Get("/:lang", r.handlers.I18n.GetErrorTranslations)
	messages := g.Group("/messages")
	messages.Get("/:lang", r.handlers.I18n.GetMessageTranslations)
}

func (r *Router) registerTLS() {
	tls := r.app.Group("/edge/tls")
	r.registerLocales(tls)
	me := tls.Group("", middleware.TokenAuth(r.tokenVerifier))
	me.Get("/check", r.handlers.TLS.List)
	me.Get("/detail-by-id/:certificateId", r.handlers.TLS.Detail)
	me.Post("/apply", r.handlers.TLS.Apply)
	me.Post("/reapply", r.handlers.TLS.Reapply)
	me.Post("/create", r.handlers.TLS.Create)
	me.Put("/update/manual-add", r.handlers.TLS.UpdateManual)
	me.Delete("/delete", r.handlers.TLS.Delete)
	me.Post("/search", r.handlers.TLS.Search)
	me.Post("/parse-preview", r.handlers.TLS.ParsePreview)
	me.Post("/invalidate-cache", r.handlers.TLS.InvalidateCache)
}

func (r *Router) registerFile() {
	files := r.app.Group("/edge/file")
	r.registerLocales(files)
	me := files.Group("", middleware.TokenAuth(r.tokenVerifier))
	me.Get("/list", r.handlers.File.List)
	me.Get("/content", r.handlers.File.Content)
	me.Get("/download", r.handlers.File.Download)
	me.Post("/export", r.handlers.File.Export)
	me.Post("/export-single", r.handlers.File.ExportSingle)
	me.Delete("/delete", r.handlers.File.Delete)
}

func (r *Router) registerAnalysis() {
	analysis := r.app.Group("/edge/analysis")
	r.registerLocales(analysis)
	me := analysis.Group("", middleware.TokenAuth(r.tokenVerifier))
	me.Post("/tls", r.handlers.Analysis.TLS)
}

func (r *Router) registerDNS() {
	dns := r.app.Group("/edge/dns")
	r.registerLocales(dns)
	me := dns.Group("", middleware.TokenAuth(r.tokenVerifier))
	me.Get("/outbound-ip", r.handlers.DNS.OutboundIP)
	me.Get("/credentials", r.handlers.Credential.List)
	me.Post("/credentials", r.handlers.Credential.Create)
	me.Get("/credentials/:id", r.handlers.Credential.Get)
	me.Put("/credentials/:id", r.handlers.Credential.Update)
	me.Delete("/credentials/:id", r.handlers.Credential.Delete)
	me.Post("/credentials/:id/verify", r.handlers.Credential.Verify)
	me.Get("/credentials/:id/balances", r.handlers.DNS.GetBalances)
	me.Get("/credentials/:id/domains", r.handlers.DNS.ListDomains)
	me.Get("/credentials/:id/ssl", r.handlers.DNS.ListSSL)
	me.Get("/credentials/:id/domains/:domain", r.handlers.DNS.GetDomain)
	me.Post("/credentials/:id/hosts", r.handlers.DNS.AddHost)
	me.Patch("/credentials/:id/hosts", r.handlers.DNS.UpdateHost)
	me.Delete("/credentials/:id/hosts", r.handlers.DNS.DeleteHost)
	me.Post("/credentials/:id/hosts/bulk/preview", r.handlers.DNS.PreviewBulkHosts)
	me.Post("/credentials/:id/hosts/bulk", r.handlers.DNS.BulkHosts)
}
