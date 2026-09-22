package grpc

import (
	"nfxedge/modules/sites/application/resource"
	grpcHandler "nfxedge/modules/sites/interface/grpc/handler"
	"nfxedge/pkgs/grpcx/interceptor"
	"nfxedge/pkgs/security/token"
	"nfxedge/pkgs/security/token/servertoken"
	healthpb "nfxedge/protos/gen/common/health"

	"google.golang.org/grpc"
)

type Deps interface {
	ResourceSvc() *resource.Service
	ServerTokenVerifier() token.Verifier
}

func NewServer(d Deps) *grpc.Server {
	s := grpc.NewServer(grpc.ChainUnaryInterceptor(
		interceptor.UnaryErrorHandler(),
		servertoken.UnaryAuthInterceptor(d.ServerTokenVerifier()),
	))
	healthpb.RegisterHealthServiceServer(s, grpcHandler.NewHealthHandler(d.ResourceSvc(), "sites"))
	return s
}
