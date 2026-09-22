package handler

import (
	sitesErr "nfxedge/errors/src/sites"
	analysisapp "nfxedge/modules/sites/application/analysis"
	"nfxedge/modules/sites/interface/http/dto/reqdto"
	"nfxedge/pkgs/fiberx"
	"nfxedge/pkgs/httpx"

	"github.com/gofiber/fiber/v3"
)

type AnalysisHandler struct{ svc *analysisapp.Service }

func NewAnalysisHandler(svc *analysisapp.Service) *AnalysisHandler { return &AnalysisHandler{svc: svc} }

func (h *AnalysisHandler) TLS(c fiber.Ctx) error {
	var req reqdto.AnalysisTLSRequestDTO
	if err := c.Bind().Body(&req); err != nil {
		return err
	}
	out := h.svc.AnalyzeTLS(req.Certificate, req.PrivateKey)
	if !out.Success {
		return fiberx.ErrorFromErrx(c, sitesErr.ErrAnalysisFailed)
	}
	return fiberx.OK(c, "ok", httpx.SuccessOptions{Data: out})
}
