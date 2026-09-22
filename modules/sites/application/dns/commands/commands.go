package commands

import "github.com/google/uuid"

type CredentialScopedCmd struct {
	AccountID    uuid.UUID
	CredentialID uuid.UUID
}

type ListDomainsCmd struct {
	AccountID    uuid.UUID
	CredentialID uuid.UUID
}

type GetDomainCmd struct {
	AccountID    uuid.UUID
	CredentialID uuid.UUID
	Domain       string
}

type HostCmd struct {
	AccountID    uuid.UUID
	CredentialID uuid.UUID
	Domain       string
	HostID       string
	Name         string
	Type         string
	Address      string
	TTL          string
	MXPref       string
}

type BulkHostFilter struct {
	IDs     []string
	Keys    []string
	Name    string
	Type    string
	Address string
	TTL     string
	MXPref  string
}

type BulkHostPatch struct {
	Address     string
	TTL         string
	MXPref      string
	AddressSelf bool
}

type BulkHostAdd struct {
	Name        string
	Type        string
	Address     string
	TTL         string
	MXPref      string
	AddressSelf bool
}

type BulkHostCmd struct {
	AccountID    uuid.UUID
	CredentialID uuid.UUID
	Action       string
	Domains      []string
	Filter       BulkHostFilter
	Patch        BulkHostPatch
	Adds         []BulkHostAdd
}
