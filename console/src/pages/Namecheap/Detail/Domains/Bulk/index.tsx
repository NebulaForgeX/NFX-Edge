import { RouterIcon } from "nfx-ui/icons";
import type { ReactNode } from "react";
import { memo, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { Box, Button, Checkbox, Flex, Tabs, Text } from "@radix-ui/themes";
import gsap from "gsap";
import { PageFrame } from "@/layouts";
import { Dropdown, EmptyState, Input, PageHeader } from "@/components";
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
    <Box className={styles.field}>
      <Flex direction="column" gap="1">
        <Text size="1">{label}</Text>
        {children}
      </Flex>
    </Box>
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
      <Box className={styles.grow}>
        <Input
          size="2"
          value={self ? "" : value}
          placeholder={self ? t("bulk.addressSelfPlaceholder") : placeholder}
          disabled={self}
          onChange={(event) => onValue(event.target.value)}
        />
      </Box>
      <Checkbox checked={self} onCheckedChange={(value) => onSelf(value === true)} />
      <Text size="1">{t("bulk.addressSelfShort")}</Text>
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
      <Text size="2" weight="bold">
        {t("bulk.filter")}
      </Text>
      <Flex gap="3" wrap="wrap" width="100%">
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
      </Flex>
    </Flex>
  );
}

function HostSnapLine({ snap, empty, ttlAutomatic, mark }: { snap?: NamecheapBulkHostSnap | null; empty: string; ttlAutomatic: string; mark?: boolean }) {
  if (!snap) return <Text className={styles.hint}>{empty}</Text>;
  return (
    <Flex direction="column" gap="1" width="100%">
      <Text className={styles.hostLine}>
        {snap.name} · {snap.type}
      </Text>
      <Text size="1" color="gray" className={mark ? styles.changed : undefined}>
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
    <div className={styles.pane}>
      <Flex direction="column" gap="3">
        <Text size="2" weight="bold">
          {title}
        </Text>
        {blocks.length === 0 ? (
          <Text className={styles.hint}>{empty}</Text>
        ) : (
          <div className={styles.listFrame}>
            <div className={styles.listScroll}>
              {blocks.map((item) => (
                <Box key={item.domain} className={styles.item}>
                  <Box py="3">
                    <Box px="3">
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
                        {item.status === "failed" ? <Text className={styles.hint}>{item.message}</Text> : null}
                      </Flex>
                    </Box>
                  </Box>
                </Box>
              ))}
            </div>
          </div>
        )}
      </Flex>
    </div>
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
  const isAdd = action === NamecheapBulkHostActionEnum.ADD;
  const isDelete = action === NamecheapBulkHostActionEnum.DELETE;

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
  const filterReady = !isNamecheapBulkFilterAll(filterHost) || !isNamecheapBulkFilterAll(filterType);
  const canPreview = selected.length > 0 && !preview.isPending && (isUpdate ? updateReady : isAdd ? addReady : filterReady);
  const affectedCount = review.reduce((sum, item) => sum + (item.changes?.length ?? 0), 0);
  const canSubmit = stage === 2 && affectedCount > 0 && !bulk.isPending;

  const filterSummary = [
    !isNamecheapBulkFilterAll(filterHost) ? `${t("bulk.host")}=${filterHost}` : null,
    !isNamecheapBulkFilterAll(filterType) ? `${t("bulk.type")}=${filterType}` : null,
    !isDelete && filterAddress.trim() ? `${t("bulk.address")}=${filterAddress.trim()}` : null,
    !isDelete && !isNamecheapBulkFilterAll(filterTtl) ? `${t("bulk.ttl")}=${filterTtl}` : null,
    !isDelete && filterMx.trim() ? `${t("bulk.mxPref")}=${filterMx.trim()}` : null,
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
    if (isAdd) {
      return { action, domains: selected, adds: completeAdds };
    }
    if (isDelete) {
      return {
        action,
        domains: selected,
        filter: {
          name: isNamecheapBulkFilterAll(filterHost) ? NAMECHEAP_BULK_FILTER_ALL : filterHost.trim(),
          type: filterType,
        },
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

  const submit = () => {
    showConfirm({
      title: t("bulk.confirmTitle"),
      message: isDelete
        ? t("bulk.confirmDelete", { count: selected.length, filter: filterSummary || t("bulk.anyRecord") })
        : isUpdate
          ? t("bulk.confirmUpdate", { count: selected.length, filter: filterSummary || t("bulk.anyRecord"), patch: patchSummary })
          : t("bulk.confirmAdd", { count: selected.length, hosts: addSummary }),
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
    if (domainsQuery.isLoading) return <EmptyState icon={RouterIcon} title={t("loading")} />;
    if (domainsQuery.isError) {
      return <EmptyState icon={RouterIcon} title={t("domains.loadError")} description={getApiError(domainsQuery.error)?.message} />;
    }
    return (
      <Flex gap="4" width="100%" align="start">
        <div className={styles.pane}>
          <Flex direction="column" gap="3">
            <Text size="2" weight="bold">
              {t("bulk.available")}
            </Text>
            <Input size="2" value={query} placeholder={t("bulk.search")} onChange={(event) => setQuery(event.target.value)} />
            {available.length === 0 ? (
              <Text className={styles.hint}>{t("bulk.noneAvailable")}</Text>
            ) : (
              <div className={styles.listFrame}>
                <div className={styles.listScroll}>
                  {available.map((row) => (
                    <Box key={row.name} className={styles.item}>
                      <button type="button" className={styles.pick} onClick={() => addDomain(row.name)}>
                        <Box py="3">
                          <Box px="3">
                            <Text>{row.name}</Text>
                          </Box>
                        </Box>
                      </button>
                    </Box>
                  ))}
                </div>
              </div>
            )}
          </Flex>
        </div>
        <div className={styles.pane}>
          <Flex direction="column" gap="3">
            <Text size="2" weight="bold">
              {t("bulk.selected", { count: selected.length })}
            </Text>
            {selected.length === 0 ? (
              <Text className={styles.hint}>{t("bulk.noneSelected")}</Text>
            ) : (
              <div className={styles.listFrame}>
                <div className={styles.listScroll}>
                  {selected.map((name) => (
                    <Box key={name} className={styles.item}>
                      <Box py="3">
                        <Box px="3">
                          <Flex align="center" justify="between" gap="3" width="100%">
                            <Text>{name}</Text>
                            <Button type="button" size="1" variant="ghost" color="red" onClick={() => removeDomain(name)}>
                              {t("bulk.remove")}
                            </Button>
                          </Flex>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </div>
              </div>
            )}
          </Flex>
        </div>
      </Flex>
    );
  })();

  return (
    <PageFrame>
      <PageHeader
        icon={RouterIcon}
        index={t("index")}
        title={t("bulk.title")}
        description={credentialQuery.data ? `${credentialQuery.data.apiUser} · ${t("bulk.subtitle")}` : t("bulk.subtitle")}
        actions={
          <Button variant="outline" onClick={() => navigate(ROUTES.NAMECHEAP_DOMAINS.replace(":credentialId", credentialId))}>
            {t("bulk.back")}
          </Button>
        }
      />
      <Flex direction="column" gap="4" width="100%">
        <div ref={stageRef} className={styles.stage}>
          <div ref={trackRef} className={styles.track}>
            <div className={styles.board}>{lists}</div>
            <div className={styles.board}>
              <Flex gap="4" width="100%" align="start">
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
              </Flex>
            </div>
          </div>
        </div>
        <Box className={styles.actionRule}>
          <Box pt="4">
            <Flex direction="column" gap="3">
              {stage === 1 ? (
                <Tabs.Root value={action} onValueChange={(value) => setAction(value as NamecheapBulkHostActionEnum)}>
                  <Tabs.List>
                    <Tabs.Trigger value={NamecheapBulkHostActionEnum.UPDATE}>{t("bulk.actionUpdate")}</Tabs.Trigger>
                    <Tabs.Trigger value={NamecheapBulkHostActionEnum.ADD}>{t("bulk.actionAdd")}</Tabs.Trigger>
                    <Tabs.Trigger value={NamecheapBulkHostActionEnum.DELETE}>{t("bulk.actionDelete")}</Tabs.Trigger>
                  </Tabs.List>
                  <Box pt="3">
                    <Tabs.Content value={NamecheapBulkHostActionEnum.UPDATE}>
                      <Flex direction="column" gap="3">
                        <Text className={styles.hint}>{t("bulk.updateHint")}</Text>
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
                        <Text size="2" weight="bold">
                          {t("bulk.patch")}
                        </Text>
                        <Flex gap="3" wrap="wrap" width="100%">
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
                        </Flex>
                      </Flex>
                    </Tabs.Content>
                    <Tabs.Content value={NamecheapBulkHostActionEnum.ADD}>
                      <Flex direction="column" gap="3">
                        <Text className={styles.hint}>{t("bulk.addHint")}</Text>
                        {adds.map((row, index) => (
                          <Flex key={`add-${index}`} gap="3" wrap="wrap" width="100%" align="end">
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
                            <Button type="button" size="2" variant="outline" color="red" disabled={adds.length === 1} onClick={() => removeAdd(index)}>
                              {t("bulk.remove")}
                            </Button>
                          </Flex>
                        ))}
                        <Button type="button" size="1" variant="outline" onClick={appendAdd}>
                          {t("bulk.addRow")}
                        </Button>
                      </Flex>
                    </Tabs.Content>
                    <Tabs.Content value={NamecheapBulkHostActionEnum.DELETE}>
                      <Flex direction="column" gap="3">
                        <Text className={styles.hint}>{t("bulk.deleteHint")}</Text>
                        <Flex gap="3" wrap="wrap" width="100%">
                          <Field label={t("bulk.host")}>
                            <Input size="2" value={filterHost} placeholder={t("bulk.any")} onChange={(event) => setFilterHost(event.target.value)} />
                          </Field>
                          <Field label={t("bulk.type")}>
                            <Dropdown size="2" options={typeFilterOptions} value={filterType} onChange={setFilterType} />
                          </Field>
                        </Flex>
                      </Flex>
                    </Tabs.Content>
                  </Box>
                </Tabs.Root>
              ) : (
                <Text className={styles.hint}>{t("bulk.reviewHint", { count: affectedCount })}</Text>
              )}
              <Flex justify="end" gap="2">
                {stage === 2 ? (
                  <Button variant="outline" onClick={goBack} disabled={bulk.isPending}>
                    {t("bulk.cancel")}
                  </Button>
                ) : null}
                {stage === 1 ? (
                  <Button onClick={goReview} disabled={!canPreview}>
                    {preview.isPending ? t("loading") : t("bulk.confirm")}
                  </Button>
                ) : (
                  <Button onClick={submit} disabled={!canSubmit}>
                    {bulk.isPending ? t("loading") : t("bulk.submit")}
                  </Button>
                )}
              </Flex>
            </Flex>
          </Box>
        </Box>
      </Flex>
    </PageFrame>
  );
});

NamecheapDomainsBulkPage.displayName = "NamecheapDomainsBulkPage";

export default NamecheapDomainsBulkPage;
