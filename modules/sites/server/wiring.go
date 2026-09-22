package server

import (
	"context"
	"fmt"
	"time"

	authconn "nfxedge/connections/auth"
	analysisapp "nfxedge/modules/sites/application/analysis"
	credapp "nfxedge/modules/sites/application/credential"
	dnsapp "nfxedge/modules/sites/application/dns"
	fileapp "nfxedge/modules/sites/application/file"
	resourceApp "nfxedge/modules/sites/application/resource"
	tlsapp "nfxedge/modules/sites/application/tls"
	"nfxedge/modules/sites/config"
	"nfxedge/modules/sites/infrastructure/certbot"
	fsstore "nfxedge/modules/sites/infrastructure/fs"
	namecheapinfra "nfxedge/modules/sites/infrastructure/namecheap"
	certQuery "nfxedge/modules/sites/infrastructure/query/certificate"
	credQuery "nfxedge/modules/sites/infrastructure/query/credential"
	repofactory "nfxedge/modules/sites/infrastructure/repository/factory"
	"nfxedge/pkgs/cachex"
	"nfxedge/pkgs/health"
	"nfxedge/pkgs/kafkax"
	"nfxedge/pkgs/kafkax/eventbus"
	"nfxedge/pkgs/namecheapx"
	"nfxedge/pkgs/postgresqlx"
	"nfxedge/pkgs/security/token"
	"nfxedge/pkgs/security/token/servertoken"
	"nfxedge/pkgs/tokenx"
	"nfxedge/pkgs/transaction"

	"google.golang.org/grpc"
)

type Dependencies struct {
	healthMgr           *health.Manager
	cache               *cachex.Connection
	postgres            *postgresqlx.Connection
	kafkaConfig         *kafkax.Config
	busPublisher        *eventbus.BusPublisher
	tlsSvc              *tlsapp.Service
	fileSvc             *fileapp.Service
	analysisSvc         *analysisapp.Service
	credSvc             *credapp.Service
	dnsSvc              *dnsapp.Service
	resourceSvc         *resourceApp.Service
	userTokenVerifier   token.Verifier
	serverTokenVerifier token.Verifier
	errorsLangsPath     string
	conns               []*grpc.ClientConn
	identityAuth        *authconn.Client
}

func NewDeps(ctx context.Context, cfg *config.Config) (*Dependencies, error) {
	postgres, err := postgresqlx.Init(ctx, cfg.PostgreSQL)
	if err != nil {
		return nil, fmt.Errorf("init PostgreSQL: %w", err)
	}
	cacheConn, err := cachex.InitConn(ctx, cfg.Cache)
	if err != nil {
		return nil, fmt.Errorf("init Redis: %w", err)
	}
	healthMgr := health.NewManager(ctx, 30*time.Second)
	healthMgr.Register(postgres)
	healthMgr.Register(cacheConn)
	kafkaConfig := cfg.KafkaConfig
	busPublisher, err := kafkax.NewPublisher(&kafkaConfig)
	if err != nil {
		return nil, fmt.Errorf("kafka publisher: %w", err)
	}
	tokenxInstance := tokenx.New(cfg.Token)
	userTokenVerifier := &tokenxVerifierAdapter{tokenx: tokenxInstance}
	serverTokenVerifier := servertoken.NewVerifier(
		&servertoken.HMACSigner{Key: []byte(cfg.Token.SecretKey)},
		cfg.Token.Issuer,
		servertoken.WithAllowedSkew(5*time.Second),
	)
	identityClient, err := authconn.Dial(authconn.GRPCConfig{
		Addr:           cfg.GRPCClient.AuthAddr,
		TokenSecretKey: cfg.Token.SecretKey,
		TokenIssuer:    cfg.Token.Issuer,
		CallerService:  "sites",
	})
	if err != nil {
		return nil, fmt.Errorf("dial identity auth: %w", err)
	}
	errorsLangsPath := cfg.I18n.ErrorsLangsPath
	if errorsLangsPath == "" {
		errorsLangsPath = "./errors/langs"
	}
	wait := time.Duration(cfg.Cert.MaxWaitSeconds) * time.Second
	if wait <= 0 {
		wait = 5 * time.Minute
	}
	bot := &certbot.Client{
		ChallengeDir: cfg.Cert.ACMEChallengeDir,
		CertsDir:     cfg.Cert.BaseDir,
		MaxWait:      wait,
	}
	baseDir := cfg.Cert.BaseDir
	if baseDir == "" {
		baseDir = "./data/certs"
	}
	d := &Dependencies{
		healthMgr: healthMgr, postgres: postgres, cache: cacheConn, kafkaConfig: &kafkaConfig,
		busPublisher: busPublisher, userTokenVerifier: userTokenVerifier, serverTokenVerifier: serverTokenVerifier,
		errorsLangsPath: errorsLangsPath, identityAuth: identityClient,
		resourceSvc: resourceApp.NewService(postgres, cacheConn, &kafkaConfig),
	}
	certQ := certQuery.NewQuery(postgres.DB())
	factory := repofactory.NewTxRepoFactory(postgres.DB())
	tx := transaction.NewGormTxManager(postgres.DB())
	d.tlsSvc = tlsapp.NewService(tx, factory, certQ, cacheConn, busPublisher, bot, baseDir)
	d.fileSvc = fileapp.NewService(certQ, fsstore.New(baseDir), busPublisher)
	d.analysisSvc = analysisapp.NewService()
	credQ := credQuery.NewQuery(postgres.DB())
	nc := namecheapinfra.New(namecheapx.New())
	d.credSvc = credapp.NewService(tx, factory, credQ, nc)
	d.dnsSvc = dnsapp.NewService(tx, factory, credQ, nc)
	if cfg.Cert.ReadOnStartup {
		_ = d.tlsSvc.ImportFromDisk(ctx)
	}
	if cfg.Cert.ScheduleEnabled {
		go func() {
			t := time.NewTicker(time.Hour)
			defer t.Stop()
			_ = d.tlsSvc.RefreshDaysRemaining(ctx)
			for {
				select {
				case <-ctx.Done():
					return
				case <-t.C:
					_ = d.tlsSvc.RefreshDaysRemaining(ctx)
				}
			}
		}()
	}
	return d, nil
}

func (d *Dependencies) Cleanup() {
	d.healthMgr.Stop()
	d.postgres.Close()
	d.cache.Close()
	if d.identityAuth != nil {
		_ = d.identityAuth.Close()
	}
	for _, c := range d.conns {
		_ = c.Close()
	}
}

func (d *Dependencies) TLSSvc() *tlsapp.Service             { return d.tlsSvc }
func (d *Dependencies) FileSvc() *fileapp.Service           { return d.fileSvc }
func (d *Dependencies) AnalysisSvc() *analysisapp.Service   { return d.analysisSvc }
func (d *Dependencies) CredentialSvc() *credapp.Service     { return d.credSvc }
func (d *Dependencies) DNSSvc() *dnsapp.Service             { return d.dnsSvc }
func (d *Dependencies) ResourceSvc() *resourceApp.Service   { return d.resourceSvc }
func (d *Dependencies) UserTokenVerifier() token.Verifier   { return d.userTokenVerifier }
func (d *Dependencies) ServerTokenVerifier() token.Verifier { return d.serverTokenVerifier }
func (d *Dependencies) KafkaConfig() *kafkax.Config         { return d.kafkaConfig }
func (d *Dependencies) BusPublisher() *eventbus.BusPublisher {
	return d.busPublisher
}
func (d *Dependencies) ErrorsLangsPath() string      { return d.errorsLangsPath }
func (d *Dependencies) AuthClient() *authconn.Client { return d.identityAuth }

type tokenxVerifierAdapter struct{ tokenx *tokenx.Tokenx }

func (a *tokenxVerifierAdapter) Verify(ctx context.Context, tokenStr string) (*token.Claims, error) {
	claims, err := a.tokenx.VerifyAccessToken(tokenStr)
	if err != nil {
		return nil, err
	}
	return &token.Claims{Registered: claims.RegisteredClaims, Raw: map[string]any{
		"account_id": claims.AccountID, "profile_id": claims.ProfileID, "profile_scope": claims.ProfileScope,
	}}, nil
}
