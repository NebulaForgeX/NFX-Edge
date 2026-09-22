package reqdto

type FileExportSingleRequestDTO struct {
	CertificateID string `json:"certificate_id"`
}

type FileDeleteRequestDTO struct {
	Store    string `json:"store"`
	Path     string `json:"path"`
	ItemType string `json:"item_type"`
}
