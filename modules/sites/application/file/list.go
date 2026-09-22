package fileapp

import (
	"context"
	"os"

	sitesErr "nfxedge/errors/src/sites"
	sitesmsg "nfxedge/messages/src/sites"
	fsstore "nfxedge/modules/sites/infrastructure/fs"
)

func (s *Service) ownedFolders(ctx context.Context, accountID string) (map[string]struct{}, error) {
	rows, _, err := s.certs.List.Page(ctx, accountID, "", 0, 5000, true)
	if err != nil {
		return nil, err
	}
	out := make(map[string]struct{}, len(rows))
	for _, row := range rows {
		name := row.Domain
		if row.FolderName != nil && *row.FolderName != "" {
			name = *row.FolderName
		}
		out[name] = struct{}{}
	}
	return out, nil
}

func (s *Service) pathAllowed(ctx context.Context, accountID, subpath string) bool {
	seg := firstSegment(subpath)
	if seg == "" {
		return true
	}
	folders, err := s.ownedFolders(ctx, accountID)
	if err != nil {
		return false
	}
	_, ok := folders[seg]
	return ok
}

func (s *Service) List(ctx context.Context, accountID, subpath string) CommandResult {
	if !s.pathAllowed(ctx, accountID, subpath) {
		return CommandResult{Success: false, Message: sitesErr.CodeFileNotFound, Items: []fsstore.Entry{}}
	}
	store, path, items, err := s.fs.List(subpath)
	if err != nil {
		msg := sitesErr.CodeFileNotFound
		if os.IsPermission(err) {
			msg = sitesErr.CodeInvalidPath
		}
		return CommandResult{Success: false, Message: msg, Items: []fsstore.Entry{}}
	}
	if firstSegment(subpath) == "" {
		folders, ferr := s.ownedFolders(ctx, accountID)
		if ferr != nil {
			return CommandResult{Success: false, Message: sitesErr.CodeFileNotFound, Items: []fsstore.Entry{}}
		}
		filtered := make([]fsstore.Entry, 0, len(items))
		for _, item := range items {
			if _, ok := folders[item.Name]; ok {
				filtered = append(filtered, item)
			}
		}
		items = filtered
	}
	return CommandResult{Success: true, Message: sitesmsg.DIRECTORY_LISTED, Store: store, Path: path, Items: items}
}
