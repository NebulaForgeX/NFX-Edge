package config

import (
	"nfxedge/pkgs/cachex"
	"nfxedge/pkgs/connections/otelx"
	"nfxedge/pkgs/env"
	"nfxedge/pkgs/httpx"
	"nfxedge/pkgs/kafkax"
	"nfxedge/pkgs/logx"
	"nfxedge/pkgs/postgresqlx"
	"nfxedge/pkgs/tokenx"
)

type Config struct {
	Env         env.Env
	Server      ServerConfig       `koanf:"server"`
	PostgreSQL  postgresqlx.Config `koanf:"postgresql"`
	Cache       cachex.ConnConfig  `koanf:"cache"`
	Logger      logx.LoggerConfig  `koanf:"logger"`
	KafkaConfig kafkax.Config      `koanf:"kafka"`
	GRPCClient  GRPCClientConfig   `koanf:"grpc_client"`
	Token       tokenx.Config      `koanf:"token"`
	I18n        I18nConfig         `koanf:"i18n"`
	OTEL        otelx.Config       `koanf:"otel"`
	Cert        CertConfig         `koanf:"cert"`
}

type I18nConfig struct {
	ErrorsLangsPath string `koanf:"errors_langs_path"`
}

type GRPCClientConfig struct {
	AuthAddr string `koanf:"auth_addr"`
}

type ServerConfig struct {
	Name      string                `koanf:"name"`
	Host      string                `koanf:"host"`
	HTTPPort  int                   `koanf:"http_port"`
	GRPCPort  int                   `koanf:"grpc_port"`
	AccessLog httpx.AccessLogConfig `koanf:"access_log"`
}

type CertConfig struct {
	BaseDir          string `koanf:"base_dir"`
	ACMEChallengeDir string `koanf:"acme_challenge_dir"`
	MaxWaitSeconds   int    `koanf:"max_wait_seconds"`
	ReadOnStartup    bool   `koanf:"read_on_startup"`
	ScheduleEnabled  bool   `koanf:"schedule_enabled"`
}
