package events

import "nfxedge/pkgs/kafkax/eventbus"

const (
	TKCert    eventbus.TopicKey = "cert"
	TKCertDLQ eventbus.TopicKey = "cert_poison"

	TKFile    eventbus.TopicKey = "file"
	TKFileDLQ eventbus.TopicKey = "file_poison"
)

type CertTopic struct{}

func (CertTopic) TopicKey() eventbus.TopicKey { return TKCert }

type FileTopic struct{}

func (FileTopic) TopicKey() eventbus.TopicKey { return TKFile }
