package namecheapx

import (
	"context"
	"encoding/xml"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"

	"nfxedge/pkgs/retry"
)

const (
	productionAPI = "https://api.namecheap.com/xml.response"
	sandboxAPI    = "https://api.sandbox.namecheap.com/xml.response"
	apiMinGap     = time.Second
	apiRateTries  = 4
)

type Client struct {
	http   *http.Client
	paceMu sync.Mutex
	last   time.Time
}

func New() *Client {
	return &Client{http: &http.Client{Timeout: 30 * time.Second}}
}

type apiResponse struct {
	XMLName xml.Name `xml:"ApiResponse"`
	Status  string   `xml:"Status,attr"`
	Errors  []struct {
		Number  string `xml:"Number,attr"`
		Message string `xml:",chardata"`
	} `xml:"Errors>Error"`
	CommandResponse struct {
		Type    string   `xml:"Type,attr"`
		Domains []Domain `xml:"DomainGetListResult>Domain"`
		Paging  struct {
			TotalItems  int `xml:"TotalItems"`
			CurrentPage int `xml:"CurrentPage"`
			PageSize    int `xml:"PageSize"`
		} `xml:"Paging"`
		DNSGetHosts struct {
			Domain    string `xml:"Domain,attr"`
			EmailType string `xml:"EmailType,attr"`
			IsOurDNS  string `xml:"IsUsingOurDNS,attr"`
			Hosts     []Host `xml:"host"`
		} `xml:"DomainDNSGetHostsResult"`
		DNSSetHosts struct {
			Domain    string `xml:"Domain,attr"`
			IsSuccess string `xml:"IsSuccess,attr"`
		} `xml:"DomainDNSSetHostsResult"`
		Balances struct {
			Currency                  string `xml:"Currency,attr"`
			AvailableBalance          string `xml:"AvailableBalance,attr"`
			AccountBalance            string `xml:"AccountBalance,attr"`
			EarnedAmount              string `xml:"EarnedAmount,attr"`
			WithdrawableAmount        string `xml:"WithdrawableAmount,attr"`
			FundsRequiredForAutoRenew string `xml:"FundsRequiredForAutoRenew,attr"`
		} `xml:"UserGetBalancesResult"`
		SSLCertificates []struct {
			CertificateID        string `xml:"CertificateID,attr"`
			HostName             string `xml:"HostName,attr"`
			SSLType              string `xml:"SSLType,attr"`
			PurchaseDate         string `xml:"PurchaseDate,attr"`
			ExpireDate           string `xml:"ExpireDate,attr"`
			ActivationExpireDate string `xml:"ActivationExpireDate,attr"`
			IsExpiredYN          string `xml:"IsExpiredYN,attr"`
			Status               string `xml:"Status,attr"`
		} `xml:"SSLListResult>SSL"`
		DomainInfo struct {
			Status     string `xml:"Status,attr"`
			ID         string `xml:"ID,attr"`
			DomainName string `xml:"DomainName,attr"`
			Details    struct {
				CreatedDate string `xml:"CreatedDate"`
				ExpiredDate string `xml:"ExpiredDate"`
			} `xml:"DomainDetails"`
			DNS struct {
				ProviderType string   `xml:"ProviderType,attr"`
				IsOurDNS     string   `xml:"IsUsingOurDNS,attr"`
				Nameservers  []string `xml:"Nameserver"`
			} `xml:"DnsDetails"`
		} `xml:"DomainGetInfoResult"`
	} `xml:"CommandResponse"`
}

func (c *Client) xmlCall(ctx context.Context, cred Credentials, extra url.Values, dest *apiResponse) error {
	return retry.RetryVoid(ctx, func(ctx context.Context) error {
		if dest != nil {
			*dest = apiResponse{}
		}
		if err := c.pace(ctx); err != nil {
			return err
		}
		return c.xmlCallOnce(ctx, cred, extra, dest)
	}, retry.Config{
		MaxTries:        apiRateTries,
		InitialInterval: time.Second,
		MaxInterval:     8 * time.Second,
		Multiplier:      2,
		ShouldRetry: func(err error, _ uint, _ time.Duration) bool {
			return IsRateLimited(err)
		},
	})
}

func (c *Client) pace(ctx context.Context) error {
	c.paceMu.Lock()
	wait := apiMinGap - time.Since(c.last)
	if wait < 0 {
		wait = 0
	}
	c.last = time.Now().Add(wait)
	c.paceMu.Unlock()
	if wait == 0 {
		return nil
	}
	timer := time.NewTimer(wait)
	defer timer.Stop()
	select {
	case <-ctx.Done():
		return ctx.Err()
	case <-timer.C:
		return nil
	}
}

func (c *Client) xmlCallOnce(ctx context.Context, cred Credentials, extra url.Values, dest *apiResponse) error {
	if strings.TrimSpace(cred.APIUser) == "" || strings.TrimSpace(cred.APIKey) == "" || strings.TrimSpace(cred.ClientIP) == "" {
		return fmt.Errorf("namecheap credentials incomplete")
	}
	q := url.Values{}
	q.Set("ApiUser", strings.TrimSpace(cred.APIUser))
	q.Set("ApiKey", strings.TrimSpace(cred.APIKey))
	q.Set("UserName", strings.TrimSpace(cred.APIUser))
	q.Set("ClientIp", strings.TrimSpace(cred.ClientIP))
	for k, vs := range extra {
		for _, v := range vs {
			q.Set(k, v)
		}
	}
	endpoint := productionAPI
	if cred.Sandbox {
		endpoint = sandboxAPI
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint+"?"+q.Encode(), nil)
	if err != nil {
		return err
	}
	resp, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("namecheap api: %w", err)
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(io.LimitReader(resp.Body, 4<<20))
	if err != nil {
		return fmt.Errorf("namecheap api read: %w", err)
	}
	if resp.StatusCode >= 400 {
		return fmt.Errorf("namecheap api http %d: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}
	if err := xml.Unmarshal(body, dest); err != nil {
		return fmt.Errorf("namecheap api xml: %w", err)
	}
	if strings.EqualFold(dest.Status, "OK") {
		return nil
	}
	items := make([]ErrorItem, 0, len(dest.Errors))
	for _, e := range dest.Errors {
		items = append(items, ErrorItem{Number: e.Number, Message: e.Message})
	}
	return &APIError{Status: dest.Status, Items: items}
}
