package handler

import (
	authconn "nfxedge/connections/auth"
	sitesErr "nfxedge/errors/src/sites"
	sysErr "nfxedge/errors/src/sys"
	"nfxedge/pkgs/errx"
	"nfxedge/pkgs/fiberx"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
)

type accountContext struct {
	AccountID uuid.UUID
	ProfileID uuid.UUID
}

func accountProfile(c fiber.Ctx, identity *authconn.Client) (accountContext, *errx.Error) {
	aid, ok := fiberx.AccountIDFromContext(c.Context())
	if !ok {
		return accountContext{}, sysErr.ErrInvalidToken
	}
	pid, ok := fiberx.ProfileIDFromContext(c.Context())
	if !ok {
		return accountContext{}, sysErr.ErrInvalidToken
	}
	scope, _ := fiberx.ProfileScopeFromContext(c.Context())
	if identity != nil {
		allowed, err := identity.Account.EnsureOwnedProfile(c.Context(), aid, pid, scope)
		if err != nil {
			return accountContext{}, sitesErr.ErrIdentityUnavailable
		}
		if !allowed {
			return accountContext{}, sitesErr.ErrProfileNotOwned
		}
	}
	return accountContext{AccountID: aid, ProfileID: pid}, nil
}
