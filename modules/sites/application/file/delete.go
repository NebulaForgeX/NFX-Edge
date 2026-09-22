package fileapp

import (
	"context"
	"os"
	"strings"

	sitesErr "nfxedge/errors/src/sites"
	sitesmsg "nfxedge/messages/src/sites"
)

func (s *Service) Delete(ctx context.Context, accountID, store, p, itemType string) CommandResult {
	if !s.pathAllowed(ctx, accountID, p) || firstSegment(p) == "" {
		return CommandResult{Success: false, Message: sitesErr.CodeFileNotFound, Store: store, Path: p, ItemType: itemType}
	}
	if store == "" {
		store = "websites"
	}
	if strings.EqualFold(itemType, "folder") || strings.EqualFold(itemType, "dir") || strings.EqualFold(itemType, "directory") {
		s.publishDeleteFolder(ctx, accountID, store, p)
	} else {
		s.publishDeleteFile(ctx, accountID, store, p, itemType)
	}
	if err := s.fs.Delete(store, p, itemType); err != nil {
		msg := sitesErr.CodeFileNotFound
		if os.IsPermission(err) {
			msg = sitesErr.CodeInvalidPath
		}
		return CommandResult{Success: false, Message: msg, Store: store, Path: p, ItemType: itemType}
	}
	return CommandResult{Success: true, Message: sitesmsg.FILE_DELETED, Store: store, Path: p, ItemType: itemType}
}
