import { PlusIcon } from "@radix-ui/react-icons";
import { ArrowNarrowLeftIcon, CheckedIcon, MagnifierIcon, StackIcon, TriangleAlertIcon, WorldIcon, XIcon } from "nfx-ui/icons";
import type { ReactNode } from "react";
import { memo, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { Badge, Box, Button, Card, Checkbox, Code, Container, Flex, Grid, IconButton, ScrollArea, Section, Tabs, Text, Tooltip } from "@radix-ui/themes";
import gsap from "gsap";
import { PageFrame } from "@/layouts";
import { ActionBar, Dropdown, EmptyState, Input, PageHeader } from "@/components";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { getApiError } from "nfx-ui/utils";

import TtlDropdown from "@/features/dns/TtlDropdown";
import { formatNamecheapTtl, NAMECHEAP_AUTOMATIC_TTL } from "@/features/dns/ttl";
import { isNamecheapBulkFilterAll, isNamecheapBulkPatchKeep, NAMECHEAP_BULK_FILTER_ALL, NAMECHEAP_BULK_PATCH_KEEP } from "@/features/dns/bulkFilter";
import { NamecheapBulkHostActionEnum, NamecheapHostTypeEnum, NAMECHEAP_HOST_TYPE_VALUES } from "@/enums";
import { useBulkNamecheapHosts, useNamecheapCredential, useNamecheapDomains, usePreviewNamecheapHosts } from "@/hooks/dns";
import { ROUTES } from "@/navigations";
import { showConfirm, showError, showSuccess } from "@/stores/modal";
import type { BulkNamecheapHostRequest, NamecheapBulkHostChange, NamecheapBulkHostItem, NamecheapBulkHostSnap } from "@/types";

import styles from "./s.module.css";

gsap.registerPlugin(useGSAP);

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Flex direction="column" gap="1" minWidth="0">
      <Text size="1" weight="medium" color="gray">
        {label}
      </Text>
      {children}
    </Flex>
  );
}

function AddressInput({
  value,
  placeholder,
  self,
  onValue,
  onSelf,
}: {
  value: string;
  placeholder: string;
  self: boolean;
  onValue: (value: string) => void;
  onSelf: (next: boolean) => void;
}) {
  const { t } = useTranslation("dns");
  return (
    <Flex gap="2" align="center" width="100%">
      <Flex direction="column" flexGrow="1" minWidth="0">
        <Input
          size="2"
          value={self ? "" : value}
          placeholder={self ? t("bulk.addressSelfPlaceholder") : placeholder}
          disabled={self}
          onChange={(event) => onValue(event.target.value)}
        />
      </Flex>
      <Text as="label" size="1" color="gray" wrap="nowrap">
        <Flex gap="1" align="center">
          <Checkbox size="1" checked={self} onCheckedChange={(value) => onSelf(value === true)} />
          {t("bulk.addressSelfShort")}
        </Flex>
      </Text>
    </Flex>
  );
}

function FilterFields({
  host,
  type,
  address,
  ttl,
  mx,
  typeOptions,
  onHost,
  onType,
  onAddress,
  onTtl,
  onMx,
}: {
  host: string;
  type: string;
  address: string;
  ttl: string;
  mx: string;
  typeOptions: { value: string; label: string }[];
  onHost: (value: string) => void;
  onType: (value: string) => void;
  onAddress: (value: string) => void;
  onTtl: (value: string) => void;
  onMx: (value: string) => void;
}) {
  const { t } = useTranslation("dns");
  return (
    <Flex direction="column" gap="3">
      <Text size="1" weight="bold" className={styles.kicker}>
        {t("bulk.filter")}
      </Text>
      <Grid columns={{ initial: "1", sm: "2", lg: "5" }} gap="3" width="100%">
        <Field label={t("bulk.host")}>
          <Input size="2" value={host} placeholder={t("bulk.any")} onChange={(event) => onHost(event.target.value)} />
        </Field>
        <Field label={t("bulk.type")}>
          <Dropdown size="2" options={typeOptions} value={type} onChange={onType} />
        </Field>
        <Field label={t("bulk.address")}>
          <Input size="2" value={address} placeholder={t("bulk.any")} onChange={(event) => onAddress(event.target.value)} />
        </Field>
        <Field label={t("bulk.ttl")}>
          <TtlDropdown size="2" value={ttl} automaticLabel={t("bulk.ttlAutomatic")} unsetValue={NAMECHEAP_BULK_FILTER_ALL} unsetLabel={t("bulk.any")} onChange={onTtl} />
        </Field>
        <Field label={t("bulk.mxPref")}>
          <Input size="2" value={mx} placeholder={t("bulk.any")} onChange={(event) => onMx(event.target.value)} />
        </Field>
      </Grid>
    </Flex>
  );
}

function HostTypeFields({
  host,
  type,
  typeOptions,
  onHost,
  onType,
}: {
  host: string;
  type: string;
  typeOptions: { value: string; label: string }[];
  onHost: (value: string) => void;
  onType: (value: string) => void;
}) {
  const { t } = useTranslation("dns");
  return (
    <Grid columns={{ initial: "1", sm: "2" }} gap="3" width="100%">
      <Field label={t("bulk.host")}>
        <Input size="2" value={host} placeholder={t("bulk.any")} onChange={(event) => onHost(event.target.value)} />
      </Field>
      <Field label={t("bulk.type")}>
        <Dropdown size="2" options={typeOptions} value={type} onChange={onType} />
      </Field>
    </Grid>
  );
}

function HostSnapLine({ snap, empty, ttlAutomatic, mark }: { snap?: NamecheapBulkHostSnap | null; empty: string; ttlAutomatic: string; mark?: boolean }) {
  if (!snap) {
    return (
      <Text size="1" color="gray">
        {empty}
      </Text>
    );
  }
  return (
    <Flex direction="column" gap="1" width="100%">
      <Code size="1" variant="ghost">
        {snap.name} · {snap.type}
      </Code>
      <Text size="1" color={mark ? undefined : "gray"} className={mark ? styles.changed : styles.mono}>
        {snap.address} · TTL {formatNamecheapTtl(snap.ttl, ttlAutomatic)} · MX {snap.mxPref || "—"}
      </Text>
    </Flex>
  );
}

function changeMarked(change: NamecheapBulkHostChange): boolean {
  const before = change.before;
  const after = change.after;
  if (!before || !after) return true;
  return before.address !== after.address || before.ttl !== after.ttl || before.mxPref !== after.mxPref;
}

type AddDraft = {
  name: string;
  type: string;
  address: string;
  ttl: string;
  mxPref: string;
  addressSelf: boolean;
};

const emptyAdd = (): AddDraft => ({
  name: "@",
  type: NamecheapHostTypeEnum.A,
  address: "",
  ttl: NAMECHEAP_AUTOMATIC_TTL,
  mxPref: "10",
  addressSelf: false,
});

type ReplaceDraft = {
  from: string;
  to: string;
};

const emptyReplace = (): ReplaceDraft => ({ from: "", to: "" });

type CopyRuleDraft = {
  type: string;
  hosts: string;
};

const emptyCopyRule = (): CopyRuleDraft => ({ type: NamecheapHostTypeEnum.A, hosts: "" });

const splitHosts = (value: string) => value.split(/[\s,，]+/).filter(Boolean);

function AffectedPane({
  items,
  side,
  title,
  empty,
  missing,
  ttlAutomatic,
}: {
  items: NamecheapBulkHostItem[];
  side: "before" | "after";
  title: string;
  empty: string;
  missing: string;
  ttlAutomatic: string;
}) {
  const blocks = items.filter((item) => (item.changes?.length ?? 0) > 0 || item.status === "failed");
  return (
    <Flex direction="column" gap="3" minWidth="0">
      <Text size="1" weight="bold" className={styles.kicker}>
        {title}
      </Text>
      {blocks.length === 0 ? (
        <Text size="2" color="gray">
          {empty}
        </Text>
      ) : (
        <ListFrame>
          {blocks.map((item) => (
            <Box key={item.domain} className={styles.item}>
              <Section size="1" py="3">
                <Container size="4" px="3">
                  <Flex direction="column" gap="3">
                    <Text size="2" weight="bold">
                      {item.domain}
                    </Text>
                    {(item.changes ?? []).map((change, index) => (
                      <HostSnapLine
                        key={`${item.domain}-${index}`}
                        snap={side === "before" ? change.before : change.after}
                        empty={missing}
                        ttlAutomatic={ttlAutomatic}
                        mark={side === "after" && changeMarked(change)}
                      />
                    ))}
                    {item.status === "failed" ? (
                      <Text size="1" color="red">
                        {item.message}
                      </Text>
                    ) : null}
                  </Flex>
                </Container>
              </Section>
            </Box>
          ))}
        </ListFrame>
      )}
    </Flex>
  );
}

function ListFrame({ children }: { children: ReactNode }) {
  return (
    <Box className={styles.listFrame}>
      <ScrollArea type="auto" scrollbars="vertical" className={styles.listScroll}>
        {children}
      </ScrollArea>
    </Box>
  );
}

const NamecheapDomainsBulkPage = memo(() => {
  const { t } = useTranslation("dns");
  const { credentialId = "" } = useParams();
  const navigate = useNavigate();
  const credentialQuery = useNamecheapCredential(credentialId);
  const domainsQuery = useNamecheapDomains(credentialId);
  const preview = usePreviewNamecheapHosts();
  const bulk = useBulkNamecheapHosts();
  const domains = domainsQuery.data?.items ?? [];
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [stage, setStage] = useState<1 | 2>(1);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [action, setAction] = useState(NamecheapBulkHostActionEnum.UPDATE);
  const [filterHost, setFilterHost] = useState("");
  const [filterType, setFilterType] = useState(NAMECHEAP_BULK_FILTER_ALL);
  const [filterAddress, setFilterAddress] = useState("");
  const [filterTtl, setFilterTtl] = useState(NAMECHEAP_BULK_FILTER_ALL);
  const [filterMx, setFilterMx] = useState("");
  const [patchAddress, setPatchAddress] = useState("");
  const [patchTtl, setPatchTtl] = useState(NAMECHEAP_BULK_PATCH_KEEP);
  const [patchMx, setPatchMx] = useState("");
  const [patchAddressSelf, setPatchAddressSelf] = useState(false);
  const [adds, setAdds] = useState<AddDraft[]>(() => [emptyAdd()]);
  const [replaces, setReplaces] = useState<ReplaceDraft[]>(() => [emptyReplace()]);
  const [copySource, setCopySource] = useState("");
  const [copyRules, setCopyRules] = useState<CopyRuleDraft[]>(() => [emptyCopyRule()]);
  const [copyOverwrite, setCopyOverwrite] = useState(false);
  const [copyRewrite, setCopyRewrite] = useState(true);
  const [review, setReview] = useState<NamecheapBulkHostItem[]>([]);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      gsap.to(track, { xPercent: stage === 2 ? -50 : 0, duration: reduce ? 0 : 0.45, ease: "power3.inOut", overwrite: true });
    },
    { scope: stageRef, dependencies: [stage] },
  );

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const needle = query.trim().toLowerCase();
  const available = domains.filter((row) => {
    if (selectedSet.has(row.name)) return false;
    if (!needle) return true;
    return row.name.toLowerCase().includes(needle);
  });
  const isUpdate = action === NamecheapBulkHostActionEnum.UPDATE;
  const isReplace = action === NamecheapBulkHostActionEnum.REPLACE;
  const isCopy = action === NamecheapBulkHostActionEnum.COPY;
  const isAdd = action === NamecheapBulkHostActionEnum.ADD;
  const isDelete = action === NamecheapBulkHostActionEnum.DELETE;
  const hostTypeOnly = isDelete || isReplace;

  const anyOption = { value: NAMECHEAP_BULK_FILTER_ALL, label: t("bulk.any") };
  const typeFilterOptions = [anyOption, ...NAMECHEAP_HOST_TYPE_VALUES.map((value) => ({ value, label: value }))];
  const typeAddOptions = NAMECHEAP_HOST_TYPE_VALUES.map((value) => ({ value, label: value }));

  const patchAddressValue = patchAddressSelf ? "" : patchAddress.trim();
  const patchTtlValue = isNamecheapBulkPatchKeep(patchTtl) ? "" : patchTtl;
  const patchMxValue = patchMx.trim();
  const updateReady = Boolean(patchAddressValue || patchTtlValue || patchMxValue || patchAddressSelf);
  const completeAdds = adds
    .map((row) => ({
      name: row.name.trim(),
      type: row.type.trim(),
      address: row.addressSelf ? "" : row.address.trim(),
      ttl: row.ttl,
      mxPref: row.mxPref.trim(),
      addressSelf: row.addressSelf,
    }))
    .filter((row) => row.name && row.type && (row.address || row.addressSelf));
  const addReady = completeAdds.length > 0;
  const addSummary = completeAdds.map((row) => `${row.type} ${row.name}${row.addressSelf ? ` ${t("bulk.addressSelfShort")}` : ""}`).join(" · ");
  const completeReplaces = replaces
    .map((row) => ({ from: row.from.trim(), to: row.to.trim() }))
    .filter((row) => row.from && row.to && row.from.toLowerCase() !== row.to.toLowerCase());
  const replaceReady = completeReplaces.length > 0;
  const replaceSummary = completeReplaces.map((row) => `${row.from}→${row.to}`).join(" · ");
  const filterReady = !isNamecheapBulkFilterAll(filterHost) || !isNamecheapBulkFilterAll(filterType);
  const completeCopyRules = copyRules.map((row) => ({ type: row.type, hosts: splitHosts(row.hosts) })).filter((row) => row.type);
  const copyReady = Boolean(copySource) && completeCopyRules.length > 0;
  const copySummary = completeCopyRules.map((row) => `${row.type} ${row.hosts.length ? row.hosts.join(",") : t("bulk.any")}`).join(" · ");
  const sourceOptions = domains.map((row) => ({ value: row.name, label: row.name }));
  const actionReady = isUpdate ? updateReady : isReplace ? replaceReady : isCopy ? copyReady : isAdd ? addReady : filterReady;
  const canPreview = selected.length > 0 && !preview.isPending && actionReady;
  const affectedCount = review.reduce((sum, item) => sum + (item.changes?.length ?? 0), 0);
  const canSubmit = stage === 2 && affectedCount > 0 && !bulk.isPending;

  const filterSummary = [
    !isNamecheapBulkFilterAll(filterHost) ? `${t("bulk.host")}=${filterHost}` : null,
    !isNamecheapBulkFilterAll(filterType) ? `${t("bulk.type")}=${filterType}` : null,
    !hostTypeOnly && filterAddress.trim() ? `${t("bulk.address")}=${filterAddress.trim()}` : null,
    !hostTypeOnly && !isNamecheapBulkFilterAll(filterTtl) ? `${t("bulk.ttl")}=${filterTtl}` : null,
    !hostTypeOnly && filterMx.trim() ? `${t("bulk.mxPref")}=${filterMx.trim()}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const patchSummary = [
    patchAddressSelf ? `${t("bulk.address")}→${t("bulk.addressSelfShort")}` : patchAddressValue ? `${t("bulk.address")}→${patchAddressValue}` : null,
    patchTtlValue ? `${t("bulk.ttl")}→${patchTtlValue}` : null,
    patchMxValue ? `${t("bulk.mxPref")}→${patchMxValue}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const buildRequest = (): BulkNamecheapHostRequest => {
    if (isCopy) {
      return {
        action,
        domains: selected,
        copy: { source: copySource, rules: completeCopyRules, overwrite: copyOverwrite, rewriteDomain: copyRewrite },
      };
    }
    if (isAdd) {
      return { action, domains: selected, adds: completeAdds };
    }
    if (hostTypeOnly) {
      return {
        action,
        domains: selected,
        filter: {
          name: isNamecheapBulkFilterAll(filterHost) ? NAMECHEAP_BULK_FILTER_ALL : filterHost.trim(),
          type: filterType,
        },
        replaces: isReplace ? completeReplaces : undefined,
      };
    }
    return {
      action,
      domains: selected,
      filter: {
        name: isNamecheapBulkFilterAll(filterHost) ? NAMECHEAP_BULK_FILTER_ALL : filterHost.trim(),
        type: filterType,
        address: filterAddress.trim(),
        ttl: isNamecheapBulkFilterAll(filterTtl) ? NAMECHEAP_BULK_FILTER_ALL : filterTtl,
        mxPref: filterMx.trim(),
      },
      patch: { address: patchAddressValue, ttl: patchTtlValue, mxPref: patchMxValue, addressSelf: patchAddressSelf },
    };
  };

  const addDomain = (name: string) => {
    setSelected((current) => (current.includes(name) ? current : [...current, name]));
  };

  const removeDomain = (name: string) => {
    setSelected((current) => current.filter((row) => row !== name));
  };

  const addAvailable = () => {
    setSelected((current) => [...current, ...available.map((row) => row.name)]);
  };

  const clearSelected = () => setSelected([]);

  const patchReplace = (index: number, next: Partial<ReplaceDraft>) => {
    setReplaces((current) => current.map((row, i) => (i === index ? { ...row, ...next } : row)));
  };

  const appendReplace = () => setReplaces((current) => [...current, emptyReplace()]);

  const patchCopyRule = (index: number, next: Partial<CopyRuleDraft>) => {
    setCopyRules((current) => current.map((row, i) => (i === index ? { ...row, ...next } : row)));
  };

  const appendCopyRule = () => setCopyRules((current) => [...current, emptyCopyRule()]);

  const removeCopyRule = (index: number) => {
    setCopyRules((current) => (current.length === 1 ? current : current.filter((_, i) => i !== index)));
  };

  const removeReplace = (index: number) => {
    setReplaces((current) => (current.length === 1 ? current : current.filter((_, i) => i !== index)));
  };

  const patchAdd = (index: number, next: Partial<AddDraft>) => {
    setAdds((current) => current.map((row, i) => (i === index ? { ...row, ...next } : row)));
  };

  const appendAdd = () => setAdds((current) => [...current, emptyAdd()]);

  const removeAdd = (index: number) => {
    setAdds((current) => (current.length === 1 ? current : current.filter((_, i) => i !== index)));
  };

  const goReview = () => {
    void preview.mutateAsync({ id: credentialId, request: buildRequest() }).then((data) => {
      setReview(data.items ?? []);
      setStage(2);
    });
  };

  const goBack = () => setStage(1);

  const confirmMessage = () => {
    const filter = filterSummary || t("bulk.anyRecord");
    if (isDelete) return t("bulk.confirmDelete", { count: selected.length, filter });
    if (isUpdate) return t("bulk.confirmUpdate", { count: selected.length, filter, patch: patchSummary });
    if (isReplace) return t("bulk.confirmReplace", { count: selected.length, filter, pairs: replaceSummary });
    if (isCopy) {
      const mode = copyOverwrite ? t("bulk.copyModeOverwrite") : t("bulk.copyModeMerge");
      return t("bulk.confirmCopy", { count: selected.length, source: copySource, rules: copySummary, mode });
    }
    return t("bulk.confirmAdd", { count: selected.length, hosts: addSummary });
  };

  const submit = () => {
    showConfirm({
      title: t("bulk.confirmTitle"),
      message: confirmMessage(),
      confirmText: t("bulk.submit"),
      cancelText: t("bulk.cancel"),
      onConfirm: () => {
        void bulk.mutateAsync({ id: credentialId, request: buildRequest() }).then((data) => {
          const items = data.items ?? [];
          const failed = items.filter((item) => item.status === "failed");
          if (failed.length) {
            showError(failed.map((item) => `${item.domain}: ${item.message || item.status}`).join("\n"));
            setReview(items);
            return;
          }
          showSuccess(t("bulk.applyOk", { count: affectedCount }));
          setStage(1);
          setReview([]);
        });
      },
    });
  };

  const lists = (() => {
    if (domainsQuery.isLoading) return <EmptyState icon={WorldIcon} title={t("loading")} />;
    if (domainsQuery.isError) {
      return <EmptyState icon={TriangleAlertIcon} title={t("domains.loadError")} description={getApiError(domainsQuery.error)?.message} />;
    }
    return (
      <Grid columns={{ initial: "1", md: "2" }} gap="4" width="100%" align="start">
        <Flex direction="column" gap="3" minWidth="0">
          <Flex align="center" justify="between" gap="2">
            <Text size="1" weight="bold" className={styles.kicker}>
              {t("bulk.available")}
            </Text>
            <Button type="button" size="1" variant="soft" disabled={available.length === 0} onClick={addAvailable}>
              <PlusIcon />
              {t("bulk.selectAll")}
            </Button>
          </Flex>
          <Input size="2" value={query} placeholder={t("bulk.search")} onChange={(event) => setQuery(event.target.value)} />
          {available.length === 0 ? (
            <Text size="2" color="gray">
              {t("bulk.noneAvailable")}
            </Text>
          ) : (
            <ListFrame>
              {available.map((row) => (
                <Box key={row.name} className={styles.item}>
                  <button type="button" className={styles.pick} onClick={() => addDomain(row.name)}>
                    <Section size="1" py="2">
                      <Container size="4" px="3">
                        <Flex align="center" justify="between" gap="3">
                          <Text size="2">{row.name}</Text>
                          <PlusIcon className={styles.pickIcon} />
                        </Flex>
                      </Container>
                    </Section>
                  </button>
                </Box>
              ))}
            </ListFrame>
          )}
        </Flex>
        <Flex direction="column" gap="3" minWidth="0">
          <Flex align="center" justify="between" gap="2">
            <Text size="1" weight="bold" className={styles.kicker}>
              {t("bulk.selected", { count: selected.length })}
            </Text>
            <Button type="button" size="1" variant="soft" color="red" disabled={selected.length === 0} onClick={clearSelected}>
              <XIcon size={12} />
              {t("bulk.clearAll")}
            </Button>
          </Flex>
          {selected.length === 0 ? (
            <EmptyState icon={StackIcon} title={t("bulk.noneSelected")} />
          ) : (
            <ListFrame>
              {selected.map((name) => (
                <Box key={name} className={styles.item}>
                  <Section size="1" py="2">
                    <Container size="4" px="3">
                      <Flex align="center" justify="between" gap="3" width="100%">
                        <Flex align="center" gap="2" minWidth="0">
                          <CheckedIcon size={14} className={styles.check} />
                          <Text size="2" weight="medium" truncate>
                            {name}
                          </Text>
                        </Flex>
                        <Tooltip content={t("bulk.remove")}>
                          <IconButton type="button" size="1" variant="ghost" color="red" aria-label={t("bulk.remove")} onClick={() => removeDomain(name)}>
                            <XIcon size={12} />
                          </IconButton>
                        </Tooltip>
                      </Flex>
                    </Container>
                  </Section>
                </Box>
              ))}
            </ListFrame>
          )}
        </Flex>
      </Grid>
    );
  })();

  return (
    <PageFrame>
      <PageHeader
        icon={StackIcon}
        index={t("index")}
        title={t("bulk.title")}
        description={credentialQuery.data ? `${credentialQuery.data.apiUser} · ${t("bulk.subtitle")}` : t("bulk.subtitle")}
      />
      <ActionBar
        status={
          <Badge size="2" variant="surface" radius="full">
            {t("bulk.selected", { count: selected.length })}
          </Badge>
        }
      >
        <Button variant="outline" color="gray" onClick={() => navigate(ROUTES.NAMECHEAP_DOMAINS.replace(":credentialId", credentialId))}>
          <ArrowNarrowLeftIcon size={16} />
          {t("bulk.back")}
        </Button>
      </ActionBar>
      <Flex direction="column" gap="4" width="100%">
        <Box ref={stageRef} className={styles.stage}>
          <Flex ref={trackRef} className={styles.track}>
            <Flex direction="column" className={styles.board}>{lists}</Flex>
            <Flex direction="column" className={styles.board}>
              <Grid columns={{ initial: "1", md: "2" }} gap="4" width="100%" align="start">
                <AffectedPane
                  items={review}
                  side="before"
                  title={t("bulk.original")}
                  empty={t("bulk.noneAffected")}
                  missing={t("bulk.added")}
                  ttlAutomatic={t("bulk.ttlAutomatic")}
                />
                <AffectedPane
                  items={review}
                  side="after"
                  title={t("bulk.affected")}
                  empty={t("bulk.noneAffected")}
                  missing={t("bulk.removed")}
                  ttlAutomatic={t("bulk.ttlAutomatic")}
                />
              </Grid>
            </Flex>
          </Flex>
        </Box>
        <Card size="3" variant="classic">
            <Flex direction="column" gap="4">
              {stage === 1 ? (
                <Tabs.Root value={action} onValueChange={(value) => setAction(value as NamecheapBulkHostActionEnum)}>
                  <Tabs.List>
                    <Tabs.Trigger value={NamecheapBulkHostActionEnum.UPDATE}>{t("bulk.actionUpdate")}</Tabs.Trigger>
                    <Tabs.Trigger value={NamecheapBulkHostActionEnum.REPLACE}>{t("bulk.actionReplace")}</Tabs.Trigger>
                    <Tabs.Trigger value={NamecheapBulkHostActionEnum.COPY}>{t("bulk.actionCopy")}</Tabs.Trigger>
                    <Tabs.Trigger value={NamecheapBulkHostActionEnum.ADD}>{t("bulk.actionAdd")}</Tabs.Trigger>
                    <Tabs.Trigger value={NamecheapBulkHostActionEnum.DELETE}>{t("bulk.actionDelete")}</Tabs.Trigger>
                  </Tabs.List>
                  <Section size="1" pt="4" pb="0">
                    <Tabs.Content value={NamecheapBulkHostActionEnum.UPDATE}>
                      <Flex direction="column" gap="3">
                        <Text size="2" color="gray">
                          {t("bulk.updateHint")}
                        </Text>
                        <FilterFields
                          host={filterHost}
                          type={filterType}
                          address={filterAddress}
                          ttl={filterTtl}
                          mx={filterMx}
                          typeOptions={typeFilterOptions}
                          onHost={setFilterHost}
                          onType={setFilterType}
                          onAddress={setFilterAddress}
                          onTtl={setFilterTtl}
                          onMx={setFilterMx}
                        />
                        <Text size="1" weight="bold" className={styles.kicker}>
                          {t("bulk.patch")}
                        </Text>
                        <Grid columns={{ initial: "1", sm: "2", lg: "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr)" }} gap="3" width="100%">
                          <Field label={t("bulk.address")}>
                            <AddressInput
                              value={patchAddress}
                              placeholder={t("bulk.keep")}
                              self={patchAddressSelf}
                              onValue={setPatchAddress}
                              onSelf={setPatchAddressSelf}
                            />
                          </Field>
                          <Field label={t("bulk.ttl")}>
                            <TtlDropdown
                              size="2"
                              value={patchTtl}
                              automaticLabel={t("bulk.ttlAutomatic")}
                              unsetValue={NAMECHEAP_BULK_PATCH_KEEP}
                              unsetLabel={t("bulk.keep")}
                              onChange={setPatchTtl}
                            />
                          </Field>
                          <Field label={t("bulk.mxPref")}>
                            <Input size="2" value={patchMx} placeholder={t("bulk.keep")} onChange={(event) => setPatchMx(event.target.value)} />
                          </Field>
                        </Grid>
                      </Flex>
                    </Tabs.Content>
                    <Tabs.Content value={NamecheapBulkHostActionEnum.REPLACE}>
                      <Flex direction="column" gap="3">
                        <Text size="2" color="gray">
                          {t("bulk.replaceHint")}
                        </Text>
                        <Text size="1" weight="bold" className={styles.kicker}>
                          {t("bulk.filter")}
                        </Text>
                        <HostTypeFields host={filterHost} type={filterType} typeOptions={typeFilterOptions} onHost={setFilterHost} onType={setFilterType} />
                        <Text size="1" weight="bold" className={styles.kicker}>
                          {t("bulk.patch")}
                        </Text>
                        {replaces.map((row, index) => (
                          <Grid key={`replace-${index}`} columns={{ initial: "1", sm: "minmax(0, 1fr) minmax(0, 1fr) auto" }} gap="3" width="100%" align="end">
                            <Field label={t("bulk.replaceFrom")}>
                              <Input size="2" value={row.from} placeholder="108.172.51.130" onChange={(event) => patchReplace(index, { from: event.target.value })} />
                            </Field>
                            <Field label={t("bulk.replaceTo")}>
                              <Input size="2" value={row.to} placeholder="108.172.48.88" onChange={(event) => patchReplace(index, { to: event.target.value })} />
                            </Field>
                            <Tooltip content={t("bulk.remove")}>
                              <IconButton type="button" size="2" variant="soft" color="red" aria-label={t("bulk.remove")} disabled={replaces.length === 1} onClick={() => removeReplace(index)}>
                                <XIcon size={14} />
                              </IconButton>
                            </Tooltip>
                          </Grid>
                        ))}
                        <Flex>
                          <Button type="button" size="1" variant="outline" color="gray" onClick={appendReplace}>
                            <PlusIcon />
                            {t("bulk.replaceRow")}
                          </Button>
                        </Flex>
                      </Flex>
                    </Tabs.Content>
                    <Tabs.Content value={NamecheapBulkHostActionEnum.COPY}>
                      <Flex direction="column" gap="3">
                        <Text size="2" color="gray">
                          {t("bulk.copyHint")}
                        </Text>
                        <Grid columns={{ initial: "1", sm: "2" }} gap="3" width="100%">
                          <Field label={t("bulk.copySource")}>
                            <Dropdown size="2" options={sourceOptions} value={copySource} placeholder={t("bulk.copySourcePlaceholder")} onChange={setCopySource} />
                          </Field>
                        </Grid>
                        <Text size="1" weight="bold" className={styles.kicker}>
                          {t("bulk.copyRules")}
                        </Text>
                        {copyRules.map((row, index) => (
                          <Grid key={`copy-${index}`} columns={{ initial: "1", sm: "minmax(0, 1fr) minmax(0, 3fr) auto" }} gap="3" width="100%" align="end">
                            <Field label={t("bulk.type")}>
                              <Dropdown size="2" options={typeFilterOptions} value={row.type} onChange={(type) => patchCopyRule(index, { type })} />
                            </Field>
                            <Field label={t("bulk.copyHosts")}>
                              <Input size="2" value={row.hosts} placeholder={t("bulk.copyHostsPlaceholder")} onChange={(event) => patchCopyRule(index, { hosts: event.target.value })} />
                            </Field>
                            <Tooltip content={t("bulk.remove")}>
                              <IconButton type="button" size="2" variant="soft" color="red" aria-label={t("bulk.remove")} disabled={copyRules.length === 1} onClick={() => removeCopyRule(index)}>
                                <XIcon size={14} />
                              </IconButton>
                            </Tooltip>
                          </Grid>
                        ))}
                        <Flex>
                          <Button type="button" size="1" variant="outline" color="gray" onClick={appendCopyRule}>
                            <PlusIcon />
                            {t("bulk.copyRow")}
                          </Button>
                        </Flex>
                        <Flex direction="column" gap="2">
                          <Text as="label" size="2">
                            <Flex gap="2" align="center">
                              <Checkbox checked={copyOverwrite} onCheckedChange={(value) => setCopyOverwrite(value === true)} />
                              {t("bulk.copyOverwrite")}
                            </Flex>
                          </Text>
                          <Text as="label" size="2">
                            <Flex gap="2" align="center">
                              <Checkbox checked={copyRewrite} onCheckedChange={(value) => setCopyRewrite(value === true)} />
                              {t("bulk.copyRewrite")}
                            </Flex>
                          </Text>
                        </Flex>
                      </Flex>
                    </Tabs.Content>
                    <Tabs.Content value={NamecheapBulkHostActionEnum.ADD}>
                      <Flex direction="column" gap="3">
                        <Text size="2" color="gray">
                          {t("bulk.addHint")}
                        </Text>
                        {adds.map((row, index) => (
                          <Grid
                            key={`add-${index}`}
                            columns={{ initial: "1", sm: "2", lg: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) auto" }}
                            gap="3"
                            width="100%"
                            align="end"
                          >
                            <Field label={t("bulk.host")}>
                              <Input size="2" value={row.name} placeholder="@" onChange={(event) => patchAdd(index, { name: event.target.value })} />
                            </Field>
                            <Field label={t("bulk.type")}>
                              <Dropdown size="2" options={typeAddOptions} value={row.type} onChange={(value) => patchAdd(index, { type: value })} />
                            </Field>
                            <Field label={t("bulk.address")}>
                              <AddressInput
                                value={row.address}
                                placeholder="108.172.51.130"
                                self={row.addressSelf}
                                onValue={(address) => patchAdd(index, { address })}
                                onSelf={(addressSelf) => patchAdd(index, { addressSelf, address: addressSelf ? "" : row.address })}
                              />
                            </Field>
                            <Field label={t("bulk.ttl")}>
                              <TtlDropdown size="2" value={row.ttl} automaticLabel={t("bulk.ttlAutomatic")} onChange={(value) => patchAdd(index, { ttl: value })} />
                            </Field>
                            <Field label={t("bulk.mxPref")}>
                              <Input size="2" value={row.mxPref} onChange={(event) => patchAdd(index, { mxPref: event.target.value })} />
                            </Field>
                            <Tooltip content={t("bulk.remove")}>
                              <IconButton type="button" size="2" variant="ghost" color="red" aria-label={t("bulk.remove")} disabled={adds.length === 1} onClick={() => removeAdd(index)}>
                                <XIcon size={14} />
                              </IconButton>
                            </Tooltip>
                          </Grid>
                        ))}
                        <Flex>
                          <Button type="button" size="1" variant="outline" color="gray" onClick={appendAdd}>
                            <PlusIcon />
                            {t("bulk.addRow")}
                          </Button>
                        </Flex>
                      </Flex>
                    </Tabs.Content>
                    <Tabs.Content value={NamecheapBulkHostActionEnum.DELETE}>
                      <Flex direction="column" gap="3">
                        <Text size="2" color="gray">
                          {t("bulk.deleteHint")}
                        </Text>
                        <HostTypeFields host={filterHost} type={filterType} typeOptions={typeFilterOptions} onHost={setFilterHost} onType={setFilterType} />
                      </Flex>
                    </Tabs.Content>
                  </Section>
                </Tabs.Root>
              ) : (
                <Text size="2" color="gray">
                  {t("bulk.reviewHint", { count: affectedCount })}
                </Text>
              )}
              <Section size="1" pt="4" pb="0" className={styles.footer}>
                <Flex justify="end" gap="2">
                  {stage === 2 ? (
                    <Button variant="outline" color="gray" onClick={goBack} disabled={bulk.isPending}>
                      {t("bulk.cancel")}
                    </Button>
                  ) : null}
                  {stage === 1 ? (
                    <Button onClick={goReview} disabled={!canPreview} loading={preview.isPending}>
                      <MagnifierIcon size={16} />
                      {t("bulk.confirm")}
                    </Button>
                  ) : (
                    <Button onClick={submit} disabled={!canSubmit} loading={bulk.isPending}>
                      <CheckedIcon size={16} />
                      {t("bulk.submit")}
                    </Button>
                  )}
                </Flex>
              </Section>
            </Flex>
        </Card>
      </Flex>
    </PageFrame>
  );
});

NamecheapDomainsBulkPage.displayName = "NamecheapDomainsBulkPage";

export default NamecheapDomainsBulkPage;
