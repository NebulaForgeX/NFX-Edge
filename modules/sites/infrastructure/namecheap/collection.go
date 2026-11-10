package namecheap

import (
	"context"
	"fmt"
	"strings"

	"nfxedge/pkgs/namecheapx"
)

type HostFilter struct {
	IDs     []string
	Keys    []string
	Name    string
	Type    string
	Address string
	TTL     string
	MXPref  string
}

type HostPatch struct {
	Address     string
	TTL         string
	MXPref      string
	AddressSelf bool
}

type HostAdd struct {
	Name        string
	Type        string
	Address     string
	TTL         string
	MXPref      string
	AddressSelf bool
}

type HostReplace struct {
	From string
	To   string
}

type HostChange struct {
	Before *Host
	After  *Host
}

type CollectionOutcome struct {
	Status    string
	Changes   []HostChange
	Next      []Host
	EmailType string
}

type HostCollectionSpec struct {
	Action   string
	Filter   HostFilter
	Patch    HostPatch
	Replaces []HostReplace
	Adds     []HostAdd
}

func isCollectionAll(value string) bool {
	value = strings.TrimSpace(value)
	return value == "" || strings.EqualFold(value, "all")
}

func hostIdentity(name, recordType string) string {
	return strings.ToLower(namecheapx.NormalizeHost(name)) + "\x00" + strings.ToLower(strings.TrimSpace(recordType))
}

func ApexTarget(domain string) string {
	d := strings.ToLower(strings.TrimSpace(strings.TrimSuffix(domain, ".")))
	if d == "" {
		return ""
	}
	return d + "."
}

func (f HostFilter) Specified() bool {
	if len(f.IDs) > 0 || len(f.Keys) > 0 {
		return true
	}
	if !isCollectionAll(f.Name) || !isCollectionAll(f.Type) || !isCollectionAll(f.TTL) {
		return true
	}
	return strings.TrimSpace(f.Address) != "" || strings.TrimSpace(f.MXPref) != ""
}

func (f HostFilter) match(host Host) bool {
	if len(f.IDs) > 0 || len(f.Keys) > 0 {
		hit := false
		for _, id := range f.IDs {
			if strings.TrimSpace(id) != "" && host.HostID == strings.TrimSpace(id) {
				hit = true
				break
			}
		}
		if !hit {
			key := strings.ToLower(namecheapx.NormalizeHost(host.Name)) + "|" + strings.ToLower(strings.TrimSpace(host.Type))
			for _, raw := range f.Keys {
				if strings.ToLower(strings.TrimSpace(raw)) == key {
					hit = true
					break
				}
			}
		}
		if !hit {
			return false
		}
	}
	if !isCollectionAll(f.Name) && !strings.EqualFold(host.Name, namecheapx.NormalizeHost(f.Name)) {
		return false
	}
	if !isCollectionAll(f.Type) && !strings.EqualFold(host.Type, strings.TrimSpace(f.Type)) {
		return false
	}
	if address := strings.TrimSpace(f.Address); address != "" && !strings.EqualFold(host.Address, address) {
		return false
	}
	if !isCollectionAll(f.TTL) && namecheapx.NormalizeTTL(host.TTL) != namecheapx.NormalizeTTL(f.TTL) {
		return false
	}
	if mx := strings.TrimSpace(f.MXPref); mx != "" && !strings.EqualFold(host.MXPref, mx) {
		return false
	}
	return true
}

func (p HostPatch) empty() bool {
	return strings.TrimSpace(p.Address) == "" && strings.TrimSpace(p.TTL) == "" && strings.TrimSpace(p.MXPref) == "" && !p.AddressSelf
}

func (p HostPatch) apply(host *Host, domain string) bool {
	changed := false
	if p.AddressSelf {
		next := ApexTarget(domain)
		if next != "" && host.Address != next {
			host.Address = next
			changed = true
		}
	} else if address := strings.TrimSpace(p.Address); address != "" && host.Address != address {
		host.Address = address
		changed = true
	}
	if ttl := strings.TrimSpace(p.TTL); ttl != "" {
		next := namecheapx.NormalizeTTL(ttl)
		if namecheapx.NormalizeTTL(host.TTL) != next {
			host.TTL = next
			changed = true
		}
	}
	if mx := strings.TrimSpace(p.MXPref); mx != "" && host.MXPref != mx {
		host.MXPref = mx
		changed = true
	}
	return changed
}

func (r HostReplace) valid() bool {
	from := strings.TrimSpace(r.From)
	to := strings.TrimSpace(r.To)
	return from != "" && to != "" && !strings.EqualFold(from, to)
}

// An address token ends at any byte that cannot continue it, so 108.172.51.13 never
// rewrites 108.172.51.130 and SPF "ip4:<ip>/32" still matches. ':' continues IPv6 only,
// except the SPF "ip6:" mechanism prefix.
func isAddressTokenByte(b byte, ipv6 bool) bool {
	switch {
	case b >= '0' && b <= '9', b >= 'a' && b <= 'z', b >= 'A' && b <= 'Z', b == '.', b == '-', b == '_':
		return true
	case b == ':':
		return ipv6
	}
	return false
}

// Every pair matches against the original value in one pass, so A→B with B→C never turns A into C.
func replaceAddressTokens(value string, pairs []HostReplace) (string, bool) {
	lower := strings.ToLower(value)
	var out strings.Builder
	changed := false
	for i := 0; i < len(value); {
		hit := false
		for _, pair := range pairs {
			needle := strings.ToLower(strings.TrimSpace(pair.From))
			ipv6 := strings.Contains(needle, ":")
			end := i + len(needle)
			if !strings.HasPrefix(lower[i:], needle) {
				continue
			}
			leftJoined := i > 0 && isAddressTokenByte(lower[i-1], ipv6) && !strings.HasSuffix(lower[:i], "ip6:")
			if leftJoined || (end < len(lower) && isAddressTokenByte(lower[end], ipv6)) {
				continue
			}
			out.WriteString(strings.TrimSpace(pair.To))
			i = end
			hit = true
			changed = true
			break
		}
		if !hit {
			out.WriteByte(value[i])
			i++
		}
	}
	if !changed {
		return value, false
	}
	return out.String(), true
}

func resolveAddress(domain, address string, self bool) (string, error) {
	if self {
		next := ApexTarget(domain)
		if next == "" {
			return "", fmt.Errorf("domain is empty")
		}
		return next, nil
	}
	next := strings.TrimSpace(address)
	if next == "" {
		return "", fmt.Errorf("address is required")
	}
	return next, nil
}

func (c *Client) PlanHostCollection(ctx context.Context, cred Credentials, domain string, spec HostCollectionSpec) (CollectionOutcome, error) {
	out := CollectionOutcome{Changes: []HostChange{}}
	action := strings.ToLower(strings.TrimSpace(spec.Action))
	switch action {
	case "add":
		if len(spec.Adds) == 0 {
			return out, fmt.Errorf("add requires at least one host")
		}
	case "update":
		if spec.Patch.empty() {
			return out, fmt.Errorf("at least one patch field is required")
		}
	case "replace":
		if len(spec.Replaces) == 0 {
			return out, fmt.Errorf("replace requires at least one from/to pair")
		}
		for _, pair := range spec.Replaces {
			if !pair.valid() {
				return out, fmt.Errorf("replace pair %q → %q is invalid", pair.From, pair.To)
			}
		}
	case "delete":
		if !spec.Filter.Specified() {
			return out, fmt.Errorf("delete requires a host filter")
		}
	default:
		return out, fmt.Errorf("invalid host collection action")
	}
	current, err := c.GetHosts(ctx, cred, domain)
	if err != nil {
		return out, err
	}
	if !current.IsOurDNS {
		return out, fmt.Errorf("domain %s is not using Namecheap DNS", domain)
	}
	next := append([]Host{}, current.Hosts...)
	out.EmailType = current.EmailType
	switch action {
	case "update":
		changed := false
		for i := range next {
			if !spec.Filter.match(next[i]) {
				continue
			}
			before := next[i]
			if !spec.Patch.apply(&next[i], domain) {
				continue
			}
			copyBefore := before
			after := next[i]
			out.Changes = append(out.Changes, HostChange{Before: &copyBefore, After: &after})
			changed = true
		}
		if !changed {
			out.Status = "skipped"
			out.Next = next
			return out, nil
		}
		out.Status = "updated"
	case "replace":
		for i := range next {
			if !spec.Filter.match(next[i]) {
				continue
			}
			address, ok := replaceAddressTokens(next[i].Address, spec.Replaces)
			if !ok {
				continue
			}
			before := next[i]
			next[i].Address = address
			after := next[i]
			out.Changes = append(out.Changes, HostChange{Before: &before, After: &after})
		}
		if len(out.Changes) == 0 {
			out.Status = "skipped"
			out.Next = next
			return out, nil
		}
		out.Status = "updated"
	case "add":
		existing := make(map[string]struct{}, len(next)+len(spec.Adds))
		for _, host := range next {
			existing[hostIdentity(host.Name, host.Type)] = struct{}{}
		}
		for _, raw := range spec.Adds {
			name := namecheapx.NormalizeHost(raw.Name)
			recordType := strings.TrimSpace(raw.Type)
			if name == "" || isCollectionAll(name) || recordType == "" || isCollectionAll(recordType) {
				return out, fmt.Errorf("add requires a specific host name and type")
			}
			address, err := resolveAddress(domain, raw.Address, raw.AddressSelf)
			if err != nil {
				return out, err
			}
			key := hostIdentity(name, recordType)
			if _, ok := existing[key]; ok {
				continue
			}
			ttl := strings.TrimSpace(raw.TTL)
			if ttl == "" {
				ttl = "1800"
			} else {
				ttl = namecheapx.NormalizeTTL(ttl)
			}
			mx := strings.TrimSpace(raw.MXPref)
			if mx == "" {
				mx = "10"
			}
			after := Host{Name: name, Type: recordType, Address: address, TTL: ttl, MXPref: mx}
			next = append(next, after)
			existing[key] = struct{}{}
			copyAfter := after
			out.Changes = append(out.Changes, HostChange{After: &copyAfter})
		}
		if len(out.Changes) == 0 {
			out.Status = "skipped"
			out.Next = next
			return out, nil
		}
		out.Status = "added"
	case "delete":
		kept := make([]Host, 0, len(next))
		for _, host := range next {
			if !spec.Filter.match(host) {
				kept = append(kept, host)
				continue
			}
			copyBefore := host
			out.Changes = append(out.Changes, HostChange{Before: &copyBefore})
		}
		if len(out.Changes) == 0 {
			out.Status = "skipped"
			out.Next = next
			return out, nil
		}
		next = kept
		out.Status = "deleted"
	}
	out.Next = next
	return out, nil
}

func (c *Client) ApplyHostCollection(ctx context.Context, cred Credentials, domain string, spec HostCollectionSpec) (CollectionOutcome, error) {
	out, err := c.PlanHostCollection(ctx, cred, domain, spec)
	if err != nil || out.Status == "skipped" {
		return out, err
	}
	if err := c.SetHosts(ctx, cred, domain, out.EmailType, out.Next); err != nil {
		return CollectionOutcome{}, err
	}
	return out, nil
}
