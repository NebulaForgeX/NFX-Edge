package tlsapp

import (
	"context"
	"time"

	"nfxedge/events"
	"nfxedge/modules/sites/infrastructure/certbot"
	repofactory "nfxedge/modules/sites/infrastructure/repository/factory"
	certQuery "nfxedge/modules/sites/query/certificate"
	"nfxedge/pkgs/cachex"
	"nfxedge/pkgs/kafkax/eventbus"
	"nfxedge/pkgs/transaction"
)

type Service struct {
	tx          transaction.TxManager
	repoFactory *repofactory.TxRepoFactory
	query       *certQuery.Query
	cache       *cachex.Connection
	bus         *eventbus.BusPublisher
	certbot     *certbot.Client
	baseDir     string
}

func NewService(
	tx transaction.TxManager,
	repoFactory *repofactory.TxRepoFactory,
	query *certQuery.Query,
	cache *cachex.Connection,
	bus *eventbus.BusPublisher,
	bot *certbot.Client,
	baseDir string,
) *Service {
	return &Service{tx: tx, repoFactory: repoFactory, query: query, cache: cache, bus: bus, certbot: bot, baseDir: baseDir}
}

type Certificate = certQuery.CertificateVO

type ListResult struct {
	Items []Certificate `json:"items"`
	Total int64         `json:"total"`
}

type CommandResult struct {
	Success       bool   `json:"success"`
	Message       string `json:"message"`
	CertificateID string `json:"certificate_id,omitempty"`
	Status        string `json:"status,omitempty"`
	Processed     int    `json:"processed,omitempty"`
	RateLimit     bool   `json:"rate_limit,omitempty"`
	RetryAfter    string `json:"retry_after,omitempty"`
}

type ParsePreviewResult struct {
	Success       bool       `json:"success"`
	Message       string     `json:"message"`
	Domain        string     `json:"domain,omitempty"`
	SANs          []string   `json:"sans,omitempty"`
	Issuer        string     `json:"issuer,omitempty"`
	NotBefore     *time.Time `json:"not_before,omitempty"`
	NotAfter      *time.Time `json:"not_after,omitempty"`
	IsValid       *bool      `json:"is_valid,omitempty"`
	DaysRemaining *int       `json:"days_remaining,omitempty"`
}

func owned(row *Certificate, accountID string) bool {
	return row != nil && accountID != "" && row.AccountID != nil && *row.AccountID == accountID
}

func (s *Service) ACMEChallengeDir() string {
	if s.certbot != nil && s.certbot.ChallengeDir != "" {
		return s.certbot.ChallengeDir
	}
	return "./data/acme"
}

func (s *Service) publishParse(ctx context.Context, id string) {
	if s.bus == nil {
		return
	}
	_ = eventbus.PublishEvent(ctx, s.bus, events.ParseCertificateEvent{ID: id})
}
