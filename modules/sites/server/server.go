package server

import (
	"context"
	"errors"
	"net"
	"net/http"
	"strconv"

	"nfxedge/modules/sites/config"
	grpcInterfaces "nfxedge/modules/sites/interface/grpc"
	httpInterfaces "nfxedge/modules/sites/interface/http"
	pipelineInterfaces "nfxedge/modules/sites/interface/pipeline"
	"nfxedge/pkgs/logx"

	"github.com/gofiber/fiber/v3"
	"golang.org/x/sync/errgroup"
	"google.golang.org/grpc"
)

func RunServer(ctx context.Context, cfg *config.Config) error {
	deps, err := NewDeps(ctx, cfg)
	if err != nil {
		return err
	}
	defer deps.Cleanup()

	httpSrv := httpInterfaces.NewHTTPServer(deps, cfg.Server.AccessLog)
	grpcSrv := grpcInterfaces.NewServer(deps)
	eventbusSrv, err := pipelineInterfaces.NewServer(deps)
	if err != nil {
		return err
	}

	httpAddr := net.JoinHostPort(cfg.Server.Host, strconv.Itoa(cfg.Server.HTTPPort))
	grpcAddr := net.JoinHostPort(cfg.Server.Host, strconv.Itoa(cfg.Server.GRPCPort))
	grpcLis, err := net.Listen("tcp", grpcAddr)
	if err != nil {
		return err
	}
	defer grpcLis.Close()

	g, gctx := errgroup.WithContext(ctx)
	g.Go(func() error {
		logx.S().Infof("HTTP server listening on %s", httpAddr)
		if err := httpSrv.Listen(httpAddr, fiber.ListenConfig{DisableStartupMessage: true}); err != nil && !errors.Is(err, http.ErrServerClosed) {
			return err
		}
		return nil
	})
	g.Go(func() error {
		logx.S().Infof("gRPC server listening on %s", grpcAddr)
		if err := grpcSrv.Serve(grpcLis); err != nil && !errors.Is(err, grpc.ErrServerStopped) {
			return err
		}
		return nil
	})
	g.Go(func() error {
		return eventbusSrv.Run(ctx)
	})
	g.Go(func() error {
		<-gctx.Done()
		_ = httpSrv.Shutdown()
		grpcSrv.GracefulStop()
		_ = eventbusSrv.Close()
		return gctx.Err()
	})
	return g.Wait()
}
