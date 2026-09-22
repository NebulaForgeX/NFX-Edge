package http

import (
	authconn "nfxedge/connections/auth"
	analysisapp "nfxedge/modules/sites/application/analysis"
	credapp "nfxedge/modules/sites/application/credential"
	dnsapp "nfxedge/modules/sites/application/dns"
	fileapp "nfxedge/modules/sites/application/file"
	tlsapp "nfxedge/modules/sites/application/tls"
	"nfxedge/modules/sites/interface/http/handler"
)

type Registry struct {
	TLS        *handler.TLSHandler
	File       *handler.FileHandler
	Analysis   *handler.AnalysisHandler
	Credential *handler.CredentialHandler
	DNS        *handler.DNSHandler
	I18n       *handler.I18nHandler
}

func NewRegistry(
	tlsSvc *tlsapp.Service,
	fileSvc *fileapp.Service,
	analysisSvc *analysisapp.Service,
	credSvc *credapp.Service,
	dnsSvc *dnsapp.Service,
	langs string,
	identity *authconn.Client,
) *Registry {
	return &Registry{
		TLS:        handler.NewTLSHandler(tlsSvc, identity),
		File:       handler.NewFileHandler(fileSvc, identity),
		Analysis:   handler.NewAnalysisHandler(analysisSvc),
		Credential: handler.NewCredentialHandler(credSvc, identity),
		DNS:        handler.NewDNSHandler(dnsSvc, identity),
		I18n:       handler.NewI18nHandler(langs),
	}
}
