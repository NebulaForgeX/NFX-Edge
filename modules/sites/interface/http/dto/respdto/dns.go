package respdto

import dnsResults "nfxedge/modules/sites/application/dns/results"

type DomainDTO struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Created   string `json:"created"`
	Expires   string `json:"expires"`
	IsExpired string `json:"is_expired"`
	IsLocked  string `json:"is_locked"`
	AutoRenew string `json:"auto_renew"`
	IsOurDNS  string `json:"is_our_dns"`
}

type DomainListDTO struct {
	Items []DomainDTO `json:"items"`
}

func DomainsROToDTO(rows []dnsResults.DomainRO) DomainListDTO {
	items := make([]DomainDTO, 0, len(rows))
	for _, d := range rows {
		items = append(items, DomainDTO{
			ID: d.ID, Name: d.Name, Created: d.Created, Expires: d.Expires,
			IsExpired: d.IsExpired, IsLocked: d.IsLocked, AutoRenew: d.AutoRenew, IsOurDNS: d.IsOurDNS,
		})
	}
	return DomainListDTO{Items: items}
}

type HostDTO struct {
	HostID             string `json:"host_id"`
	Name               string `json:"name"`
	Type               string `json:"type"`
	Address            string `json:"address"`
	MXPref             string `json:"mx_pref"`
	TTL                string `json:"ttl"`
	AssociatedAppTitle string `json:"associated_app_title"`
	FriendlyName       string `json:"friendly_name"`
	IsActive           string `json:"is_active"`
	IsDDNSEnabled      string `json:"is_ddns_enabled"`
}

type HostsDTO struct {
	Domain    string    `json:"domain"`
	EmailType string    `json:"email_type"`
	IsOurDNS  bool      `json:"is_our_dns"`
	Hosts     []HostDTO `json:"hosts"`
}

func HostsROToDTO(ro *dnsResults.HostsRO) *HostsDTO {
	if ro == nil {
		return nil
	}
	hosts := make([]HostDTO, 0, len(ro.Hosts))
	for _, h := range ro.Hosts {
		hosts = append(hosts, HostDTO{
			HostID: h.HostID, Name: h.Name, Type: h.Type, Address: h.Address,
			MXPref: h.MXPref, TTL: h.TTL, AssociatedAppTitle: h.AssociatedAppTitle,
			FriendlyName: h.FriendlyName, IsActive: h.IsActive, IsDDNSEnabled: h.IsDDNSEnabled,
		})
	}
	return &HostsDTO{Domain: ro.Domain, EmailType: ro.EmailType, IsOurDNS: ro.IsOurDNS, Hosts: hosts}
}

type DomainInfoDTO struct {
	ID           string   `json:"id"`
	Domain       string   `json:"domain"`
	Status       string   `json:"status"`
	Created      string   `json:"created"`
	Expires      string   `json:"expires"`
	IsExpired    string   `json:"is_expired"`
	IsLocked     string   `json:"is_locked"`
	AutoRenew    string   `json:"auto_renew"`
	IsOurDNS     bool     `json:"is_our_dns"`
	ProviderType string   `json:"provider_type"`
	Nameservers  []string `json:"nameservers"`
}

type DomainDetailDTO struct {
	Info  DomainInfoDTO `json:"info"`
	Hosts *HostsDTO     `json:"hosts"`
}

func DomainDetailROToDTO(ro *dnsResults.DomainDetailRO) *DomainDetailDTO {
	if ro == nil {
		return nil
	}
	return &DomainDetailDTO{
		Info: DomainInfoDTO{
			ID: ro.Info.ID, Domain: ro.Info.Domain, Status: ro.Info.Status, Created: ro.Info.Created, Expires: ro.Info.Expires,
			IsExpired: ro.Info.IsExpired, IsLocked: ro.Info.IsLocked, AutoRenew: ro.Info.AutoRenew, IsOurDNS: ro.Info.IsOurDNS,
			ProviderType: ro.Info.ProviderType, Nameservers: ro.Info.Nameservers,
		},
		Hosts: HostsROToDTO(ro.Hosts),
	}
}

type BalancesDTO struct {
	Currency                  string `json:"currency"`
	AvailableBalance          string `json:"available_balance"`
	AccountBalance            string `json:"account_balance"`
	EarnedAmount              string `json:"earned_amount"`
	WithdrawableAmount        string `json:"withdrawable_amount"`
	FundsRequiredForAutoRenew string `json:"funds_required_for_auto_renew"`
}

func BalancesROToDTO(ro dnsResults.BalancesRO) BalancesDTO {
	return BalancesDTO{
		Currency: ro.Currency, AvailableBalance: ro.AvailableBalance, AccountBalance: ro.AccountBalance,
		EarnedAmount: ro.EarnedAmount, WithdrawableAmount: ro.WithdrawableAmount,
		FundsRequiredForAutoRenew: ro.FundsRequiredForAutoRenew,
	}
}

type SSLCertificateDTO struct {
	CertificateID        string `json:"certificate_id"`
	HostName             string `json:"host_name"`
	SSLType              string `json:"ssl_type"`
	PurchaseDate         string `json:"purchase_date"`
	ExpireDate           string `json:"expire_date"`
	ActivationExpireDate string `json:"activation_expire_date"`
	IsExpired            string `json:"is_expired"`
	Status               string `json:"status"`
}

type SSLListDTO struct {
	Items []SSLCertificateDTO `json:"items"`
}

func SSLROToDTO(rows []dnsResults.SSLCertificateRO) SSLListDTO {
	items := make([]SSLCertificateDTO, 0, len(rows))
	for _, r := range rows {
		items = append(items, SSLCertificateDTO{
			CertificateID: r.CertificateID, HostName: r.HostName, SSLType: r.SSLType,
			PurchaseDate: r.PurchaseDate, ExpireDate: r.ExpireDate, ActivationExpireDate: r.ActivationExpireDate,
			IsExpired: r.IsExpired, Status: r.Status,
		})
	}
	return SSLListDTO{Items: items}
}

type OutboundIPDTO struct {
	IPv4 string `json:"ipv4"`
}

func OutboundIPROToDTO(ro dnsResults.OutboundIPRO) OutboundIPDTO {
	return OutboundIPDTO{IPv4: ro.IPv4}
}

type HostSnapDTO struct {
	Name    string `json:"name"`
	Type    string `json:"type"`
	Address string `json:"address"`
	TTL     string `json:"ttl"`
	MXPref  string `json:"mx_pref"`
}

type HostChangeDTO struct {
	Before *HostSnapDTO `json:"before"`
	After  *HostSnapDTO `json:"after"`
}

type BulkHostItemDTO struct {
	Domain  string          `json:"domain"`
	Status  string          `json:"status"`
	Message string          `json:"message"`
	Changes []HostChangeDTO `json:"changes"`
}

type BulkHostDTO struct {
	Items []BulkHostItemDTO `json:"items"`
}

func hostSnapROToDTO(row dnsResults.HostSnapRO) HostSnapDTO {
	return HostSnapDTO{Name: row.Name, Type: row.Type, Address: row.Address, TTL: row.TTL, MXPref: row.MXPref}
}

func BulkHostROToDTO(ro *dnsResults.BulkHostRO) BulkHostDTO {
	if ro == nil {
		return BulkHostDTO{Items: []BulkHostItemDTO{}}
	}
	items := make([]BulkHostItemDTO, 0, len(ro.Items))
	for _, row := range ro.Items {
		changes := make([]HostChangeDTO, 0, len(row.Changes))
		for _, change := range row.Changes {
			item := HostChangeDTO{}
			if change.Before != nil {
				snap := hostSnapROToDTO(*change.Before)
				item.Before = &snap
			}
			if change.After != nil {
				snap := hostSnapROToDTO(*change.After)
				item.After = &snap
			}
			changes = append(changes, item)
		}
		items = append(items, BulkHostItemDTO{Domain: row.Domain, Status: row.Status, Message: row.Message, Changes: changes})
	}
	return BulkHostDTO{Items: items}
}
