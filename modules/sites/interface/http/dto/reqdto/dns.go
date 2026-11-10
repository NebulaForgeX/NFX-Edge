package reqdto

type HostWriteRequestDTO struct {
	Domain  string `json:"domain"`
	HostID  string `json:"host_id"`
	Name    string `json:"name"`
	Type    string `json:"type"`
	Address string `json:"address"`
	TTL     string `json:"ttl"`
	MXPref  string `json:"mx_pref"`
}

type HostMatchDTO struct {
	IDs     []string `json:"ids"`
	Keys    []string `json:"keys"`
	Name    string   `json:"name"`
	Type    string   `json:"type"`
	Address string   `json:"address"`
	TTL     string   `json:"ttl"`
	MXPref  string   `json:"mx_pref"`
}

type HostPatchDTO struct {
	Address     string `json:"address"`
	TTL         string `json:"ttl"`
	MXPref      string `json:"mx_pref"`
	AddressSelf bool   `json:"address_self"`
}

type HostAddDTO struct {
	Name        string `json:"name"`
	Type        string `json:"type"`
	Address     string `json:"address"`
	TTL         string `json:"ttl"`
	MXPref      string `json:"mx_pref"`
	AddressSelf bool   `json:"address_self"`
}

type HostReplaceDTO struct {
	From string `json:"from"`
	To   string `json:"to"`
}

type HostCopyRuleDTO struct {
	Type  string   `json:"type"`
	Hosts []string `json:"hosts"`
}

type HostCopyDTO struct {
	Source        string            `json:"source"`
	Rules         []HostCopyRuleDTO `json:"rules"`
	Overwrite     bool              `json:"overwrite"`
	RewriteDomain bool              `json:"rewrite_domain"`
}

type HostBulkRequestDTO struct {
	Action   string           `json:"action"`
	Domains  []string         `json:"domains"`
	Filter   HostMatchDTO     `json:"filter"`
	Patch    HostPatchDTO     `json:"patch"`
	Replaces []HostReplaceDTO `json:"replaces"`
	Copy     HostCopyDTO      `json:"copy"`
	Adds     []HostAddDTO     `json:"adds"`
}
