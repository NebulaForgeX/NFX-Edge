import { PlusIcon } from "@radix-ui/react-icons";
import { ArrowNarrowLeftIcon, PenIcon, ShieldCheck, TrashIcon, TriangleAlertIcon, WorldIcon } from "nfx-ui/icons";
import { memo, useMemo, useState } from "react";
import { Badge, Button, Card, Code, DataList, Flex, Grid, Heading, IconButton, Text, TextArea, Tooltip } from "@radix-ui/themes";
import { PageFrame } from "@/layouts";
import { ActionBar, DataTable, Dropdown, EmptyState, Input, PageHeader, SideCard } from "@/components";
import FlagBadge from "@/features/dns/FlagBadge";
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
    if (detailQuery.isLoading) return <EmptyState icon={WorldIcon} title={t("loading")} />;
    if (detailQuery.isError) {
      return <EmptyState icon={TriangleAlertIcon} title={t("loadError")} description={getApiError(detailQuery.error)?.message} />;
    }
    if (!isOurDns) {
      return <EmptyState icon={TriangleAlertIcon} title={t("notOurDns")} description={t("notOurDnsHint")} />;
    }
    const canAdd = Boolean(draft.name.trim() && draft.address.trim()) && !addHost.isPending;
    const onAddKeyDown = (event: { key: string; preventDefault: () => void }) => {
      if (event.key === "Enter" && canAdd) {
        event.preventDefault();
        saveAdd();
      }
    };
    return (
      <Flex direction="column" gap="4" width="100%">
      <DataTable
        emptyIcon={WorldIcon}
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
          <Tooltip key="add" content={t("add")}>
            <IconButton size="1" onClick={saveAdd} disabled={!canAdd} loading={addHost.isPending} aria-label={t("add")}>
              <PlusIcon />
            </IconButton>
          </Tooltip>,
        ]}
        columns={[
          {
            key: "name",
            header: t("host"),
            render: (host) =>
              editing === hostKey(host) ? (
                <Input size="1" value={editDraft.name} onChange={(e) => setEditDraft((p) => ({ ...p, name: e.target.value }))} />
              ) : (
                <Text size="2" weight="medium">
                  {host.name}
                </Text>
              ),
          },
          {
            key: "type",
            header: t("type"),
            render: (host) =>
              editing === hostKey(host) ? (
                <Dropdown size="1" options={typeOptions} value={editDraft.type} onChange={(value) => setEditDraft((p) => ({ ...p, type: value }))} />
              ) : (
                <Badge variant="surface" radius="full" color="gray">
                  {host.type}
                </Badge>
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
                <Code variant="ghost" size="2" className={styles.address}>
                  {host.address}
                </Code>
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
                  <Button size="1" onClick={() => saveEdit(host)} loading={updateHost.isPending}>
                    {t("save")}
                  </Button>
                  <Button
                    size="1"
                    variant="outline"
                    color="gray"
                    onClick={() => {
                      setEditing(null);
                      setEditMinHeight(0);
                    }}
                  >
                    {t("cancel")}
                  </Button>
                </Flex>
              ) : (
                <Flex gap="1" justify="end" onClick={(event) => event.stopPropagation()}>
                  <Tooltip content={t("edit")}>
                    <IconButton
                      size="1"
                      variant="ghost"
                      color="gray"
                      aria-label={t("edit")}
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
                      <PenIcon size={14} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip content={t("remove")}>
                    <IconButton
                      size="1"
                      variant="ghost"
                      color="red"
                      aria-label={t("remove")}
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
                      <TrashIcon size={14} />
                    </IconButton>
                  </Tooltip>
                </Flex>
              ),
          },
        ]}
      />
      <Card size="3" variant="surface">
        <Flex direction="column" gap="4">
          <Flex align="center" justify="between" gap="3" wrap="wrap">
            <Flex direction="column" gap="1" minWidth="0">
              <Heading as="h3" size="3" weight="bold">
                {t("patchTitle")}
              </Heading>
              <Text size="2" color="gray">
                {selectedHosts.length ? t("patchHint", { count: selectedHosts.length }) : t("applyClickHint")}
              </Text>
            </Flex>
            {selectedHosts.length ? (
              <Badge size="2" variant="surface" radius="full">
                {selectedHosts.length}
              </Badge>
            ) : null}
          </Flex>
          {selectedHosts.length ? (
            <Grid columns={{ initial: "1", sm: "3", md: "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) auto" }} gap="3" align="end">
              <Input label={t("address")} size="2" value={patchAddress} placeholder={t("keep")} onChange={(event) => setPatchAddress(event.target.value)} />
              <Flex direction="column" gap="1">
                <Text size="1" weight="medium" color="gray">
                  {t("ttl")}
                </Text>
                <TtlDropdown
                  size="2"
                  value={patchTtl}
                  automaticLabel={t("ttlAutomatic")}
                  unsetValue={NAMECHEAP_BULK_PATCH_KEEP}
                  unsetLabel={t("keep")}
                  onChange={setPatchTtl}
                />
              </Flex>
              <Input label={t("mxPref")} size="2" value={patchMx} placeholder={t("keep")} onChange={(event) => setPatchMx(event.target.value)} />
              <Button type="button" onClick={applySelectedPatch} disabled={!canPatch} loading={patchHosts.isPending}>
                {t("patchSelected")}
              </Button>
            </Grid>
          ) : null}
          <Flex justify="end" gap="2" wrap="wrap">
            <Button variant="outline" color="gray" disabled={!applyCn} onClick={goApply}>
              <ShieldCheck size={16} />
              {applyCn ? t("applyHost", { host: applyCn }) : t("applyHost", { host: t("host") })}
            </Button>
          </Flex>
        </Flex>
      </Card>
      </Flex>
    );
  })();

  return (
    <PageFrame>
      <PageHeader
        icon={WorldIcon}
        index={t("index")}
        title={domain}
        description={t("subtitle")}
        actions={
          <Button onClick={goApplyApex}>
            <ShieldCheck size={16} />
            {t("applyCert")}
          </Button>
        }
      />
      <ActionBar
        status={
          <Badge size="2" variant="surface" radius="full">
            {t("records")} · {hosts.length}
          </Badge>
        }
      >
        <Button variant="outline" color="gray" onClick={() => routerEventEmitter.navigate({ to: backPath })}>
          <ArrowNarrowLeftIcon size={16} />
          {t("back")}
        </Button>
      </ActionBar>
      <Grid columns={{ initial: "1", xl: "minmax(0, 1fr) 18rem" }} gap="5" align="start">
        <Flex direction="column" gap="4" width="100%" minWidth="0">
          {hostBody}
        </Flex>
        <SideCard icon={WorldIcon} title={t("profile")} caption={domain}>
          <DataList.Root orientation="vertical" size="2">
            <DataList.Item>
              <DataList.Label>{t("records")}</DataList.Label>
              <DataList.Value>
                <Text size="5" weight="bold" className={styles.count}>
                  {hosts.length}
                </Text>
              </DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label>{t("expires")}</DataList.Label>
              <DataList.Value>
                <Code variant="ghost">{info?.expires || "—"}</Code>
              </DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label>{t("locked")}</DataList.Label>
              <DataList.Value>
                <FlagBadge value={info?.isLocked} yes={t("yes")} no={t("no")} onColor="amber" />
              </DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label>{t("ourDns")}</DataList.Label>
              <DataList.Value>
                <FlagBadge value={info ? String(info.isOurDns) : undefined} yes={t("yes")} no={t("no")} />
              </DataList.Value>
            </DataList.Item>
          </DataList.Root>
        </SideCard>
      </Grid>
    </PageFrame>
  );
});

NamecheapDomainDetailPage.displayName = "NamecheapDomainDetailPage";

export default NamecheapDomainDetailPage;
