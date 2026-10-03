import { FileDescriptionIcon, HomeIcon, MagnifierIcon, RouterIcon, ShieldCheck, StackIcon, XIcon, type AnimatedIconComponent } from "nfx-ui/icons";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Container, Dialog, Flex, IconButton, Inset, ScrollArea, Section, Separator, Text, VisuallyHidden } from "@radix-ui/themes";
import { LayoutGroup, motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components";

import { routerEventEmitter } from "@/events/router";
import { useSearchCertificate } from "@/hooks";
import ModalStore, { useModalStore } from "@/stores/modal";
import { ROUTES } from "@/navigations";

import styles from "./s.module.css";

interface SearchItem {
  id: string;
  title: string;
  description: string;
  icon: AnimatedIconComponent;
  onSelect: () => void;
}

const SearchModal = memo(() => {
  const isOpen = useModalStore((state) => state.searchModal.isOpen);
  const hideModal = ModalStore.getState().hideModal;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchMutation = useSearchCertificate();

  const { t } = useTranslation("common");

  const navItems: SearchItem[] = useMemo(
    () => [
      {
        id: "dashboard",
        title: t("title", { ns: "common" }),
        description: t("subtitle", { ns: "common" }),
        icon: HomeIcon,
        onSelect: () => routerEventEmitter.navigate({ to: ROUTES.USER_OVERVIEW }),
      },
      {
        id: "check",
        title: t("certManagement.title", { ns: "common" }),
        description: t("certManagement.description", { ns: "common" }),
        icon: ShieldCheck,
        onSelect: () => routerEventEmitter.navigate({ to: ROUTES.CERTS_OVERVIEW }),
      },
      {
        id: "add",
        title: t("dashboard.addCert"),
        description: t("dashboard.addHint", { ns: "common" }),
        icon: FileDescriptionIcon,
        onSelect: () => routerEventEmitter.navigate({ to: ROUTES.CERT_ADD }),
      },
      {
        id: "dns",
        title: t("dashboard.dns", { ns: "common" }),
        description: t("dashboard.dnsHint", { ns: "common" }),
        icon: RouterIcon,
        onSelect: () => routerEventEmitter.navigate({ to: ROUTES.NAMECHEAP_OVERVIEW }),
      },
      {
        id: "files",
        title: t("dashboard.files", { ns: "common" }),
        description: t("dashboard.filesHint", { ns: "common" }),
        icon: StackIcon,
        onSelect: () => routerEventEmitter.navigate({ to: ROUTES.FILE_FOLDER }),
      },
      {
        id: "analysis",
        title: t("dashboard.analysis", { ns: "common" }),
        description: t("dashboard.analysisHint", { ns: "common" }),
        icon: MagnifierIcon,
        onSelect: () => routerEventEmitter.navigate({ to: ROUTES.ANALYSIS_TLS }),
      },
    ],
    [t],
  );

  const certItems: SearchItem[] = useMemo(
    () =>
      (searchMutation.data?.items ?? []).filter((cert) => cert?.id && cert.domain).map((cert) => ({
        id: `cert:${cert.id}`,
        title: cert.domain,
        description: [cert.issuer, cert.notAfter].filter(Boolean).join(" · "),
        icon: ShieldCheck,
        onSelect: () =>
          routerEventEmitter.navigate({
            to: ROUTES.CERT_DETAIL.replace(":certificateId", encodeURIComponent(cert.id)),
          }),
      })),
    [searchMutation.data],
  );

  const filteredNav = useMemo(() => {
    if (!searchQuery.trim()) return navItems;
    const query = searchQuery.toLowerCase();
    return navItems.filter((item) => item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query));
  }, [navItems, searchQuery]);

  const results = useMemo(() => (searchQuery.trim() ? [...certItems, ...filteredNav] : filteredNav), [certItems, filteredNav, searchQuery]);

  const { reset: resetSearch, mutateAsync: runSearch } = searchMutation;
  useEffect(() => {
    const keyword = searchQuery.trim();
    if (!keyword) {
      resetSearch();
      return;
    }
    const timer = window.setTimeout(() => {
      void runSearch({ keyword, offset: 0, limit: 20 });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchQuery, resetSearch, runSearch]);

  const handleSelect = useCallback(
    (item: SearchItem) => {
      item.onSelect();
      hideModal("search");
      setSearchQuery("");
      setSelectedIndex(0);
    },
    [hideModal],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (results[selectedIndex]) handleSelect(results[selectedIndex]);
      } else if (e.key === "Escape") {
        hideModal("search");
      }
    },
    [results, selectedIndex, handleSelect, hideModal],
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) hideModal("search");
      }}
    >
      <Dialog.Content size="3" maxWidth="40rem" onKeyDown={handleKeyDown}>
        <VisuallyHidden>
          <Dialog.Title>{t("search.placeholder")}</Dialog.Title>
        </VisuallyHidden>
        <Flex direction="column" gap="4">
          <Flex align="center" gap="2">
            <Box flexGrow="1" minWidth="0">
              <Input
                ref={inputRef}
                fullWidth
                variant="filled"
                leftIcon={<MagnifierIcon size={20} />}
                type="text"
                placeholder={t("search.placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </Box>
            {searchQuery ? (
              <IconButton type="button" variant="ghost" color="gray" aria-label={t("search.clear")} onClick={() => setSearchQuery("")}>
                <XIcon size={16} />
              </IconButton>
            ) : null}
          </Flex>
          <Inset side="x" clip="padding-box">
            <Separator size="4" />
          </Inset>
          <ScrollArea type="auto" scrollbars="vertical" className={styles.results}>
            {results.length > 0 ? (
              <LayoutGroup id="search-results">
                <Flex direction="column" gap="1">
                  {results.map((item, index) => {
                    const Icon = item.icon;
                    const selected = index === selectedIndex;
                    return (
                      <Box key={item.id} position="relative">
                        {selected ? <motion.span layoutId="search-active" className={styles.activePill} transition={{ type: "spring", stiffness: 520, damping: 42 }} /> : null}
                        <Section asChild size="1" py="2">
                          <button type="button" className={styles.result} data-selected={selected ? "true" : "false"} onClick={() => handleSelect(item)} onMouseEnter={() => setSelectedIndex(index)}>
                            <Container size="4" px="3">
                              <Flex align="center" gap="3">
                                <Flex align="center" justify="center" flexShrink="0" className={styles.icon}>
                                  <Icon size={18} />
                                </Flex>
                                <Flex direction="column" minWidth="0">
                                  <Text size="2" weight="medium" truncate>
                                    {item.title}
                                  </Text>
                                  <Text size="1" color="gray" truncate>
                                    {item.description}
                                  </Text>
                                </Flex>
                              </Flex>
                            </Container>
                          </button>
                        </Section>
                      </Box>
                    );
                  })}
                </Flex>
              </LayoutGroup>
            ) : (
              <Section size="1" py="6">
                <Text as="p" align="center" size="2" color="gray">
                  {t("search.noResults", { query: searchQuery })}
                </Text>
              </Section>
            )}
          </ScrollArea>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
});

SearchModal.displayName = "SearchModal";
export default SearchModal;
