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

type HostBulkRequestDTO struct {
	Action  string       `json:"action"`
	Domains []string     `json:"domains"`
	Filter  HostMatchDTO `json:"filter"`
	Patch   HostPatchDTO `json:"patch"`
	Adds    []HostAddDTO `json:"adds"`
}
