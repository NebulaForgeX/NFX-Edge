package tlsapp

import (
	"context"
	"strings"
	"time"

	sysErr "nfxedge/errors/src/sys"
	"nfxedge/events"
	sitesmsg "nfxedge/messages/src/sites"
	"nfxedge/modules/sites/infrastructure/disk"
	pemx "nfxedge/modules/sites/infrastructure/pem"
	"nfxedge/pkgs/transaction"
)

func (s *Service) HandleParseCertificate(ctx context.Context, evt events.ParseCertificateEvent) error {
	row, err := s.query.List.ByID(ctx, evt.ID)
	if err != nil || row == nil {
		return err
	}
	if row.Certificate == nil || strings.TrimSpace(*row.Certificate) == "" {
		return nil
	}
	info, err := pemx.Parse(*row.Certificate)
	if err != nil {
		return err
	}
	valid := info.IsValid
	days := info.DaysRemaining
	issuer := info.Issuer
	return s.tx.WithUoW(ctx, func(ctx context.Context, uow transaction.UoW) error {
		return s.repoFactory.Certificate(uow).Update.Fields(ctx, evt.ID, map[string]any{
			"issuer": issuer, "not_before": info.NotBefore, "not_after": info.NotAfter,
			"is_valid": valid, "days_remaining": days, "sans": pemx.SansJSON(info.AllDomains), "updated_at": time.Now(),
		})
	})
}

func (s *Service) ImportFromDisk(ctx context.Context) CommandResult {
	found, err := disk.ScanWebsites(s.baseDir)
	if err != nil {
		return CommandResult{Success: false, Message: sysErr.ErrStorageInternal.Code}
	}
	processed := 0
	err = s.tx.WithUoW(ctx, func(ctx context.Context, uow transaction.UoW) error {
		certificateRepo := s.repoFactory.Certificate(uow)
		for _, f := range found {
			cur, err := certificateRepo.Get.ByDomain(ctx, f.Info.CommonName)
			if err != nil || cur == nil {
				continue
			}
			now := time.Now()
			valid := f.Info.IsValid
			days := f.Info.DaysRemaining
			issuer := f.Info.Issuer
			folder := f.Folder
			cert, key := f.CertPEM, f.KeyPEM
			if err := certificateRepo.Update.Fields(ctx, cur.State().ID, map[string]any{
				"folder_name": folder, "certificate": cert, "private_key": key,
				"sans": pemx.SansJSON(f.Info.AllDomains), "issuer": issuer,
				"not_before": f.Info.NotBefore, "not_after": f.Info.NotAfter,
				"is_valid": valid, "days_remaining": days, "updated_at": now,
			}); err != nil {
				return err
			}
			processed++
		}
		return nil
	})
	if err != nil {
		return CommandResult{Success: false, Message: sysErr.ErrDatabaseInternal.Code}
	}
	return CommandResult{Success: true, Message: sitesmsg.CERTIFICATES_IMPORTED, Processed: processed}
}

func (s *Service) HandleDiskRefresh(ctx context.Context, _ events.DiskRefreshEvent) error {
	s.ImportFromDisk(ctx)
	return nil
}

func (s *Service) RefreshDaysRemaining(ctx context.Context) error {
	return s.tx.WithUoW(ctx, func(ctx context.Context, uow transaction.UoW) error {
		certificateRepo := s.repoFactory.Certificate(uow)
		rows, err := certificateRepo.Get.All(ctx)
		if err != nil {
			return err
		}
		for _, row := range rows {
			st := row.State()
			if st.NotAfter == nil {
				continue
			}
			days := int(time.Until(*st.NotAfter).Hours() / 24)
			valid := days > 0
			if err := certificateRepo.Update.Fields(ctx, st.ID, map[string]any{
				"days_remaining": days, "is_valid": valid, "updated_at": time.Now(),
			}); err != nil {
				return err
			}
		}
		return nil
	})
}
