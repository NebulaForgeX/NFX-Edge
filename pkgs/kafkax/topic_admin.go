package kafkax

import (
	"errors"
	"slices"
	"strings"

	sysErr "nfxedge/errors/src/sys"
	"nfxedge/pkgs/logx"

	"github.com/IBM/sarama"
)

const (
	defaultTopicPartitions        = 3
	defaultTopicReplicationFactor = 1
)

func ensureTopics(cfg *Config, saramaConfig *sarama.Config) error {
	names := configuredTopicNames(cfg)
	if len(names) == 0 {
		return nil
	}

	admin, err := sarama.NewClusterAdmin(cfg.Brokers, saramaConfig)
	if err != nil {
		return sysErr.ErrKafkaInternal.WithCause(err)
	}
	defer func() { _ = admin.Close() }()

	existing, err := admin.ListTopics()
	if err != nil {
		return sysErr.ErrKafkaInternal.WithCause(err)
	}

	for _, name := range names {
		if _, ok := existing[name]; ok {
			continue
		}
		if err := admin.CreateTopic(name, &sarama.TopicDetail{
			NumPartitions:     defaultTopicPartitions,
			ReplicationFactor: defaultTopicReplicationFactor,
		}, false); err != nil {
			if isTopicAlreadyExistsError(err) {
				continue
			}
			return sysErr.ErrKafkaInternal.WithCause(err).WithDetail("topic", name)
		}
		logx.S().Infow("kafka topic auto-created",
			"topic", name,
			"partitions", defaultTopicPartitions,
			"replication_factor", defaultTopicReplicationFactor,
		)
	}

	return nil
}

func isTopicAlreadyExistsError(err error) bool {
	if err == nil {
		return false
	}
	if errors.Is(err, sarama.ErrTopicAlreadyExists) {
		return true
	}
	return strings.Contains(strings.ToLower(err.Error()), "already exists")
}

func configuredTopicNames(cfg *Config) []string {
	uniq := make(map[string]struct{})
	for _, topicName := range cfg.ProducerTopics {
		if topicName != "" {
			uniq[topicName] = struct{}{}
		}
	}
	for _, topicName := range cfg.ConsumerTopics {
		if topicName != "" {
			uniq[topicName] = struct{}{}
		}
	}
	names := make([]string, 0, len(uniq))
	for topicName := range uniq {
		names = append(names, topicName)
	}
	slices.Sort(names)
	return names
}
