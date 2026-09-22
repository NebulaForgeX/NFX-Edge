package namecheapx

import (
	"errors"
	"fmt"
	"strings"
)

type ErrorItem struct {
	Number  string
	Message string
}

type APIError struct {
	Status string
	Items  []ErrorItem
}

func (e *APIError) Error() string {
	if e == nil {
		return "namecheap api"
	}
	msgs := e.messages()
	if len(msgs) == 0 {
		return fmt.Sprintf("namecheap api status %s", e.Status)
	}
	return "namecheap api: " + strings.Join(msgs, "; ")
}

func (e *APIError) messages() []string {
	out := make([]string, 0, len(e.Items))
	for _, item := range e.Items {
		msg := strings.TrimSpace(item.Message)
		if item.Number != "" {
			msg = item.Number + ": " + msg
		}
		if msg != "" {
			out = append(out, msg)
		}
	}
	return out
}

func (e *APIError) RateLimited() bool {
	if e == nil {
		return false
	}
	for _, item := range e.Items {
		if item.Number == "500000" || strings.Contains(strings.ToLower(item.Message), "too many requests") {
			return true
		}
	}
	return false
}

func IsRateLimited(err error) bool {
	if err == nil {
		return false
	}
	var api *APIError
	if errors.As(err, &api) && api.RateLimited() {
		return true
	}
	msg := strings.ToLower(err.Error())
	return strings.Contains(msg, "500000") || strings.Contains(msg, "too many requests")
}
