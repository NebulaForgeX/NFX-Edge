package commands

import "github.com/google/uuid"

type CreateCredentialCmd struct {
	AccountID uuid.UUID
	ProfileID uuid.UUID
	Label     string
	APIUser   string
	APIKey    string
	ClientIP  string
	Sandbox   bool
}

type UpdateCredentialCmd struct {
	AccountID    uuid.UUID
	ProfileID    uuid.UUID
	CredentialID uuid.UUID
	Label        string
	APIUser      string
	APIKey       string
	ClientIP     string
	Sandbox      bool
}

type DeleteCredentialCmd struct {
	AccountID    uuid.UUID
	CredentialID uuid.UUID
}

type VerifyCredentialCmd struct {
	AccountID    uuid.UUID
	CredentialID uuid.UUID
}
