package credential

import (
	"context"

	"github.com/google/uuid"
)

type Query struct {
	List List
}

type List interface {
	AllByAccountID(ctx context.Context, accountID uuid.UUID) ([]CredentialVO, error)
	ByID(ctx context.Context, id uuid.UUID) (*CredentialVO, error)
	SecretByID(ctx context.Context, id uuid.UUID) (*SecretVO, error)
}
