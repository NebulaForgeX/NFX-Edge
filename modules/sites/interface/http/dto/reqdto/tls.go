package reqdto

type TLSApplyRequestDTO struct {
	Domain       string   `json:"domain"`
	Email        string   `json:"email"`
	FolderName   string   `json:"folder_name"`
	Webroot      string   `json:"webroot"`
	SANs         []string `json:"sans"`
	ForceRenewal bool     `json:"force_renewal"`
}

type TLSReapplyRequestDTO struct {
	CertificateID string `json:"certificate_id"`
	ForceRenewal  bool   `json:"force_renewal"`
}

type TLSCreateRequestDTO struct {
	Domain      string   `json:"domain"`
	Certificate string   `json:"certificate"`
	PrivateKey  string   `json:"private_key"`
	FolderName  string   `json:"folder_name"`
	Email       string   `json:"email"`
	Issuer      string   `json:"issuer"`
	SANs        []string `json:"sans"`
}

type TLSUpdateRequestDTO struct {
	CertificateID string   `json:"certificate_id"`
	SANs          []string `json:"sans"`
	FolderName    *string  `json:"folder_name"`
	Email         *string  `json:"email"`
}

type TLSDeleteRequestDTO struct {
	CertificateID string `json:"certificate_id"`
}

type TLSSearchRequestDTO struct {
	Keyword string `json:"keyword"`
	Offset  int    `json:"offset"`
	Limit   int    `json:"limit"`
}

type TLSParsePreviewRequestDTO struct {
	Certificate string `json:"certificate"`
}
