package namecheap

import (
	"context"
	"strconv"
	"strings"
	"sync"
	"time"

	"nfxedge/pkgs/namecheapx"
)

const hostsCacheTTL = 45 * time.Second

type Credentials = namecheapx.Credentials
type Domain = namecheapx.Domain
type Host = namecheapx.Host
type HostsResult = namecheapx.HostsResult
type Balances = namecheapx.Balances
type SSLCertificate = namecheapx.SSLCertificate
type DomainInfo = namecheapx.DomainInfo

type hostsCacheEntry struct {
	at   time.Time
	data *namecheapx.HostsResult
}

type Client struct {
	api   *namecheapx.Client
	cache sync.Map
}

func New(api *namecheapx.Client) *Client {
	if api == nil {
		api = namecheapx.New()
	}
	return &Client{api: api}
}

func (c *Client) GetList(ctx context.Context, cred Credentials, page, pageSize int) ([]Domain, int, error) {
	return c.api.GetList(ctx, cred, page, pageSize)
}

func (c *Client) GetAllDomains(ctx context.Context, cred Credentials) ([]Domain, error) {
	return c.api.GetAllDomains(ctx, cred)
}

func (c *Client) GetBalances(ctx context.Context, cred Credentials) (*Balances, error) {
	return c.api.GetBalances(ctx, cred)
}

func (c *Client) GetSslList(ctx context.Context, cred Credentials) ([]SSLCertificate, error) {
	return c.api.GetSslList(ctx, cred)
}

func (c *Client) GetInfo(ctx context.Context, cred Credentials, domain string) (*DomainInfo, error) {
	return c.api.GetInfo(ctx, cred, domain)
}

func (c *Client) OutboundIPv4(ctx context.Context) (string, error) {
	return c.api.OutboundIPv4(ctx)
}

func (c *Client) GetHosts(ctx context.Context, cred Credentials, domain string) (*HostsResult, error) {
	key := hostsCacheKey(cred, domain)
	if raw, ok := c.cache.Load(key); ok {
		entry := raw.(hostsCacheEntry)
		if time.Since(entry.at) < hostsCacheTTL {
			return namecheapx.CloneHostsResult(entry.data), nil
		}
	}
	out, err := c.api.GetHosts(ctx, cred, domain)
	if err != nil {
		return nil, err
	}
	c.cache.Store(key, hostsCacheEntry{at: time.Now(), data: namecheapx.CloneHostsResult(out)})
	return out, nil
}

func (c *Client) SetHosts(ctx context.Context, cred Credentials, domain, emailType string, hosts []Host) error {
	if err := c.api.SetHosts(ctx, cred, domain, emailType, hosts); err != nil {
		return err
	}
	c.cache.Delete(hostsCacheKey(cred, domain))
	return nil
}

func hostsCacheKey(cred Credentials, domain string) string {
	return strings.ToLower(strings.TrimSpace(cred.APIUser)) + "|" + strconv.FormatBool(cred.Sandbox) + "|" + strings.ToLower(strings.TrimSpace(domain))
}
