package http

import (
	"encoding/json"
	"time"

	authconn "nfxedge/connections/auth"
	analysisapp "nfxedge/modules/sites/application/analysis"
	credapp "nfxedge/modules/sites/application/credential"
	dnsapp "nfxedge/modules/sites/application/dns"
	fileapp "nfxedge/modules/sites/application/file"
	tlsapp "nfxedge/modules/sites/application/tls"
	"nfxedge/pkgs/fiberx"
	"nfxedge/pkgs/fiberx/middleware"
	"nfxedge/pkgs/httpx"
	"nfxedge/pkgs/security/token"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
)

type httpDeps interface {
	TLSSvc() *tlsapp.Service
	FileSvc() *fileapp.Service
	AnalysisSvc() *analysisapp.Service
	CredentialSvc() *credapp.Service
	DNSSvc() *dnsapp.Service
	UserTokenVerifier() token.Verifier
	ErrorsLangsPath() string
	AuthClient() *authconn.Client
}

func NewHTTPServer(d httpDeps, accessLog httpx.AccessLogConfig) *fiber.App {
	app := fiber.New(fiber.Config{
		JSONEncoder: json.Marshal, JSONDecoder: json.Unmarshal, ErrorHandler: fiberx.ErrorHandler,
		ReadTimeout: 30 * time.Second, WriteTimeout: 420 * time.Second, IdleTimeout: 120 * time.Second,
	})
	app.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With", "X-Api-Key", "X-Request-ID"},
		AllowCredentials: false, ExposeHeaders: []string{"Content-Length", "Content-Type"}, MaxAge: 3600,
	}))
	app.Use(middleware.Logger(), middleware.AccessLog(accessLog), middleware.Recover())
	NewRouter(app, d.UserTokenVerifier(), NewRegistry(
		d.TLSSvc(), d.FileSvc(), d.AnalysisSvc(), d.CredentialSvc(), d.DNSSvc(),
		d.ErrorsLangsPath(), d.AuthClient(),
	)).RegisterRoutes()
	return app
}
