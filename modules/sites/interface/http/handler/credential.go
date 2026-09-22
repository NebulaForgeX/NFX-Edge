package handler

import (
	authconn "nfxedge/connections/auth"
	sitesmsg "nfxedge/messages/src/sites"
	credapp "nfxedge/modules/sites/application/credential"
	credCommands "nfxedge/modules/sites/application/credential/commands"
	"nfxedge/modules/sites/interface/http/dto/reqdto"
	"nfxedge/modules/sites/interface/http/dto/respdto"
	"nfxedge/pkgs/fiberx"
	"nfxedge/pkgs/httpx"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
)

type CredentialHandler struct {
	appSvc   *credapp.Service
	identity *authconn.Client
}

func NewCredentialHandler(appSvc *credapp.Service, identity *authconn.Client) *CredentialHandler {
	return &CredentialHandler{appSvc: appSvc, identity: identity}
}

func parseCredentialID(c fiber.Ctx) (uuid.UUID, error) {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return uuid.Nil, fiber.ErrBadRequest
	}
	return id, nil
}

func (h *CredentialHandler) List(c fiber.Ctx) error {
	ac, ferr := accountProfile(c, h.identity)
	if ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	rows, err := h.appSvc.ListCredentials(c.Context(), ac.AccountID)
	if err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: map[string]any{"items": respdto.CredentialListToDTO(rows)}})
}

func (h *CredentialHandler) Get(c fiber.Ctx) error {
	ac, ferr := accountProfile(c, h.identity)
	if ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	id, err := parseCredentialID(c)
	if err != nil {
		return err
	}
	row, err := h.appSvc.GetCredential(c.Context(), ac.AccountID, id)
	if err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: respdto.CredentialROToDTO(row)})
}

func (h *CredentialHandler) Create(c fiber.Ctx) error {
	ac, ferr := accountProfile(c, h.identity)
	if ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	var req reqdto.CredentialWriteRequestDTO
	if err := c.Bind().Body(&req); err != nil {
		return err
	}
	row, err := h.appSvc.CreateCredential(c.Context(), req.ToCreateCmd(ac.AccountID, ac.ProfileID))
	if err != nil {
		return err
	}
	return fiberx.OK(c, sitesmsg.NAMECHEAP_CREDENTIAL_SAVED, httpx.SuccessOptions{Data: respdto.CredentialROToDTO(row)})
}

func (h *CredentialHandler) Update(c fiber.Ctx) error {
	ac, ferr := accountProfile(c, h.identity)
	if ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	id, err := parseCredentialID(c)
	if err != nil {
		return err
	}
	var req reqdto.CredentialWriteRequestDTO
	if err := c.Bind().Body(&req); err != nil {
		return err
	}
	row, err := h.appSvc.UpdateCredential(c.Context(), req.ToUpdateCmd(ac.AccountID, ac.ProfileID, id))
	if err != nil {
		return err
	}
	return fiberx.OK(c, sitesmsg.NAMECHEAP_CREDENTIAL_SAVED, httpx.SuccessOptions{Data: respdto.CredentialROToDTO(row)})
}

func (h *CredentialHandler) Delete(c fiber.Ctx) error {
	ac, ferr := accountProfile(c, h.identity)
	if ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	id, err := parseCredentialID(c)
	if err != nil {
		return err
	}
	out, err := h.appSvc.DeleteCredential(c.Context(), credCommands.DeleteCredentialCmd{AccountID: ac.AccountID, CredentialID: id})
	if err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: respdto.CommandROToDTO(out)})
}

func (h *CredentialHandler) Verify(c fiber.Ctx) error {
	ac, ferr := accountProfile(c, h.identity)
	if ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	id, err := parseCredentialID(c)
	if err != nil {
		return err
	}
	out, err := h.appSvc.VerifyCredential(c.Context(), credCommands.VerifyCredentialCmd{AccountID: ac.AccountID, CredentialID: id})
	if err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: respdto.CommandROToDTO(out)})
}
