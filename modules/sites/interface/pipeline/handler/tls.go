package handler

import (
	"context"

	"nfxedge/events"
	tlsapp "nfxedge/modules/sites/application/tls"

	"github.com/ThreeDotsLabs/watermill/message"
)

type TLSHandler struct {
	svc *tlsapp.Service
}

func NewTLSHandler(svc *tlsapp.Service) *TLSHandler {
	return &TLSHandler{svc: svc}
}

func (h *TLSHandler) DiskRefresh(ctx context.Context, evt events.DiskRefreshEvent, _ *message.Message) error {
	return h.svc.HandleDiskRefresh(ctx, evt)
}

func (h *TLSHandler) CacheInvalidate(ctx context.Context, evt events.CacheInvalidateEvent, _ *message.Message) error {
	return h.svc.HandleCacheInvalidate(ctx, evt)
}

func (h *TLSHandler) ParseCertificate(ctx context.Context, evt events.ParseCertificateEvent, _ *message.Message) error {
	return h.svc.HandleParseCertificate(ctx, evt)
}
