package fileapp

import (
	"context"
	"os"

	sitesErr "nfxedge/errors/src/sites"
	sitesmsg "nfxedge/messages/src/sites"
)

func (s *Service) Content(ctx context.Context, accountID, subpath string) CommandResult {
	if !s.pathAllowed(ctx, accountID, subpath) || firstSegment(subpath) == "" {
		return CommandResult{Success: false, Message: sitesErr.CodeFileNotFound}
	}
	b, name, err := s.fs.Read(subpath)
	if err != nil {
		return CommandResult{Success: false, Message: sitesErr.CodeFileNotFound}
	}
	c, n := string(b), name
	return CommandResult{Success: true, Message: sitesmsg.FILE_READ, Content: &c, Filename: &n}
}

func (s *Service) Download(ctx context.Context, accountID, subpath string) (content []byte, filename, mimeType string, err error) {
	if !s.pathAllowed(ctx, accountID, subpath) || firstSegment(subpath) == "" {
		return nil, "", "", os.ErrNotExist
	}
	return s.fs.Download(subpath)
}
