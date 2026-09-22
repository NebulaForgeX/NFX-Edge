package list

import (
	"nfxedge/modules/sites/infrastructure/rdb/views"
	certQuery "nfxedge/modules/sites/query/certificate"
)

func toVO(r views.TlsCertificatesActiveView) certQuery.CertificateVO {
	return certQuery.CertificateVO{
		ID:               r.ID,
		AccountID:        r.AccountID,
		ProfileID:        r.ProfileID,
		Domain:           r.Domain,
		FolderName:       r.FolderName,
		Status:           r.Status,
		Email:            r.Email,
		Certificate:      r.Certificate,
		PrivateKey:       r.PrivateKey,
		SANs:             r.SANs,
		Issuer:           r.Issuer,
		NotBefore:        r.NotBefore,
		NotAfter:         r.NotAfter,
		IsValid:          r.IsValid,
		DaysRemaining:    r.DaysRemaining,
		SANsChanged:      r.SANsChanged,
		LastErrorMessage: r.LastErrorMessage,
		LastErrorTime:    r.LastErrorTime,
		CreatedAt:        r.CreatedAt,
		UpdatedAt:        r.UpdatedAt,
	}
}
