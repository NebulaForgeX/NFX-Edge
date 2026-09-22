package results

import "nfxedge/modules/sites/infrastructure/namecheap"

type CommandRO struct {
	Success bool
	Message string
}

type DomainRO struct {
	ID        string
	Name      string
	Created   string
	Expires   string
	IsExpired string
	IsLocked  string
	AutoRenew string
	IsOurDNS  string
}

func DomainsMapper(rows []namecheap.Domain) []DomainRO {
	out := make([]DomainRO, 0, len(rows))
	for _, d := range rows {
		out = append(out, DomainRO{
			ID: d.ID, Name: d.Name, Created: d.Created, Expires: d.Expires,
			IsExpired: d.IsExpired, IsLocked: d.IsLocked, AutoRenew: d.AutoRenew, IsOurDNS: d.IsOurDNS,
		})
	}
	return out
}

type HostRO struct {
	HostID             string
	Name               string
	Type               string
	Address            string
	MXPref             string
	TTL                string
	AssociatedAppTitle string
	FriendlyName       string
	IsActive           string
	IsDDNSEnabled      string
}

type HostsRO struct {
	Domain    string
	EmailType string
	IsOurDNS  bool
	Hosts     []HostRO
}

func HostsMapper(row *namecheap.HostsResult) *HostsRO {
	if row == nil {
		return nil
	}
	hosts := make([]HostRO, 0, len(row.Hosts))
	for _, h := range row.Hosts {
		hosts = append(hosts, HostRO{
			HostID: h.HostID, Name: h.Name, Type: h.Type, Address: h.Address,
			MXPref: h.MXPref, TTL: h.TTL, AssociatedAppTitle: h.AssociatedAppTitle,
			FriendlyName: h.FriendlyName, IsActive: h.IsActive, IsDDNSEnabled: h.IsDDNSEnabled,
		})
	}
	return &HostsRO{Domain: row.Domain, EmailType: row.EmailType, IsOurDNS: row.IsOurDNS, Hosts: hosts}
}

type DomainDetailRO struct {
	Info  DomainInfoRO
	Hosts *HostsRO
}

type DomainInfoRO struct {
	ID           string
	Domain       string
	Status       string
	Created      string
	Expires      string
	IsExpired    string
	IsLocked     string
	AutoRenew    string
	IsOurDNS     bool
	ProviderType string
	Nameservers  []string
}

func DomainInfoMapper(info *namecheap.DomainInfo) DomainInfoRO {
	if info == nil {
		return DomainInfoRO{}
	}
	ns := info.Nameservers
	if ns == nil {
		ns = []string{}
	}
	return DomainInfoRO{
		ID: info.ID, Domain: info.Domain, Status: info.Status, Created: info.Created, Expires: info.Expires,
		IsExpired: info.IsExpired, IsLocked: info.IsLocked, AutoRenew: info.AutoRenew, IsOurDNS: info.IsOurDNS,
		ProviderType: info.ProviderType, Nameservers: ns,
	}
}

type BalancesRO struct {
	Currency                  string
	AvailableBalance          string
	AccountBalance            string
	EarnedAmount              string
	WithdrawableAmount        string
	FundsRequiredForAutoRenew string
}

func BalancesMapper(b *namecheap.Balances) BalancesRO {
	if b == nil {
		return BalancesRO{}
	}
	return BalancesRO{
		Currency: b.Currency, AvailableBalance: b.AvailableBalance, AccountBalance: b.AccountBalance,
		EarnedAmount: b.EarnedAmount, WithdrawableAmount: b.WithdrawableAmount,
		FundsRequiredForAutoRenew: b.FundsRequiredForAutoRenew,
	}
}

type SSLCertificateRO struct {
	CertificateID        string
	HostName             string
	SSLType              string
	PurchaseDate         string
	ExpireDate           string
	ActivationExpireDate string
	IsExpired            string
	Status               string
}

func SSLMapper(rows []namecheap.SSLCertificate) []SSLCertificateRO {
	out := make([]SSLCertificateRO, 0, len(rows))
	for _, r := range rows {
		out = append(out, SSLCertificateRO{
			CertificateID: r.CertificateID, HostName: r.HostName, SSLType: r.SSLType,
			PurchaseDate: r.PurchaseDate, ExpireDate: r.ExpireDate, ActivationExpireDate: r.ActivationExpireDate,
			IsExpired: r.IsExpiredYN, Status: r.Status,
		})
	}
	return out
}

type OutboundIPRO struct {
	IPv4 string
}

type HostSnapRO struct {
	Name    string
	Type    string
	Address string
	TTL     string
	MXPref  string
}

func HostSnap(h namecheap.Host) HostSnapRO {
	return HostSnapRO{Name: h.Name, Type: h.Type, Address: h.Address, TTL: h.TTL, MXPref: h.MXPref}
}

type BulkHostChangeRO struct {
	Before *HostSnapRO
	After  *HostSnapRO
}

type BulkHostItemRO struct {
	Domain  string
	Status  string
	Message string
	Changes []BulkHostChangeRO
}

type BulkHostRO struct {
	Items []BulkHostItemRO
}
