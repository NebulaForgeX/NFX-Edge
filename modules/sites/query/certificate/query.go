package certificate

import "context"

type Query struct {
	List List
}

type List interface {
	Page(ctx context.Context, accountID, keyword string, offset, limit int, stripSecrets bool) ([]CertificateVO, int64, error)
	ByID(ctx context.Context, id string) (*CertificateVO, error)
	ByDomain(ctx context.Context, domain string) (*CertificateVO, error)
	All(ctx context.Context) ([]CertificateVO, error)
}
