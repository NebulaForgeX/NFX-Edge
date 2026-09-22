package tlsapp

import (
	"context"

	"nfxedge/events"
	sitesmsg "nfxedge/messages/src/sites"
	"nfxedge/pkgs/kafkax/eventbus"
)

func (s *Service) InvalidateCache(ctx context.Context) CommandResult {
	if s.cache != nil && s.cache.Client() != nil {
		_ = s.cache.Client().Del(ctx, "edge:tls:certificates").Err()
	}
	if s.bus != nil {
		_ = eventbus.PublishEvent(ctx, s.bus, events.CacheInvalidateEvent{ID: "manual"})
	}
	return CommandResult{Success: true, Message: sitesmsg.CACHE_INVALIDATED}
}

func (s *Service) HandleCacheInvalidate(ctx context.Context, _ events.CacheInvalidateEvent) error {
	if s.cache != nil && s.cache.Client() != nil {
		return s.cache.Client().Del(ctx, "edge:tls:certificates").Err()
	}
	return nil
}
