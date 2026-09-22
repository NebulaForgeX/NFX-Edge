package sites

import "nfxedge/pkgs/errx"

const (
	CodeNamecheapCredentialRequired = "NAMECHEAP_CREDENTIAL_REQUIRED"
	CodeNamecheapCredentialNotFound = "NAMECHEAP_CREDENTIAL_NOT_FOUND"
	CodeInvalidNamecheapCredential  = "INVALID_NAMECHEAP_CREDENTIAL"
	CodeInvalidIPv4                 = "INVALID_IPV4"
	CodeInvalidDomain               = "INVALID_DOMAIN"
	CodeInvalidHost                 = "INVALID_HOST"
	CodeInvalidHostAction           = "INVALID_HOST_ACTION"
	CodeInvalidHostFilter           = "INVALID_HOST_FILTER"
	CodeInvalidHostCollection       = "INVALID_HOST_COLLECTION"
	CodeOutboundIPFailed            = "OUTBOUND_IP_FAILED"
	CodeNamecheapAPI                = "NAMECHEAP_API"
)

var (
	ErrNamecheapCredentialRequired = errx.FailedPrecond(CodeNamecheapCredentialRequired, "save Namecheap API credentials first")
	ErrNamecheapCredentialNotFound = errx.NotFound(CodeNamecheapCredentialNotFound, "namecheap credential not found")
	ErrInvalidNamecheapCredential  = errx.InvalidArg(CodeInvalidNamecheapCredential, "api_user and client_ip are required")
	ErrInvalidIPv4                 = errx.InvalidArg(CodeInvalidIPv4, "ip must be a valid IPv4 address")
	ErrInvalidDomain               = errx.InvalidArg(CodeInvalidDomain, "domain is required")
	ErrInvalidHost                 = errx.InvalidArg(CodeInvalidHost, "host type and address are required")
	ErrInvalidHostAction           = errx.InvalidArg(CodeInvalidHostAction, "action must be update, add, or delete")
	ErrInvalidHostFilter           = errx.InvalidArg(CodeInvalidHostFilter, "delete requires a host filter")
	ErrInvalidHostCollection       = errx.InvalidArg(CodeInvalidHostCollection, "select at least one domain")
	ErrOutboundIPFailed            = errx.Internal(CodeOutboundIPFailed, "failed to detect outbound IPv4")
	ErrNamecheapAPI                = errx.FailedPrecond(CodeNamecheapAPI, "Namecheap API failed")
)

/*
!NAMECHEAP_CREDENTIAL_REQUIRED
*en<save Namecheap API credentials first>
*zh<请先保存 Namecheap API 凭证>
*fr<enregistrez d'abord les identifiants API Namecheap>

!NAMECHEAP_CREDENTIAL_NOT_FOUND
*en<namecheap credential not found>
*zh<找不到 Namecheap 凭证>
*fr<identifiant Namecheap introuvable>

!INVALID_NAMECHEAP_CREDENTIAL
*en<api_user and client_ip are required>
*zh<需要填写 api_user 与 client_ip>
*fr<api_user et client_ip sont requis>

!INVALID_IPV4
*en<ip must be a valid IPv4 address>
*zh<必须是有效的 IPv4 地址>
*fr<l'adresse IPv4 est invalide>

!INVALID_DOMAIN
*en<domain is required>
*zh<域名不能为空>
*fr<le domaine est requis>

!INVALID_HOST
*en<host type and address are required>
*zh<需要填写 host 类型与地址>
*fr<le type et l'adresse de l'hôte sont requis>

!INVALID_HOST_ACTION
*en<action must be update, add, or delete>
*zh<操作必须是更新、添加或删除>
*fr<l'action doit être update, add ou delete>

!INVALID_HOST_FILTER
*en<delete requires a host filter>
*zh<删除需要填写筛选条件>
*fr<supprimer exige un filtre d'hôte>

!INVALID_HOST_COLLECTION
*en<select at least one domain>
*zh<请至少选择一个域名>
*fr<sélectionnez au moins un domaine>

!OUTBOUND_IP_FAILED
*en<failed to detect outbound IPv4>
*zh<无法检测出口 IPv4>
*fr<échec de la détection de l'IPv4 sortant>

!NAMECHEAP_API
*en<Namecheap API failed>
*zh<Namecheap API 调用失败>
*fr<échec de l'API Namecheap>
*/
