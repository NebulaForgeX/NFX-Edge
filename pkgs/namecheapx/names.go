package namecheapx

import (
	"fmt"
	"strings"
)

func SplitDomain(domain string) (sld, tld string, err error) {
	domain = strings.ToLower(strings.TrimSpace(domain))
	domain = strings.TrimSuffix(domain, ".")
	if domain == "" {
		return "", "", fmt.Errorf("domain is empty")
	}
	i := strings.IndexByte(domain, '.')
	if i <= 0 || i == len(domain)-1 {
		return "", "", fmt.Errorf("invalid domain %q", domain)
	}
	return domain[:i], domain[i+1:], nil
}

func NormalizeHost(host string) string {
	host = strings.TrimSpace(host)
	if host == "" {
		return "@"
	}
	return host
}

func NormalizeTTL(ttl string) string {
	ttl = strings.TrimSpace(ttl)
	if ttl == "" || strings.EqualFold(ttl, "automatic") || ttl == "1799" {
		return "1800"
	}
	return ttl
}
