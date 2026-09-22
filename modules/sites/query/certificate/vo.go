package certificate

import (
	"encoding/json"
	"time"
)

type CertificateVO struct {
	ID               string          `json:"id"`
	AccountID        *string         `json:"account_id,omitempty"`
	ProfileID        *string         `json:"profile_id,omitempty"`
	Domain           string          `json:"domain"`
	FolderName       *string         `json:"folder_name"`
	Status           string          `json:"status"`
	Email            *string         `json:"email"`
	Certificate      *string         `json:"certificate,omitempty"`
	PrivateKey       *string         `json:"private_key,omitempty"`
	SANs             json.RawMessage `json:"sans"`
	Issuer           *string         `json:"issuer"`
	NotBefore        *time.Time      `json:"not_before"`
	NotAfter         *time.Time      `json:"not_after"`
	IsValid          *bool           `json:"is_valid"`
	DaysRemaining    *int            `json:"days_remaining"`
	SANsChanged      bool            `json:"sans_changed"`
	LastErrorMessage *string         `json:"last_error_message"`
	LastErrorTime    *time.Time      `json:"last_error_time"`
	CreatedAt        time.Time       `json:"created_at"`
	UpdatedAt        time.Time       `json:"updated_at"`
}
