package namecheapx

type Credentials struct {
	APIUser  string
	UserName string
	APIKey   string
	ClientIP string
	Sandbox  bool
}

type Domain struct {
	ID        string `xml:"ID,attr" json:"id"`
	Name      string `xml:"Name,attr" json:"name"`
	Created   string `xml:"Created,attr" json:"created"`
	Expires   string `xml:"Expires,attr" json:"expires"`
	IsExpired string `xml:"IsExpired,attr" json:"is_expired"`
	IsLocked  string `xml:"IsLocked,attr" json:"is_locked"`
	AutoRenew string `xml:"AutoRenew,attr" json:"auto_renew"`
	IsOurDNS  string `xml:"IsOurDNS,attr" json:"is_our_dns"`
}

type Host struct {
	HostID             string `xml:"HostId,attr" json:"host_id"`
	Name               string `xml:"Name,attr" json:"name"`
	Type               string `xml:"Type,attr" json:"type"`
	Address            string `xml:"Address,attr" json:"address"`
	MXPref             string `xml:"MXPref,attr" json:"mx_pref"`
	TTL                string `xml:"TTL,attr" json:"ttl"`
	AssociatedAppTitle string `xml:"AssociatedAppTitle,attr" json:"associated_app_title"`
	FriendlyName       string `xml:"FriendlyName,attr" json:"friendly_name"`
	IsActive           string `xml:"IsActive,attr" json:"is_active"`
	IsDDNSEnabled      string `xml:"IsDDNSEnabled,attr" json:"is_ddns_enabled"`
}

type HostsResult struct {
	Domain    string `json:"domain"`
	EmailType string `json:"email_type"`
	IsOurDNS  bool   `json:"is_our_dns"`
	Hosts     []Host `json:"hosts"`
}

type Balances struct {
	Currency                  string `json:"currency"`
	AvailableBalance          string `json:"available_balance"`
	AccountBalance            string `json:"account_balance"`
	EarnedAmount              string `json:"earned_amount"`
	WithdrawableAmount        string `json:"withdrawable_amount"`
	FundsRequiredForAutoRenew string `json:"funds_required_for_auto_renew"`
}

type SSLCertificate struct {
	CertificateID        string `json:"certificate_id"`
	HostName             string `json:"host_name"`
	SSLType              string `json:"ssl_type"`
	PurchaseDate         string `json:"purchase_date"`
	ExpireDate           string `json:"expire_date"`
	ActivationExpireDate string `json:"activation_expire_date"`
	IsExpiredYN          string `json:"is_expired"`
	Status               string `json:"status"`
}

type DomainInfo struct {
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

func CloneHostsResult(src *HostsResult) *HostsResult {
	if src == nil {
		return nil
	}
	out := *src
	out.Hosts = append([]Host{}, src.Hosts...)
	return &out
}
