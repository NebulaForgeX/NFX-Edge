package fileapp

import (
	"context"

	"nfxedge/events"
	"nfxedge/pkgs/kafkax/eventbus"
)

func (s *Service) HandleDeleteFolder(ctx context.Context, evt events.DeleteFolderEvent) error {
	path := evt.Path
	if path == "" {
		path = evt.FolderName
	}
	if evt.AccountID == "" || !s.pathAllowed(ctx, evt.AccountID, path) {
		return nil
	}
	return s.fs.Delete(evt.Store, path, "folder")
}

func (s *Service) HandleDeleteFileOrFolder(ctx context.Context, evt events.DeleteFileOrFolderEvent) error {
	if evt.AccountID == "" || !s.pathAllowed(ctx, evt.AccountID, evt.Path) {
		return nil
	}
	return s.fs.Delete(evt.Store, evt.Path, evt.ItemType)
}

func (s *Service) publishDeleteFolder(ctx context.Context, accountID, store, path string) {
	if s.bus == nil {
		return
	}
	_ = eventbus.PublishEvent(ctx, s.bus, events.DeleteFolderEvent{AccountID: accountID, Store: store, Path: path, FolderName: path})
}

func (s *Service) publishDeleteFile(ctx context.Context, accountID, store, path, itemType string) {
	if s.bus == nil {
		return
	}
	_ = eventbus.PublishEvent(ctx, s.bus, events.DeleteFileOrFolderEvent{AccountID: accountID, Store: store, Path: path, ItemType: itemType})
}

func (s *Service) publishExport(ctx context.Context, accountID, id string) {
	if s.bus == nil {
		return
	}
	_ = eventbus.PublishEvent(ctx, s.bus, events.ExportCertificateEvent{AccountID: accountID, ID: id})
}
