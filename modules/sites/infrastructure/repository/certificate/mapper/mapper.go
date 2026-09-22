package mapper

import (
	certDomain "nfxedge/modules/sites/domain/certificate"
	"nfxedge/modules/sites/infrastructure/rdb/models"
)

func CertificateDomainToModel(c *certDomain.Certificate) *models.Certificate {
	if c == nil {
		return nil
	}
	st := c.State()
	return &models.Certificate{
		ID:               st.ID,
		AccountID:        st.AccountID,
		ProfileID:        st.ProfileID,
		Domain:           st.Domain,
		FolderName:       st.FolderName,
		Status:           st.Status,
		Email:            st.Email,
		Certificate:      st.CertPEM,
		PrivateKey:       st.KeyPEM,
		SANs:             st.SANs,
		Issuer:           st.Issuer,
		NotBefore:        st.NotBefore,
		NotAfter:         st.NotAfter,
		IsValid:          st.IsValid,
		DaysRemaining:    st.DaysRemaining,
		SANsChanged:      st.SANsChanged,
		LastErrorMessage: st.LastErrorMessage,
		LastErrorTime:    st.LastErrorTime,
		CreatedAt:        st.CreatedAt,
		UpdatedAt:        st.UpdatedAt,
	}
}

func CertificateModelToDomain(m *models.Certificate) *certDomain.Certificate {
	if m == nil {
		return nil
	}
	return certDomain.NewFromState(certDomain.State{
		ID:               m.ID,
		AccountID:        m.AccountID,
		ProfileID:        m.ProfileID,
		Domain:           m.Domain,
		FolderName:       m.FolderName,
		Status:           m.Status,
		Email:            m.Email,
		CertPEM:          m.Certificate,
		KeyPEM:           m.PrivateKey,
		SANs:             m.SANs,
		Issuer:           m.Issuer,
		NotBefore:        m.NotBefore,
		NotAfter:         m.NotAfter,
		IsValid:          m.IsValid,
		DaysRemaining:    m.DaysRemaining,
		SANsChanged:      m.SANsChanged,
		LastErrorMessage: m.LastErrorMessage,
		LastErrorTime:    m.LastErrorTime,
		CreatedAt:        m.CreatedAt,
		UpdatedAt:        m.UpdatedAt,
	})
}
