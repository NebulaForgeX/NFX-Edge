package reqdto

type AnalysisTLSRequestDTO struct {
	Certificate string `json:"certificate"`
	PrivateKey  string `json:"private_key"`
}
