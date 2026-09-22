import { ArrowNarrowLeftIcon, RouterIcon } from "nfx-ui/icons";
import { memo, useMemo, useState } from "react";
import { Button, Box, Flex, Text, TextArea } from "@radix-ui/themes";
import { PageFrame } from "@/layouts";
import { DataTable, Dropdown, EmptyState, Input, PageHeader } from "@/components";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { getApiError } from "nfx-ui/utils";
import { NamecheapBulkHostActionEnum, NamecheapHostTypeEnum, NAMECHEAP_HOST_TYPE_VALUES } from "@/enums";
import TtlDropdown from "@/features/dns/TtlDropdown";
import { formatNamecheapTtl, NAMECHEAP_AUTOMATIC_TTL, namecheapTtlSelectValue } from "@/features/dns/ttl";
import { isNamecheapBulkPatchKeep, NAMECHEAP_BULK_PATCH_KEEP } from "@/features/dns/bulkFilter";
import { hostToFqdn, hostsToSans, uniqueFqdns } from "@/features/dns/hostFqdn";
import { buildCertAddPath } from "@/features/certificate/utils/buildCertAddPath";
import { routerEventEmitter } from "@/events/router";
import { ROUTES } from "@/navigations";
import { showConfirm, showError, showSuccess } from "@/stores/modal";
import { useAddNamecheapHost, useBulkNamecheapHosts, useDeleteNamecheapHost, useNamecheapDomain, useUpdateNamecheapHost } from "@/hooks/dns";
import type { NamecheapHost } from "@/types";

import styles from "./s.module.css";

type Draft = {
  name: string;
  type: string;
  address: string;
  ttl: string;
  mxPref: string;
};

const emptyDraft = (): Draft => ({ name: "@", type: NamecheapHostTypeEnum.A, address: "", ttl: NAMECHEAP_AUTOMATIC_TTL, mxPref: "10" });

const NamecheapDomainDetailPage = memo(() => {
  const { t } = useTranslation("dnsDomain");
  const { credentialId = "", domain: rawDomain = "" } = useParams();
  const domain = decodeURIComponent(rawDomain);
  const detailQuery = useNamecheapDomain(credentialId, domain);
  const addHost = useAddNamecheapHost();
  const updateHost = useUpdateNamecheapHost();
  const deleteHost = useDeleteNamecheapHost();
  const patchHosts = useBulkNamecheapHosts();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editing, setEditing] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(emptyDraft);
  const [picked, setPicked] = useState<string[]>([]);
  const [applyKey, setApplyKey] = useState<string | null>(null);
  const [editMinHeight, setEditMinHeight] = useState(0);
  const [patchAddress, setPatchAddress] = useState("");
  const [patchTtl, setPatchTtl] = useState(NAMECHEAP_BULK_PATCH_KEEP);
  const [patchMx, setPatchMx] = useState("");

  const info = detailQuery.data?.info;
  const hosts = detailQuery.data?.hosts?.hosts ?? [];
  const isOurDns = Boolean(detailQuery.data?.hosts?.isOurDns ?? info?.isOurDns);
  const hostKey = (host: NamecheapHost) => host.hostId || `${host.name}|${host.type}|${host.address}`;
  const typeOptions = NAMECHEAP_HOST_TYPE_VALUES.map((value) => ({ value, label: value }));
  const backPath = ROUTES.NAMECHEAP_DOMAINS.replace(":credentialId", credentialId);
  const pickedSet = useMemo(() => new Set(picked), [picked]);
  const selectedHosts = useMemo(() => hosts.filter((host) => pickedSet.has(hostKey(host))), [hosts, pickedSet]);
  const applyHost = selectedHosts.find((host) => hostKey(host) === applyKey) ?? selectedHosts[selectedHosts.length - 1];
  const applyCn = applyHost ? hostToFqdn(applyHost.name, domain) : "";
  const patchAddressValue = patchAddress.trim();
  const patchTtlValue = isNamecheapBulkPatchKeep(patchTtl) ? "" : patchTtl;
  const patchMxValue = patchMx.trim();
  const canPatch = selectedHosts.length > 0 && Boolean(patchAddressValue || patchTtlValue || patchMxValue) && !patchHosts.isPending;

  const goApply = () => {
    if (!applyCn) return;
    const sans = uniqueFqdns(selectedHosts.map((host) => hostToFqdn(host.name, domain))).filter((fqdn) => fqdn !== applyCn.toLowerCase());
    routerEventEmitter.navigate({ to: buildCertAddPath({ domain: applyCn, sans, credentialId }) });
  };

  const goApplyApex = () => {
    const source = selectedHosts.length ? selectedHosts : hosts;
    routerEventEmitter.navigate({ to: buildCertAddPath({ domain, sans: hostsToSans(source, domain), credentialId }) });
  };

  const togglePicked = (key: string) => {
    setPicked((current) => {
      if (current.includes(key)) {
        const next = current.filter((row) => row !== key);
        setApplyKey((anchor) => (anchor === key ? (next[next.length - 1] ?? null) : anchor));
        return next;
      }
      setApplyKey(key);
      return [...current, key];
    });
  };

  const applySelectedPatch = () => {
    showConfirm({
      title: t("confirmPatchTitle"),
      message: t("confirmPatchMessage", { count: selectedHosts.length }),
      confirmText: t("patchSelected"),
      cancelText: t("cancel"),
      onConfirm: () => {
        void patchHosts
          .mutateAsync({
            id: credentialId,
            request: {
              action: NamecheapBulkHostActionEnum.UPDATE,
              domains: [domain],
              filter: {
                ids: selectedHosts.map((host) => host.hostId).filter((id): id is string => Boolean(id)),
                keys: selectedHosts.map((host) => `${host.name}|${host.type}`),
              },
              patch: { address: patchAddressValue, ttl: patchTtlValue, mxPref: patchMxValue },
            },
          })
          .then((data) => {
            const failed = (data.items ?? []).filter((item) => item.status === "failed");
            if (failed.length) {
              showError(failed.map((item) => item.message || item.status).join("\n"));
              return;
            }
            showSuccess(t("patchOk", { count: data.items?.[0]?.changes?.length ?? selectedHosts.length }));
          });
      },
    });
  };

  const saveAdd = () => {
    void addHost
      .mutateAsync({
        id: credentialId,
        request: { domain, name: draft.name, type: draft.type, address: draft.address, ttl: draft.ttl, mxPref: draft.mxPref },
      })
      .then((result) => {
        if (result.success) setDraft(emptyDraft());
      });
  };

  const saveEdit = (host: NamecheapHost) => {
    void updateHost
      .mutateAsync({
        id: credentialId,
        request: {
          domain,
          hostId: host.hostId,
          name: editDraft.name,
          type: editDraft.type,
          address: editDraft.address,
          ttl: editDraft.ttl,
          mxPref: editDraft.mxPref,
        },
      })
      .then((result) => {
        if (result.success) {
          setEditing(null);
          setEditMinHeight(0);
        }
      });
  };

  const hostBody = (() => {
    if (detailQuery.isLoading) return <EmptyState icon={RouterIcon} title={t("loading")} />;
    if (detailQuery.isError) {
      return <EmptyState icon={RouterIcon} title={t("loadError")} description={getApiError(detailQuery.error)?.message} />;
    }
    if (!isOurDns) {
      return <EmptyState icon={RouterIcon} title={t("notOurDns")} description={t("notOurDnsHint")} />;
    }
    const canAdd = Boolean(draft.name.trim() && draft.address.trim()) && !addHost.isPending;
    const onAddKeyDown = (event: { key: string; preventDefault: () => void }) => {
      if (event.key === "Enter" && canAdd) {
        event.preventDefault();
        saveAdd();
      }
    };
    return (
      <Flex direction="column" gap="3" width="100%">
      <DataTable
        emptyIcon={RouterIcon}
        empty={t("empty")}
        rows={hosts}
        rowKey={hostKey}
        selected={(host) => pickedSet.has(hostKey(host))}
        onRowClick={(host) => {
          if (editing) return;
          togglePicked(hostKey(host));
        }}
        footer={[
          <Input key="name" size="1" value={draft.name} placeholder={t("host")} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} onKeyDown={onAddKeyDown} />,
          <Dropdown key="type" size="1" options={typeOptions} value={draft.type} onChange={(value) => setDraft((p) => ({ ...p, type: value }))} />,
          <Input key="address" size="1" value={draft.address} placeholder={t("address")} onChange={(e) => setDraft((p) => ({ ...p, address: e.target.value }))} onKeyDown={onAddKeyDown} />,
          <TtlDropdown key="ttl" size="1" value={draft.ttl} automaticLabel={t("ttlAutomatic")} onChange={(value) => setDraft((p) => ({ ...p, ttl: value }))} />,
          <Input key="mxPref" size="1" value={draft.mxPref} placeholder={t("mxPref")} onChange={(e) => setDraft((p) => ({ ...p, mxPref: e.target.value }))} onKeyDown={onAddKeyDown} />,
          <Button key="add" size="1" onClick={saveAdd} disabled={!canAdd} aria-label={t("add")}>
            +
          </Button>,
        ]}
        columns={[
          {
            key: "name",
            header: t("host"),
            render: (host) => (editing === hostKey(host) ? <Input size="1" value={editDraft.name} onChange={(e) => setEditDraft((p) => ({ ...p, name: e.target.value }))} /> : host.name),
          },
          {
            key: "type",
            header: t("type"),
            render: (host) =>
              editing === hostKey(host) ? (
                <Dropdown size="1" options={typeOptions} value={editDraft.type} onChange={(value) => setEditDraft((p) => ({ ...p, type: value }))} />
              ) : (
                host.type
              ),
          },
          {
            key: "address",
            header: t("address"),
            render: (host) =>
              editing === hostKey(host) ? (
                <TextArea
                  size="1"
                  variant="surface"
                  value={editDraft.address}
                  className={styles.addressField}
                  style={editMinHeight ? { minHeight: editMinHeight } : undefined}
                  onChange={(event) => setEditDraft((p) => ({ ...p, address: event.target.value }))}
                />
              ) : (
                host.address
              ),
          },
          {
            key: "ttl",
            header: t("ttl"),
            render: (host) =>
              editing === hostKey(host) ? (
                <TtlDropdown size="1" value={editDraft.ttl} automaticLabel={t("ttlAutomatic")} onChange={(value) => setEditDraft((p) => ({ ...p, ttl: value }))} />
              ) : (
                formatNamecheapTtl(host.ttl, t("ttlAutomatic"))
              ),
          },
          {
            key: "mxPref",
            header: t("mxPref"),
            render: (host) =>
              editing === hostKey(host) ? (
                <Input size="1" value={editDraft.mxPref} onChange={(e) => setEditDraft((p) => ({ ...p, mxPref: e.target.value }))} />
              ) : (
                host.mxPref || "—"
              ),
          },
          {
            key: "ops",
            header: "",
            render: (host) =>
              editing === hostKey(host) ? (
                <Flex gap="2" onClick={(event) => event.stopPropagation()}>
                  <Button size="1" onClick={() => saveEdit(host)} disabled={updateHost.isPending}>
                    {t("save")}
                  </Button>
                  <Button size="1" variant="outline" onClick={() => {
                    setEditing(null);
                    setEditMinHeight(0);
                  }}>
                    {t("cancel")}
                  </Button>
                </Flex>
              ) : (
                <Flex gap="2" onClick={(event) => event.stopPropagation()}>
                  <Button
                    size="1"
                    variant="outline"
                    onClick={(event) => {
                      const cell = event.currentTarget.closest("tr")?.querySelectorAll("td")[2];
                      setEditMinHeight(cell ? Math.ceil(cell.getBoundingClientRect().height) : 0);
                      setEditing(hostKey(host));
                      setEditDraft({
                        name: host.name,
                        type: host.type,
                        address: host.address,
                        ttl: namecheapTtlSelectValue(host.ttl),
                        mxPref: host.mxPref ?? "10",
                      });
                    }}
                  >
                    {t("edit")}
                  </Button>
                  <Button
                    size="1"
                    color="red"
                    variant="outline"
                    onClick={() =>
                      showConfirm({
                        title: t("confirmDeleteTitle"),
                        message: t("confirmDeleteMessage", { host: host.name, type: host.type }),
                        confirmText: t("remove"),
                        cancelText: t("cancel"),
                        onConfirm: () => {
                          void deleteHost.mutateAsync({
                            id: credentialId,
                            request: { domain, hostId: host.hostId, name: host.name, type: host.type },
                          });
                        },
                      })
                    }
                  >
                    {t("remove")}
                  </Button>
                </Flex>
              ),
          },
        ]}
      />
      <Flex direction="column" gap="3" width="100%">
        <Text className={styles.hint}>
          {selectedHosts.length ? t("patchHint", { count: selectedHosts.length }) : t("applyClickHint")}
        </Text>
        {selectedHosts.length ? (
          <Flex gap="3" wrap="wrap" width="100%" align="end">
            <Box className={styles.field}>
              <Flex direction="column" gap="1">
                <Text size="1">{t("address")}</Text>
                <Input size="2" value={patchAddress} placeholder={t("keep")} onChange={(event) => setPatchAddress(event.target.value)} />
              </Flex>
            </Box>
            <Box className={styles.field}>
              <Flex direction="column" gap="1">
                <Text size="1">{t("ttl")}</Text>
                <TtlDropdown
                  size="2"
                  value={patchTtl}
                  automaticLabel={t("ttlAutomatic")}
                  unsetValue={NAMECHEAP_BULK_PATCH_KEEP}
                  unsetLabel={t("keep")}
                  onChange={setPatchTtl}
                />
              </Flex>
            </Box>
            <Box className={styles.field}>
              <Flex direction="column" gap="1">
                <Text size="1">{t("mxPref")}</Text>
                <Input size="2" value={patchMx} placeholder={t("keep")} onChange={(event) => setPatchMx(event.target.value)} />
              </Flex>
            </Box>
            <Button type="button" onClick={applySelectedPatch} disabled={!canPatch}>
              {patchHosts.isPending ? t("loading") : t("patchSelected")}
            </Button>
          </Flex>
        ) : null}
        <Flex justify="end" gap="2" wrap="wrap">
          <Button disabled={!applyCn} onClick={goApply}>
            {applyCn ? t("applyHost", { host: applyCn }) : t("applyHost", { host: t("host") })}
          </Button>
          <Button onClick={goApplyApex}>{t("applyCert")}</Button>
        </Flex>
      </Flex>
      </Flex>
    );
  })();

  return (
    <PageFrame>
      <PageHeader
        icon={RouterIcon}
        index={t("index")}
        title={domain}
        description={t("subtitle")}
        actions={
          <Button variant="outline" onClick={() => routerEventEmitter.navigate({ to: backPath })}>
            <ArrowNarrowLeftIcon size={16} />
            {t("back")}
          </Button>
        }
      />
      <Flex direction="column" gap="4" width="100%">
        {info ? (
          <Text className={styles.hint}>
            {t("expires", { at: info.expires || "—" })} · {t("locked", { value: info.isLocked || info.status || "—" })} · {t("ourDns", { value: String(info.isOurDns) })}
          </Text>
        ) : null}
        {hostBody}
      </Flex>
    </PageFrame>
  );
});

NamecheapDomainDetailPage.displayName = "NamecheapDomainDetailPage";

export default NamecheapDomainDetailPage;
