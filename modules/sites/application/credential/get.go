package credential

import (
	"context"

	sitesErr "nfxedge/errors/src/sites"
	"nfxedge/modules/sites/application/credential/results"
	credQuery "nfxedge/modules/sites/query/credential"

	"github.com/google/uuid"
)

func (s *Service) ListCredentials(ctx context.Context, accountID uuid.UUID) ([]results.CredentialRO, error) {
	rows, err := s.credQuery.List.AllByAccountID(ctx, accountID)
	if err != nil {
		return nil, err
	}
	out := make([]results.CredentialRO, 0, len(rows))
	for i := range rows {
		out = append(out, results.CredentialMapper(&rows[i]))
	}
	return out, nil
}

func (s *Service) GetCredential(ctx context.Context, accountID, credentialID uuid.UUID) (*results.CredentialRO, error) {
	vo, err := s.ownedVO(ctx, accountID, credentialID)
	if err != nil {
		return nil, err
	}
	ro := results.CredentialMapper(vo)
	return &ro, nil
}

func (s *Service) ownedVO(ctx context.Context, accountID, credentialID uuid.UUID) (*credQuery.CredentialVO, error) {
	vo, err := s.credQuery.List.ByID(ctx, credentialID)
	if err != nil {
		return nil, err
	}
	if vo == nil || vo.AccountID != accountID {
		return nil, sitesErr.ErrNamecheapCredentialNotFound
	}
	return vo, nil
}

func (s *Service) ownedSecret(ctx context.Context, accountID, credentialID uuid.UUID) (*credQuery.SecretVO, error) {
	sec, err := s.credQuery.List.SecretByID(ctx, credentialID)
	if err != nil {
		return nil, err
	}
	if sec == nil || sec.AccountID != accountID || sec.APIKey == "" {
		return nil, sitesErr.ErrNamecheapCredentialNotFound
	}
	return sec, nil
}
