package handler

import (
	"context"

	"nfxedge/events"
	fileapp "nfxedge/modules/sites/application/file"

	"github.com/ThreeDotsLabs/watermill/message"
)

type FileHandler struct {
	svc *fileapp.Service
}

func NewFileHandler(svc *fileapp.Service) *FileHandler {
	return &FileHandler{svc: svc}
}

func (h *FileHandler) DeleteFolder(ctx context.Context, evt events.DeleteFolderEvent, _ *message.Message) error {
	return h.svc.HandleDeleteFolder(ctx, evt)
}

func (h *FileHandler) DeleteFileOrFolder(ctx context.Context, evt events.DeleteFileOrFolderEvent, _ *message.Message) error {
	return h.svc.HandleDeleteFileOrFolder(ctx, evt)
}

func (h *FileHandler) ExportCertificate(ctx context.Context, evt events.ExportCertificateEvent, _ *message.Message) error {
	return h.svc.HandleExportCertificate(ctx, evt)
}
