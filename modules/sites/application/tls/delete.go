package tlsapp

import (
	"context"

	sitesErr "nfxedge/errors/src/sites"
	sitesmsg "nfxedge/messages/src/sites"
	"nfxedge/pkgs/transaction"
)

func (s *Service) Delete(ctx context.Context, accountID, id string) CommandResult {
	cur, err := s.query.List.ByID(ctx, id)
	if err != nil || !owned(cur, accountID) {
		return CommandResult{Success: false, Message: sitesErr.CodeCertificateNotFound}
	}
	var n int64
	err = s.tx.WithUoW(ctx, func(ctx context.Context, uow transaction.UoW) error {
		var e error
		n, e = s.repoFactory.Certificate(uow).Delete.ByID(ctx, id)
		return e
	})
	if err != nil || n == 0 {
		return CommandResult{Success: false, Message: sitesErr.CodeCertificateNotFound}
	}
	return CommandResult{Success: true, Message: sitesmsg.CERTIFICATE_DELETED}
}
