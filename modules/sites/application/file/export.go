package fileapp

import (
	"context"

	sitesErr "nfxedge/errors/src/sites"
	sysErr "nfxedge/errors/src/sys"
	"nfxedge/events"
	sitesmsg "nfxedge/messages/src/sites"
	"nfxedge/pkgs/logx"
)

func (s *Service) ExportSingle(ctx context.Context, accountID, certificateID string) CommandResult {
	row, err := s.certs.List.ByID(ctx, certificateID)
	if err != nil || row == nil || row.AccountID == nil || *row.AccountID != accountID {
		return CommandResult{Success: false, Message: sitesErr.CodeCertificateNotFound, CertificateID: certificateID}
	}
	folder := row.Domain
	if row.FolderName != nil && *row.FolderName != "" {
		folder = *row.FolderName
	}
	cert, key := "", ""
	if row.Certificate != nil {
		cert = *row.Certificate
	}
	if row.PrivateKey != nil {
		key = *row.PrivateKey
	}
	if err := s.fs.WriteCertificate(folder, cert, key); err != nil {
		logx.S().Errorf("export websites folder=%s: %v", folder, err)
		return CommandResult{Success: false, Message: sysErr.ErrStorageInternal.Code, CertificateID: certificateID}
	}
	s.publishExport(ctx, accountID, certificateID)
	return CommandResult{
		Success: true, Message: sitesmsg.CERTIFICATE_EXPORTED,
		Store: "websites", FolderName: folder, Domain: row.Domain, CertificateID: certificateID,
	}
}

func (s *Service) ExportAll(ctx context.Context, accountID string) CommandResult {
	rows, _, err := s.certs.List.Page(ctx, accountID, "", 0, 5000, false)
	if err != nil {
		return CommandResult{Success: false, Message: sitesErr.CodeFileNotFound}
	}
	n := 0
	for _, row := range rows {
		if s.ExportSingle(ctx, accountID, row.ID).Success {
			n++
		}
	}
	return CommandResult{Success: true, Message: sitesmsg.CERTIFICATES_EXPORTED, Exported: n}
}

func (s *Service) HandleExportCertificate(ctx context.Context, evt events.ExportCertificateEvent) error {
	row, err := s.certs.List.ByID(ctx, evt.ID)
	if err != nil || row == nil || row.AccountID == nil {
		return err
	}
	if evt.AccountID != "" && *row.AccountID != evt.AccountID {
		return nil
	}
	s.ExportSingle(ctx, *row.AccountID, evt.ID)
	return nil
}
