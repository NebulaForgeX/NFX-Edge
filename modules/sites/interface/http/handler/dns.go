package handler

import (
	authconn "nfxedge/connections/auth"
	sitesmsg "nfxedge/messages/src/sites"
	dnsapp "nfxedge/modules/sites/application/dns"
	dnsCommands "nfxedge/modules/sites/application/dns/commands"
	"nfxedge/modules/sites/interface/http/dto/reqdto"
	"nfxedge/modules/sites/interface/http/dto/respdto"
	"nfxedge/pkgs/fiberx"
	"nfxedge/pkgs/httpx"

	"github.com/gofiber/fiber/v3"
)

type DNSHandler struct {
	appSvc   *dnsapp.Service
	identity *authconn.Client
}

func NewDNSHandler(appSvc *dnsapp.Service, identity *authconn.Client) *DNSHandler {
	return &DNSHandler{appSvc: appSvc, identity: identity}
}

func (h *DNSHandler) scoped(c fiber.Ctx) (dnsCommands.ListDomainsCmd, error) {
	ac, ferr := accountProfile(c, h.identity)
	if ferr != nil {
		return dnsCommands.ListDomainsCmd{}, fiberx.ErrorFromErrx(c, ferr)
	}
	id, err := parseCredentialID(c)
	if err != nil {
		return dnsCommands.ListDomainsCmd{}, err
	}
	return dnsCommands.ListDomainsCmd{AccountID: ac.AccountID, CredentialID: id}, nil
}

func (h *DNSHandler) ListDomains(c fiber.Ctx) error {
	cmd, err := h.scoped(c)
	if err != nil {
		return err
	}
	items, err := h.appSvc.ListDomains(c.Context(), cmd)
	if err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: respdto.DomainsROToDTO(items)})
}

func (h *DNSHandler) GetBalances(c fiber.Ctx) error {
	cmd, err := h.scoped(c)
	if err != nil {
		return err
	}
	row, err := h.appSvc.GetBalances(c.Context(), cmd)
	if err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: respdto.BalancesROToDTO(row)})
}

func (h *DNSHandler) ListSSL(c fiber.Ctx) error {
	cmd, err := h.scoped(c)
	if err != nil {
		return err
	}
	items, err := h.appSvc.ListSSL(c.Context(), cmd)
	if err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: respdto.SSLROToDTO(items)})
}

func (h *DNSHandler) GetDomain(c fiber.Ctx) error {
	cmd, err := h.scoped(c)
	if err != nil {
		return err
	}
	row, err := h.appSvc.GetDomain(c.Context(), dnsCommands.GetDomainCmd{
		AccountID: cmd.AccountID, CredentialID: cmd.CredentialID, Domain: c.Params("domain"),
	})
	if err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: respdto.DomainDetailROToDTO(row)})
}

func (h *DNSHandler) hostCmd(c fiber.Ctx) (dnsCommands.HostCmd, error) {
	cmd, err := h.scoped(c)
	if err != nil {
		return dnsCommands.HostCmd{}, err
	}
	var req reqdto.HostWriteRequestDTO
	if err := c.Bind().Body(&req); err != nil {
		return dnsCommands.HostCmd{}, err
	}
	return dnsCommands.HostCmd{
		AccountID: cmd.AccountID, CredentialID: cmd.CredentialID, Domain: req.Domain,
		HostID: req.HostID, Name: req.Name, Type: req.Type, Address: req.Address, TTL: req.TTL, MXPref: req.MXPref,
	}, nil
}

func (h *DNSHandler) AddHost(c fiber.Ctx) error {
	cmd, err := h.hostCmd(c)
	if err != nil {
		return err
	}
	if err := h.appSvc.AddHost(c.Context(), cmd); err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: respdto.CommandDTO{Success: true, Message: sitesmsg.NAMECHEAP_HOST_ADDED}})
}

func (h *DNSHandler) UpdateHost(c fiber.Ctx) error {
	cmd, err := h.hostCmd(c)
	if err != nil {
		return err
	}
	if err := h.appSvc.UpdateHost(c.Context(), cmd); err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: respdto.CommandDTO{Success: true, Message: sitesmsg.NAMECHEAP_HOST_UPDATED}})
}

func (h *DNSHandler) DeleteHost(c fiber.Ctx) error {
	cmd, err := h.hostCmd(c)
	if err != nil {
		return err
	}
	if err := h.appSvc.DeleteHost(c.Context(), cmd); err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: respdto.CommandDTO{Success: true, Message: sitesmsg.NAMECHEAP_HOST_DELETED}})
}

func (h *DNSHandler) bindBulk(c fiber.Ctx) (dnsCommands.BulkHostCmd, error) {
	cmd, err := h.scoped(c)
	if err != nil {
		return dnsCommands.BulkHostCmd{}, err
	}
	var req reqdto.HostBulkRequestDTO
	if err := c.Bind().Body(&req); err != nil {
		return dnsCommands.BulkHostCmd{}, err
	}
	adds := make([]dnsCommands.BulkHostAdd, 0, len(req.Adds))
	for _, row := range req.Adds {
		adds = append(adds, dnsCommands.BulkHostAdd{
			Name: row.Name, Type: row.Type, Address: row.Address, TTL: row.TTL, MXPref: row.MXPref,
			AddressSelf: row.AddressSelf,
		})
	}
	return dnsCommands.BulkHostCmd{
		AccountID: cmd.AccountID, CredentialID: cmd.CredentialID,
		Action: req.Action, Domains: req.Domains,
		Filter: dnsCommands.BulkHostFilter{
			IDs: req.Filter.IDs, Keys: req.Filter.Keys,
			Name: req.Filter.Name, Type: req.Filter.Type, Address: req.Filter.Address, TTL: req.Filter.TTL, MXPref: req.Filter.MXPref,
		},
		Patch: dnsCommands.BulkHostPatch{
			Address: req.Patch.Address, TTL: req.Patch.TTL, MXPref: req.Patch.MXPref, AddressSelf: req.Patch.AddressSelf,
		},
		Adds: adds,
	}, nil
}

func (h *DNSHandler) PreviewBulkHosts(c fiber.Ctx) error {
	cmd, err := h.bindBulk(c)
	if err != nil {
		return err
	}
	row, err := h.appSvc.PreviewBulkHosts(c.Context(), cmd)
	if err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: respdto.BulkHostROToDTO(row)})
}

func (h *DNSHandler) BulkHosts(c fiber.Ctx) error {
	cmd, err := h.bindBulk(c)
	if err != nil {
		return err
	}
	row, err := h.appSvc.BulkHosts(c.Context(), cmd)
	if err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: respdto.BulkHostROToDTO(row)})
}

func (h *DNSHandler) OutboundIP(c fiber.Ctx) error {
	if _, ferr := accountProfile(c, h.identity); ferr != nil {
		return fiberx.ErrorFromErrx(c, ferr)
	}
	out, err := h.appSvc.OutboundIPv4(c.Context())
	if err != nil {
		return err
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: respdto.OutboundIPROToDTO(out)})
}
