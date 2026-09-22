package list

import (
	"nfxedge/modules/sites/infrastructure/rdb/views"
	credQuery "nfxedge/modules/sites/query/credential"
)

func toVO(r views.NamecheapCredentialsActiveView) credQuery.CredentialVO {
	return credQuery.CredentialVO{
		ID:               r.ID,
		AccountID:        r.AccountID,
		ProfileID:        r.ProfileID,
		Label:            r.Label,
		APIUser:          r.APIUser,
		UserName:         r.UserName,
		ClientIP:         r.ClientIP,
		Sandbox:          r.Sandbox,
		HasAPIKey:        r.APIKey != "",
		LastVerifiedAt:   r.LastVerifiedAt,
		LastErrorMessage: r.LastErrorMessage,
		CreatedAt:        r.CreatedAt,
		UpdatedAt:        r.UpdatedAt,
	}
}
