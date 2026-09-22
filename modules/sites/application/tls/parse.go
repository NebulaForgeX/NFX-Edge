package tlsapp

import (
	sitesErr "nfxedge/errors/src/sites"
	sitesmsg "nfxedge/messages/src/sites"
	pemx "nfxedge/modules/sites/infrastructure/pem"
)

func (s *Service) ParsePreview(pem string) ParsePreviewResult {
	info, err := pemx.Parse(pem)
	if err != nil {
		return ParsePreviewResult{Success: false, Message: sitesErr.CodeCertificateParseFailed}
	}
	valid := info.IsValid
	days := info.DaysRemaining
	return ParsePreviewResult{
		Success: true, Message: sitesmsg.CERTIFICATE_PARSED,
		Domain: info.CommonName, SANs: info.AllDomains, Issuer: info.Issuer,
		NotBefore: info.NotBefore, NotAfter: info.NotAfter,
		IsValid: &valid, DaysRemaining: &days,
	}
}
