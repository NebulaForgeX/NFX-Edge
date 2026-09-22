package tlsapp

import (
	"context"
	"time"

	sitesErr "nfxedge/errors/src/sites"
	sysErr "nfxedge/errors/src/sys"
	sitesmsg "nfxedge/messages/src/sites"
	certDomain "nfxedge/modules/sites/domain/certificate"
	pemx "nfxedge/modules/sites/infrastructure/pem"
	"nfxedge/pkgs/transaction"

	"github.com/google/uuid"
)

func (s *Service) CreateManual(ctx context.Context, accountID, profileID, domain, certificate, privateKey string, sans []string, folderName, email, issuer string) CommandResult {
	existing, err := s.query.List.ByDomain(ctx, domain)
	if err != nil {
		return CommandResult{Success: false, Message: sysErr.ErrDatabaseInternal.Code}
	}
	if existing != nil {
		return CommandResult{Success: false, Message: sitesErr.CodeCertificateAlreadyExists}
	}
	info, err := pemx.Parse(certificate)
	if err != nil {
		return CommandResult{Success: false, Message: sitesErr.CodeCertificateParseFailed}
	}
	if issuer == "" {
		issuer = info.Issuer
	}
	if len(sans) == 0 {
		sans = info.AllDomains
	}
	now := time.Now()
	valid := info.IsValid
	days := info.DaysRemaining
	id := uuid.NewString()
	st := certDomain.State{
		ID: id, Domain: domain, Status: "success",
		CertPEM: &certificate, KeyPEM: &privateKey, SANs: pemx.SansJSON(sans),
		Issuer: &issuer, NotBefore: info.NotBefore, NotAfter: info.NotAfter,
		IsValid: &valid, DaysRemaining: &days, CreatedAt: now, UpdatedAt: now,
	}
	if folderName != "" {
		st.FolderName = &folderName
	}
	if email != "" {
		st.Email = &email
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
	return CommandResult{Success: true, Message: sitesmsg.CERTIFICATE_CREATED, CertificateID: id}
}
