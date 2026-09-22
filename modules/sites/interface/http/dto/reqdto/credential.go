package reqdto

import (
	credCommands "nfxedge/modules/sites/application/credential/commands"

	"github.com/google/uuid"
)

type CredentialWriteRequestDTO struct {
	Label    string `json:"label"`
	APIUser  string `json:"api_user"`
	APIKey   string `json:"api_key"`
	ClientIP string `json:"client_ip"`
	Sandbox  bool   `json:"sandbox"`
}

func (r *CredentialWriteRequestDTO) ToCreateCmd(accountID, profileID uuid.UUID) credCommands.CreateCredentialCmd {
	return credCommands.CreateCredentialCmd{
		AccountID: accountID,
		ProfileID: profileID,
		Label:     r.Label,
		APIUser:   r.APIUser,
		APIKey:    r.APIKey,
		ClientIP:  r.ClientIP,
		Sandbox:   r.Sandbox,
	}
}

func (r *CredentialWriteRequestDTO) ToUpdateCmd(accountID, profileID, credentialID uuid.UUID) credCommands.UpdateCredentialCmd {
	return credCommands.UpdateCredentialCmd{
		AccountID:    accountID,
		ProfileID:    profileID,
		CredentialID: credentialID,
		Label:        r.Label,
		APIUser:      r.APIUser,
		APIKey:       r.APIKey,
		ClientIP:     r.ClientIP,
		Sandbox:      r.Sandbox,
	}
}
