package pemx

import (
	"sort"
	"strings"
)

// NormalizeNames lowercases, trims, de-duplicates, and sorts DNS names.
func NormalizeNames(names []string) []string {
	seen := make(map[string]struct{}, len(names))
	out := make([]string, 0, len(names))
	for _, n := range names {
		n = strings.ToLower(strings.TrimSpace(n))
		if n == "" {
			continue
		}
		if _, ok := seen[n]; ok {
			continue
		}
		seen[n] = struct{}{}
		out = append(out, n)
	}
	sort.Strings(out)
	return out
}

// NamesEqual reports whether two DNS-name lists cover the same set.
func NamesEqual(a, b []string) bool {
	na, nb := NormalizeNames(a), NormalizeNames(b)
	if len(na) != len(nb) {
		return false
	}
	for i := range na {
		if na[i] != nb[i] {
			return false
		}
	}
	return true
}
