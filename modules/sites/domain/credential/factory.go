package credential

import (
	"strings"
	"time"

	"github.com/google/uuid"
)

type NewCredentialParams struct {
	AccountID uuid.UUID
	ProfileID *uuid.UUID
	Label     string
	APIUser   string
	UserName  string
	APIKey    string
	ClientIP  string
	Sandbox   bool
}

func NewCredential(p NewCredentialParams) (*Credential, error) {
	p.Label = strings.TrimSpace(p.Label)
	p.APIUser = strings.TrimSpace(p.APIUser)
	p.APIKey = strings.TrimSpace(p.APIKey)
	p.ClientIP = strings.TrimSpace(p.ClientIP)
	p.UserName = p.APIUser
	if err := validateNewCredentialParams(p); err != nil {
		return nil, err
	}
	id, err := uuid.NewV7()
	if err != nil {
		return nil, err
	}
	now := time.Now().UTC()
	return NewCredentialFromState(CredentialState{
		ID:        id,
		AccountID: p.AccountID,
		ProfileID: p.ProfileID,
		Label:     p.Label,
		APIUser:   p.APIUser,
		UserName:  p.UserName,
		APIKey:    p.APIKey,
		ClientIP:  p.ClientIP,
		Sandbox:   p.Sandbox,
		CreatedAt: now,
		UpdatedAt: now,
	}), nil
}

func NewCredentialFromState(st CredentialState) *Credential {
	return &Credential{state: st}
}
