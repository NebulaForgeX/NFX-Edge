package namecheapx

import (
	"context"
	"fmt"
	"net/url"
	"strconv"
	"strings"
)

func (c *Client) GetList(ctx context.Context, cred Credentials, page, pageSize int) ([]Domain, int, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 100
	}
	q := url.Values{}
	q.Set("Command", "namecheap.domains.getList")
	q.Set("Page", strconv.Itoa(page))
	q.Set("PageSize", strconv.Itoa(pageSize))
	q.Set("ListType", "ALL")
	var resp apiResponse
	if err := c.xmlCall(ctx, cred, q, &resp); err != nil {
		return nil, 0, err
	}
	return resp.CommandResponse.Domains, resp.CommandResponse.Paging.TotalItems, nil
}

func (c *Client) GetAllDomains(ctx context.Context, cred Credentials) ([]Domain, error) {
	const pageSize = 100
	page := 1
	var all []Domain
	for {
		items, total, err := c.GetList(ctx, cred, page, pageSize)
		if err != nil {
			return nil, err
		}
		all = append(all, items...)
		if total <= 0 || len(all) >= total || len(items) == 0 {
			break
		}
		page++
	}
	return all, nil
}

func (c *Client) GetHosts(ctx context.Context, cred Credentials, domain string) (*HostsResult, error) {
	sld, tld, err := SplitDomain(domain)
	if err != nil {
		return nil, err
	}
	q := url.Values{}
	q.Set("Command", "namecheap.domains.dns.getHosts")
	q.Set("SLD", sld)
	q.Set("TLD", tld)
	var resp apiResponse
	if err := c.xmlCall(ctx, cred, q, &resp); err != nil {
		return nil, err
	}
	r := resp.CommandResponse.DNSGetHosts
	return &HostsResult{
		Domain:    r.Domain,
		EmailType: r.EmailType,
		IsOurDNS:  strings.EqualFold(r.IsOurDNS, "true"),
		Hosts:     r.Hosts,
	}, nil
}

func (c *Client) SetHosts(ctx context.Context, cred Credentials, domain, emailType string, hosts []Host) error {
	sld, tld, err := SplitDomain(domain)
	if err != nil {
		return err
	}
	q := url.Values{}
	q.Set("Command", "namecheap.domains.dns.setHosts")
	q.Set("SLD", sld)
	q.Set("TLD", tld)
	if emailType != "" {
		q.Set("EmailType", emailType)
	}
	for i, h := range hosts {
		n := strconv.Itoa(i + 1)
		q.Set("HostName"+n, h.Name)
		q.Set("RecordType"+n, h.Type)
		q.Set("Address"+n, h.Address)
		if h.MXPref != "" {
			q.Set("MXPref"+n, h.MXPref)
		}
		if h.TTL != "" {
			q.Set("TTL"+n, h.TTL)
		}
		if h.AssociatedAppTitle != "" {
			q.Set("AssociatedAppTitle"+n, h.AssociatedAppTitle)
		}
		if h.FriendlyName != "" {
			q.Set("FriendlyName"+n, h.FriendlyName)
		}
		if h.IsActive != "" {
			q.Set("IsActive"+n, h.IsActive)
		}
		if h.IsDDNSEnabled != "" {
			q.Set("IsDDNSEnabled"+n, h.IsDDNSEnabled)
		}
	}
	var resp apiResponse
	if err := c.xmlCall(ctx, cred, q, &resp); err != nil {
		return err
	}
	if resp.CommandResponse.DNSSetHosts.IsSuccess != "" && !strings.EqualFold(resp.CommandResponse.DNSSetHosts.IsSuccess, "true") {
		return fmt.Errorf("namecheap setHosts failed for %s", domain)
	}
	return nil
}

func (c *Client) GetBalances(ctx context.Context, cred Credentials) (*Balances, error) {
	q := url.Values{}
	q.Set("Command", "namecheap.users.getBalances")
	var resp apiResponse
	if err := c.xmlCall(ctx, cred, q, &resp); err != nil {
		return nil, err
	}
	b := resp.CommandResponse.Balances
	return &Balances{
		Currency:                  b.Currency,
		AvailableBalance:          b.AvailableBalance,
		AccountBalance:            b.AccountBalance,
		EarnedAmount:              b.EarnedAmount,
		WithdrawableAmount:        b.WithdrawableAmount,
		FundsRequiredForAutoRenew: b.FundsRequiredForAutoRenew,
	}, nil
}

func (c *Client) GetSslList(ctx context.Context, cred Credentials) ([]SSLCertificate, error) {
	const pageSize = 100
	page := 1
	var all []SSLCertificate
	for {
		q := url.Values{}
		q.Set("Command", "namecheap.ssl.getList")
		q.Set("Page", strconv.Itoa(page))
		q.Set("PageSize", strconv.Itoa(pageSize))
		var resp apiResponse
		if err := c.xmlCall(ctx, cred, q, &resp); err != nil {
			return nil, err
		}
		for _, row := range resp.CommandResponse.SSLCertificates {
			all = append(all, SSLCertificate{
				CertificateID:        row.CertificateID,
				HostName:             row.HostName,
				SSLType:              row.SSLType,
				PurchaseDate:         row.PurchaseDate,
				ExpireDate:           row.ExpireDate,
				ActivationExpireDate: row.ActivationExpireDate,
				IsExpiredYN:          row.IsExpiredYN,
				Status:               row.Status,
			})
		}
		total := resp.CommandResponse.Paging.TotalItems
		if total == 0 || page*pageSize >= total || len(resp.CommandResponse.SSLCertificates) == 0 {
			break
		}
		page++
	}
	if all == nil {
		all = []SSLCertificate{}
	}
	return all, nil
}

func (c *Client) GetInfo(ctx context.Context, cred Credentials, domain string) (*DomainInfo, error) {
	domain = strings.ToLower(strings.TrimSpace(domain))
	q := url.Values{}
	q.Set("Command", "namecheap.domains.getInfo")
	q.Set("DomainName", domain)
	var resp apiResponse
	if err := c.xmlCall(ctx, cred, q, &resp); err != nil {
		return nil, err
	}
	info := resp.CommandResponse.DomainInfo
	locked := ""
	if strings.EqualFold(info.Status, "Locked") {
		locked = "true"
	}
	return &DomainInfo{
		ID:           info.ID,
		Domain:       firstNonEmpty(info.DomainName, domain),
		Status:       info.Status,
		Created:      info.Details.CreatedDate,
		Expires:      info.Details.ExpiredDate,
		IsLocked:     locked,
		IsOurDNS:     strings.EqualFold(info.DNS.IsOurDNS, "true"),
		ProviderType: info.DNS.ProviderType,
		Nameservers:  info.DNS.Nameservers,
	}, nil
}

func firstNonEmpty(values ...string) string {
	for _, v := range values {
		if strings.TrimSpace(v) != "" {
			return v
		}
	}
	return ""
}
