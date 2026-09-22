package fileapp

import (
	"strings"

	fsstore "nfxedge/modules/sites/infrastructure/fs"
	certQuery "nfxedge/modules/sites/query/certificate"
	"nfxedge/pkgs/kafkax/eventbus"
)

type Service struct {
	certs *certQuery.Query
	fs    *fsstore.Store
	bus   *eventbus.BusPublisher
}

func NewService(certs *certQuery.Query, fs *fsstore.Store, bus *eventbus.BusPublisher) *Service {
	return &Service{certs: certs, fs: fs, bus: bus}
}

type CommandResult struct {
	Success       bool            `json:"success"`
	Message       string          `json:"message"`
	Store         string          `json:"store,omitempty"`
	Path          string          `json:"path,omitempty"`
	ItemType      string          `json:"item_type,omitempty"`
	Items         []fsstore.Entry `json:"items,omitempty"`
	Content       *string         `json:"content,omitempty"`
	Filename      *string         `json:"filename,omitempty"`
	FolderName    string          `json:"folder_name,omitempty"`
	Domain        string          `json:"domain,omitempty"`
	CertificateID string          `json:"certificate_id,omitempty"`
	Exported      int             `json:"exported,omitempty"`
}

func firstSegment(subpath string) string {
	rel := strings.Trim(strings.ReplaceAll(subpath, "\\", "/"), "/")
	if rel == "" || rel == "." {
		return ""
	}
	return strings.Split(rel, "/")[0]
}
