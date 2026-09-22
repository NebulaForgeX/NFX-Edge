package tlsapp

import (
	"context"

	sitesErr "nfxedge/errors/src/sites"
)

func (s *Service) List(ctx context.Context, accountID string, offset, limit int) (ListResult, error) {
	if limit <= 0 {
		limit = 20
	}
	rows, total, err := s.query.List.Page(ctx, accountID, "", offset, limit, true)
	if err != nil {
		return ListResult{}, err
	}
	return ListResult{Items: rows, Total: total}, nil
}

func (s *Service) Detail(ctx context.Context, accountID, id string) (*Certificate, error) {
	row, err := s.query.List.ByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if !owned(row, accountID) {
		return nil, sitesErr.ErrCertificateNotFound
	}
	return row, nil
}

func (s *Service) Search(ctx context.Context, accountID, keyword string, offset, limit int) (ListResult, error) {
	if limit <= 0 {
		limit = 20
	}
	rows, total, err := s.query.List.Page(ctx, accountID, keyword, offset, limit, false)
	if err != nil {
		return ListResult{}, err
	}
	return ListResult{Items: rows, Total: total}, nil
}
