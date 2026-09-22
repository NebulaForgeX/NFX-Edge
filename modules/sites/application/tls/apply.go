package tlsapp

import (
	"context"
	"encoding/json"
	"strings"
	"time"

	sitesErr "nfxedge/errors/src/sites"
	sysErr "nfxedge/errors/src/sys"
	sitesmsg "nfxedge/messages/src/sites"
	certDomain "nfxedge/modules/sites/domain/certificate"
	pemx "nfxedge/modules/sites/infrastructure/pem"
	"nfxedge/pkgs/logx"
	"nfxedge/pkgs/transaction"

	"github.com/google/uuid"
)

func (s *Service) Apply(ctx context.Context, accountID, profileID, domain, email string, sans []string, folderName string, force bool) CommandResult {
	domain = strings.ToLower(strings.TrimSpace(domain))
	email = strings.TrimSpace(email)
	if domain == "" || email == "" {
		return CommandResult{Success: false, Message: sitesErr.CodeCertificateDomainEmailRequired}
	}
	existing, err := s.query.List.ByDomain(ctx, domain)
	if err != nil {
		return CommandResult{Success: false, Message: sysErr.ErrDatabaseInternal.Code}
	}
	if existing != nil {
		if existing.AccountID != nil && *existing.AccountID != accountID {
			return CommandResult{Success: false, Message: sitesErr.CodeCertificateAlreadyExists}
		}
		sansSame := pemx.NamesEqual(requestedNames(domain, sans), storedNames(existing))
		if !sansSame {
			force = true
		}
		if owned(existing, accountID) && existing.Status == "success" && !force && sansSame {
			return CommandResult{Success: false, Message: sitesErr.CodeCertificateAlreadyExists}
		}
		return s.runIssue(ctx, accountID, profileID, domain, email, sans, folderName, force, existing.ID)
	}
	return s.runIssue(ctx, accountID, profileID, domain, email, sans, folderName, force, "")
}

func (s *Service) Reapply(ctx context.Context, accountID, id string, force bool) CommandResult {
	row, err := s.query.List.ByID(ctx, id)
	if err != nil || !owned(row, accountID) {
		return CommandResult{Success: false, Message: sitesErr.CodeCertificateNotFound}
	}
	email, folder := "", ""
	if row.Email != nil {
		email = *row.Email
	}
	if row.FolderName != nil {
		folder = *row.FolderName
	}
	var sans []string
	_ = json.Unmarshal(row.SANs, &sans)
	aid, pid := "", ""
	if row.AccountID != nil {
		aid = *row.AccountID
	}
	if row.ProfileID != nil {
		pid = *row.ProfileID
	}
	if row.SANsChanged || !pemx.NamesEqual(requestedNames(row.Domain, sans), storedNames(row)) {
		force = true
	}
	return s.runIssue(ctx, aid, pid, row.Domain, email, sans, folder, force, row.ID)
}

func requestedNames(domain string, sans []string) []string {
	return append([]string{domain}, sans...)
}

func storedNames(row *Certificate) []string {
	if row == nil {
		return nil
	}
	if row.Certificate != nil && strings.TrimSpace(*row.Certificate) != "" {
		if info, err := pemx.Parse(*row.Certificate); err == nil {
			return info.AllDomains
		}
	}
	var cur []string
	_ = json.Unmarshal(row.SANs, &cur)
	return cur
}

func (s *Service) runIssue(ctx context.Context, accountID, profileID, domain, email string, sans []string, folderName string, force bool, renewID string) CommandResult {
	if s.certbot == nil {
		return CommandResult{Success: false, Message: sitesErr.CodeCertificateIssueDisabled}
	}
	issued, err := s.certbot.Issue(ctx, domain, email, sans, folderName, force)
	if err != nil {
		msg := err.Error()
		out := CommandResult{Success: false, Message: sitesErr.CodeCertificateIssueFailed}
		if issued != nil {
			if issued.Message != "" {
				msg = issued.Message
			}
			out.RateLimit = issued.RateLimit
			out.RetryAfter = issued.RetryAfter
		}
		logx.S().Errorf("certbot issue failed domain=%s: %s", domain, msg)
		s.persistIssueFailure(ctx, accountID, profileID, domain, email, sans, folderName, renewID, msg)
		return out
	}
	info, err := pemx.Parse(issued.CertPEM)
	if err != nil {
		return CommandResult{Success: false, Message: sitesErr.CodeCertificateParseFailed}
	}
	now := time.Now()
	folder := folderName
	if folder == "" {
		folder = strings.ReplaceAll(domain, ".", "_")
	}
	valid := info.IsValid
	days := info.DaysRemaining
	issuer := info.Issuer
	certPEM, keyPEM := issued.CertPEM, issued.KeyPEM
	if renewID != "" {
		updates := map[string]any{
			"certificate": certPEM, "private_key": keyPEM, "sans": pemx.SansJSON(info.AllDomains), "issuer": issuer,
			"not_before": info.NotBefore, "not_after": info.NotAfter, "is_valid": valid,
			"days_remaining": days, "status": "success", "sans_changed": false, "updated_at": now,
		}
		if accountID != "" {
			updates["account_id"] = accountID
		}
		if profileID != "" {
			updates["profile_id"] = profileID
		}
		err := s.tx.WithUoW(ctx, func(ctx context.Context, uow transaction.UoW) error {
			return s.repoFactory.Certificate(uow).Update.Fields(ctx, renewID, updates)
		})
		if err != nil {
			return CommandResult{Success: false, Message: sysErr.ErrDatabaseInternal.Code}
		}
		s.publishParse(ctx, renewID)
		return CommandResult{Success: true, Message: sitesmsg.CERTIFICATE_ISSUED, CertificateID: renewID, Status: "success"}
	}
	id := uuid.NewString()
	st := certDomain.State{
		ID: id, Domain: domain, Status: "success", Email: &email, FolderName: &folder,
		CertPEM: &certPEM, KeyPEM: &keyPEM, SANs: pemx.SansJSON(info.AllDomains),
		Issuer: &issuer, NotBefore: info.NotBefore, NotAfter: info.NotAfter,
		IsValid: &valid, DaysRemaining: &days, CreatedAt: now, UpdatedAt: now,
	}
	if accountID != "" {
		st.AccountID = &accountID
	}
	if profileID != "" {
		st.ProfileID = &profileID
	}
	err = s.tx.WithUoW(ctx, func(ctx context.Context, uow transaction.UoW) error {
		return s.repoFactory.Certificate(uow).Create.New(ctx, certDomain.NewFromState(st))
	})
	if err != nil {
		return CommandResult{Success: false, Message: sysErr.ErrDatabaseInternal.Code}
	}
	s.publishParse(ctx, id)
	return CommandResult{Success: true, Message: sitesmsg.CERTIFICATE_ISSUED, CertificateID: id, Status: "success"}
}

func (s *Service) persistIssueFailure(ctx context.Context, accountID, profileID, domain, email string, sans []string, folderName, renewID, msg string) {
	now := time.Now()
	folder := folderName
	if folder == "" {
		folder = strings.ReplaceAll(domain, ".", "_")
	}
	if renewID != "" {
		err := s.tx.WithUoW(ctx, func(ctx context.Context, uow transaction.UoW) error {
			return s.repoFactory.Certificate(uow).Update.Fields(ctx, renewID, map[string]any{
				"status": "fail", "last_error_message": msg, "last_error_time": now, "updated_at": now,
			})
		})
		if err != nil {
			logx.S().Errorf("persist certbot failure for %s: %v", domain, err)
		}
		return
	}
	id := uuid.NewString()
	st := certDomain.State{
		ID: id, Domain: domain, Status: "fail", Email: &email, FolderName: &folder,
		SANs: pemx.SansJSON(sans), LastErrorMessage: &msg, LastErrorTime: &now,
		CreatedAt: now, UpdatedAt: now,
	}
	if accountID != "" {
		st.AccountID = &accountID
	}
	if profileID != "" {
		st.ProfileID = &profileID
	}
	err := s.tx.WithUoW(ctx, func(ctx context.Context, uow transaction.UoW) error {
		return s.repoFactory.Certificate(uow).Create.New(ctx, certDomain.NewFromState(st))
	})
	if err != nil {
		logx.S().Errorf("persist certbot failure row for %s: %v", domain, err)
	}
}
