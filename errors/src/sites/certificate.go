package sites

import "nfxedge/pkgs/errx"

const (
	CodeCertificateNotFound            = "CERTIFICATE_NOT_FOUND"
	CodeCertificateAlreadyExists       = "CERTIFICATE_ALREADY_EXISTS"
	CodeCertificateUpdateFailed        = "CERTIFICATE_UPDATE_FAILED"
	CodeCertificateDomainEmailRequired = "CERTIFICATE_DOMAIN_EMAIL_REQUIRED"
	CodeCertificateIssueDisabled       = "CERTIFICATE_ISSUE_DISABLED"
	CodeCertificateIssueFailed         = "CERTIFICATE_ISSUE_FAILED"
	CodeCertificateParseFailed         = "CERTIFICATE_PARSE_FAILED"
)

var (
	ErrCertificateNotFound            = errx.NotFound(CodeCertificateNotFound, "certificate not found")
	ErrCertificateAlreadyExists       = errx.Conflict(CodeCertificateAlreadyExists, "certificate already exists")
	ErrCertificateUpdateFailed        = errx.Internal(CodeCertificateUpdateFailed, "failed to update certificate")
	ErrCertificateDomainEmailRequired = errx.InvalidArg(CodeCertificateDomainEmailRequired, "domain and email are required")
	ErrCertificateIssueDisabled       = errx.FailedPrecond(CodeCertificateIssueDisabled, "TLS issuance is not configured")
	ErrCertificateIssueFailed         = errx.Internal(CodeCertificateIssueFailed, "certificate issuance failed")
	ErrCertificateParseFailed         = errx.InvalidArg(CodeCertificateParseFailed, "failed to parse certificate")
)

/*
!CERTIFICATE_NOT_FOUND
*en<certificate not found>
*zh<证书不存在>
*fr<certificat introuvable>

!CERTIFICATE_ALREADY_EXISTS
*en<certificate already exists for this domain>
*zh<该域名已有证书>
*fr<un certificat existe déjà pour ce domaine>

!CERTIFICATE_UPDATE_FAILED
*en<failed to update certificate>
*zh<更新证书失败>
*fr<échec de la mise à jour du certificat>

!CERTIFICATE_DOMAIN_EMAIL_REQUIRED
*en<domain and email are required>
*zh<域名与邮箱不能为空>
*fr<le domaine et l'e-mail sont requis>

!CERTIFICATE_ISSUE_DISABLED
*en<TLS issuance is not configured>
*zh<TLS 签发未配置或未启用>
*fr<l'émission TLS n'est pas configurée>

!CERTIFICATE_ISSUE_FAILED
*en<certificate issuance failed>
*zh<证书签发失败>
*fr<échec de l'émission du certificat>

!CERTIFICATE_PARSE_FAILED
*en<failed to parse certificate>
*zh<解析证书失败>
*fr<échec de l'analyse du certificat>
*/
