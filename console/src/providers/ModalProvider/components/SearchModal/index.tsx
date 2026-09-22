import { FileDescriptionIcon, HomeIcon, MagnifierIcon, RouterIcon, ShieldCheck, StackIcon, XIcon, type AnimatedIconComponent } from "nfx-ui/icons";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button as RadixButton } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { Button, Input } from "@/components";

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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const searchMutation = useSearchCertificate();

  const { t } = useTranslation(["common", "modal", "navigation"]);

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
        title: t("addCert", { ns: "navigation" }),
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

  const results = searchQuery.trim() ? [...certItems, ...filteredNav] : filteredNav;

  useEffect(() => {
    const keyword = searchQuery.trim();
    if (!keyword) {
      searchMutation.reset();
      return;
    }
    const timer = window.setTimeout(() => {
      void searchMutation.mutateAsync({ keyword, offset: 0, limit: 20 });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

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
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    else if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const handleDialogClose = useCallback(() => {
    hideModal("search");
  }, [hideModal]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  return (
    <dialog ref={dialogRef} className={styles.modal} onClose={handleDialogClose}>
      <div className={styles.searchBox}>
        <div className={styles.searchField}>
          <Input
            ref={inputRef}
            fullWidth
            variant="filled"
            leftIcon={<MagnifierIcon size={20} />}
            type="text"
            placeholder={t("search.placeholder", { ns: "common" })}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        {searchQuery ? (
          <Button
            type="button"
            variant="ghost"
            iconOnly
            leftIcon={<XIcon size={16} />}
            onClick={() => setSearchQuery("")}
            className={styles.clearBtn}
            aria-label="Clear search"
          />
        ) : null}
      </div>

      <div className={styles.results}>
        {results.length > 0 ? (
          results.map((item, index) => {
            const Icon = item.icon;
            return (
              <RadixButton
                key={item.id}
                type="button"
                variant="ghost"
                className={`${styles.resultItem} ${index === selectedIndex ? styles.selected : ""}`}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className={styles.resultIcon}>
                  <Icon size={20} />
                </div>
                <div className={styles.resultContent}>
                  <div className={styles.resultTitle}>{item.title}</div>
                  <div className={styles.resultDescription}>{item.description}</div>
                </div>
              </RadixButton>
            );
          })
        ) : (
          <div className={styles.noResults}>
            <p>{t("search.noResults", { ns: "modal", query: searchQuery }) || `No results found for "${searchQuery}"`}</p>
          </div>
        )}
      </div>
    </dialog>
  );
});

SearchModal.displayName = "SearchModal";
export default SearchModal;
