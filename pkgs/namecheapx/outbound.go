package namecheapx

import (
	"context"
	"fmt"
	"io"
	"net"
	"net/http"
	"strings"
)

const (
	ipifyURL    = "https://api.ipify.org"
	ifconfigURL = "https://ifconfig.me/ip"
)

func (c *Client) OutboundIPv4(ctx context.Context) (string, error) {
	ip, err := c.fetchText(ctx, ipifyURL)
	if err != nil {
		ip, err = c.fetchText(ctx, ifconfigURL)
		if err != nil {
			return "", fmt.Errorf("detect outbound ipv4: %w", err)
		}
	}
	parsed := net.ParseIP(strings.TrimSpace(ip))
	if parsed == nil || parsed.To4() == nil {
		return "", fmt.Errorf("outbound address is not ipv4: %s", ip)
	}
	return parsed.To4().String(), nil
}

func (c *Client) fetchText(ctx context.Context, rawURL string) (string, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, rawURL, nil)
	if err != nil {
		return "", err
	}
	resp, err := c.http.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(io.LimitReader(resp.Body, 4096))
	if err != nil {
		return "", err
	}
	if resp.StatusCode >= 400 {
		return "", fmt.Errorf("%s http %d", rawURL, resp.StatusCode)
	}
	return strings.TrimSpace(string(body)), nil
}
