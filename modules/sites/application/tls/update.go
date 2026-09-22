package tlsapp

import (
	"context"
	"encoding/json"
	"strings"
	"time"

	sitesErr "nfxedge/errors/src/sites"
	sitesmsg "nfxedge/messages/src/sites"
	pemx "nfxedge/modules/sites/infrastructure/pem"
	"nfxedge/pkgs/transaction"
)

func (s *Service) UpdateManual(ctx context.Context, accountID, id string, sans []string, folderName, email *string) CommandResult {
	cur, err := s.query.List.ByID(ctx, id)
	if err != nil || !owned(cur, accountID) {
		return CommandResult{Success: false, Message: sitesErr.CodeCertificateNotFound}
	}
	updates := map[string]any{"updated_at": time.Now()}
	if sans != nil {
		var curSans []string
		_ = json.Unmarshal(cur.SANs, &curSans)
		updates["sans"] = pemx.SansJSON(sans)
		updates["sans_changed"] = strings.Join(curSans, ",") != strings.Join(sans, ",")
	}
	if folderName != nil {
		updates["folder_name"] = *folderName
	}
	if email != nil {
		updates["email"] = *email
	}
	err = s.tx.WithUoW(ctx, func(ctx context.Context, uow transaction.UoW) error {
		return s.repoFactory.Certificate(uow).Update.Fields(ctx, id, updates)
	})
	if err != nil {
		return CommandResult{Success: false, Message: sitesErr.CodeCertificateUpdateFailed}
	}
	return CommandResult{Success: true, Message: sitesmsg.CERTIFICATE_UPDATED}
}
