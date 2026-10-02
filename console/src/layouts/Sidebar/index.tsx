import type { ReactNode } from "react";

import { useEffect, useRef, useState } from "react";
import { Avatar, Box, Button, Container, Flex, IconButton, Section, Text } from "@radix-ui/themes";
import { AnimatedIcon, type AnimatedIconComponent, ArrowNarrowLeftIcon, ArrowNarrowUpIcon, DownChevron, FileDescriptionIcon, GearIcon, LayersIcon, LayoutDashboardIcon, LogoutIcon, MagnifierIcon, PassportIcon, PenIcon, RightChevron, RouterIcon, ShieldCheck, StackIcon, UnorderedListIcon, UserIcon } from "nfx-ui/icons";
import { ProfileKindEnum } from "nfx-ui/enums";
import { useCurrentProfile } from "nfx-ui/hooks";
import { useTranslation } from "react-i18next";
import { Menu, Sidebar as ProSidebar } from "react-pro-sidebar";
import { Link, Outlet, useLocation } from "react-router";

import { useNamecheapCredentials } from "@/hooks/dns";
import { ROUTES } from "@/navigations";
import { buildImageUrl, logoutSession, resolveAccountDisplayName, safeNullable } from "@/utils";

import { MenuItem, SidebarMenuState, SubMenu } from "./Menu";
import styles from "./s.module.css";

const SIDEBAR_WIDTH = "234px";
const SIDEBAR_COLLAPSED_WIDTH = "84px";

function MenuLabel({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return (
    <Text as="span" size="2" weight={active ? "bold" : "medium"}>
      {children}
    </Text>
  );
}

function SectionTitle({ label, icon, collapsed }: { label: string; icon: AnimatedIconComponent; collapsed: boolean }) {
  return (
    <Section size="1" mt="4" pt="5" pb="0" className={styles.sectionRule}>
      <Flex align="center" justify={collapsed ? "center" : "between"} gap="2">
        <Text as="span" size="2" weight="bold" className={styles.sectionLabel} data-collapsed={collapsed ? "true" : "false"}>
          {label}
        </Text>
        <AnimatedIcon icon={icon} size={16} className={styles.sectionTitleIcon} />
      </Flex>
    </Section>
  );
}

interface SectionProps {
  collapsed: boolean;
  broken: boolean;
  onMobileClose: () => void;
}

function OverviewSection({ collapsed, broken, onMobileClose }: SectionProps) {
  const { t } = useTranslation("language");
  const location = useLocation();
  const active = location.pathname === ROUTES.USER_OVERVIEW || location.pathname.startsWith(`${ROUTES.USER_OVERVIEW}/`);

  return (
    <Menu renderExpandIcon={({ open }) => <AnimatedIcon icon={open ? ArrowNarrowUpIcon : DownChevron} size={14} />} closeOnClick>
      <MenuItem component={<Link to={ROUTES.USER_OVERVIEW} />} icon={<AnimatedIcon icon={LayoutDashboardIcon} size={18} />} active={active} onClick={() => broken && onMobileClose()}>
        <MenuLabel active={active}>{t("sidebar.overview")}</MenuLabel>
      </MenuItem>
    </Menu>
  );
}

function namecheapCredentialIdFromPath(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "namecheap") return "";
  const id = parts[1] ?? "";
  if (!id || id === "new" || id === "overview") return "";
  return id;
}

function MainMenuSection({ collapsed, broken, onMobileClose }: SectionProps) {
  const { t } = useTranslation("language");
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(() => location.pathname.startsWith(ROUTES.PROFILE));
  const [certsOpen, setCertsOpen] = useState(() => location.pathname === ROUTES.CERTS || location.pathname.startsWith(`${ROUTES.CERTS}/`));
  const [namecheapOpen, setNamecheapOpen] = useState(() => location.pathname.startsWith(ROUTES.NAMECHEAP));
  const credentialsQuery = useNamecheapCredentials();
  const pathCredentialId = namecheapCredentialIdFromPath(location.pathname);
  const credentials = credentialsQuery.data?.items ?? [];
  const credentialId = pathCredentialId || credentials[0]?.id || "";
  const namecheapFallback = credentialsQuery.isSuccess && credentials.length === 0 ? ROUTES.NAMECHEAP_NEW : ROUTES.NAMECHEAP_OVERVIEW;

  const isActive = (to: string) => location.pathname === to || location.pathname.startsWith(`${to}/`);
  const isCertAddActive = location.pathname === ROUTES.CERT_ADD;
  const isCertListActive = location.pathname === ROUTES.CERTS_OVERVIEW || (location.pathname.startsWith(`${ROUTES.CERTS}/`) && !isCertAddActive);

  const profileSubItems = [
    {
      key: "profileOverview",
      to: ROUTES.USER_PROFILE_OVERVIEW,
      icon: <AnimatedIcon icon={UserIcon} size={16} />,
      label: t("sidebar.profileOverview"),
    },
    {
      key: "profileEdit",
      to: ROUTES.USER_PROFILE_EDIT,
      icon: <AnimatedIcon icon={PenIcon} size={16} />,
      label: t("sidebar.profileEdit"),
    },
    {
      key: "profileIdentities",
      to: ROUTES.USER_PROFILE_IDENTITIES,
      icon: <AnimatedIcon icon={PassportIcon} size={16} />,
      label: t("sidebar.profileIdentities"),
    },
  ];

  const accountPath = credentialId ? ROUTES.NAMECHEAP_DETAIL.replace(":credentialId", credentialId) : "";
  const accountEditPath = credentialId ? ROUTES.NAMECHEAP_EDIT.replace(":credentialId", credentialId) : "";
  const domainsPath = credentialId ? ROUTES.NAMECHEAP_DOMAINS.replace(":credentialId", credentialId) : namecheapFallback;
  const domainsBulkPath = credentialId ? ROUTES.NAMECHEAP_DOMAINS_BULK.replace(":credentialId", credentialId) : namecheapFallback;
  const sslPath = credentialId ? ROUTES.NAMECHEAP_SSL.replace(":credentialId", credentialId) : namecheapFallback;
  const isBulkActive = Boolean(pathCredentialId) && (location.pathname === domainsBulkPath || location.pathname.startsWith(`${domainsBulkPath}/`));
  const isDomainsActive = Boolean(pathCredentialId) && !isBulkActive && (location.pathname === domainsPath || location.pathname.startsWith(`${domainsPath}/`));
  const isSslActive = Boolean(pathCredentialId) && (location.pathname === sslPath || location.pathname.startsWith(`${sslPath}/`));
  const isNamecheapListActive =
    location.pathname === ROUTES.NAMECHEAP_OVERVIEW ||
    location.pathname === ROUTES.NAMECHEAP_NEW ||
    location.pathname === accountPath ||
    location.pathname === accountEditPath;

  const namecheapSubItems = [
    {
      key: "namecheapAccounts",
      to: ROUTES.NAMECHEAP_OVERVIEW,
      icon: <AnimatedIcon icon={PassportIcon} size={16} />,
      label: t("sidebar.namecheapAccounts"),
      active: isNamecheapListActive,
    },
    {
      key: "namecheapDomains",
      to: domainsPath,
      icon: <AnimatedIcon icon={UnorderedListIcon} size={16} />,
      label: t("sidebar.namecheapDomains"),
      active: isDomainsActive,
    },
    {
      key: "namecheapBulk",
      to: domainsBulkPath,
      icon: <AnimatedIcon icon={StackIcon} size={16} />,
      label: t("sidebar.namecheapBulk"),
      active: isBulkActive,
    },
    {
      key: "namecheapSsl",
      to: sslPath,
      icon: <AnimatedIcon icon={FileDescriptionIcon} size={16} />,
      label: t("sidebar.namecheapSsl"),
      active: isSslActive,
    },
  ];

  const isProfileChildActive = profileSubItems.some((item) => isActive(item.to));
  const isCertChildActive = isCertListActive || isCertAddActive;
  const isNamecheapChildActive = location.pathname.startsWith(ROUTES.NAMECHEAP);

  return (
    <Menu renderExpandIcon={({ open }) => <AnimatedIcon icon={open ? ArrowNarrowUpIcon : DownChevron} size={14} />} closeOnClick>
      <SectionTitle label={t("sidebar.mainMenu")} icon={LayersIcon} collapsed={collapsed} />
      <SubMenu label={t("sidebar.profile")} icon={<AnimatedIcon icon={UserIcon} size={18} />} open={profileOpen} onOpenChange={setProfileOpen} active={isProfileChildActive}>
        {profileSubItems.map((item) => (
          <MenuItem key={item.key} component={<Link to={item.to} />} icon={item.icon} active={isActive(item.to)} onClick={() => broken && onMobileClose()}>
            <MenuLabel active={isActive(item.to)}>{item.label}</MenuLabel>
          </MenuItem>
        ))}
      </SubMenu>
      <SubMenu label={t("sidebar.certs")} icon={<AnimatedIcon icon={ShieldCheck} size={18} />} open={certsOpen} onOpenChange={setCertsOpen} active={isCertChildActive}>
        <MenuItem component={<Link to={ROUTES.CERTS_OVERVIEW} />} icon={<AnimatedIcon icon={UnorderedListIcon} size={16} />} active={isCertListActive} onClick={() => broken && onMobileClose()}>
          <MenuLabel active={isCertListActive}>{t("sidebar.certList")}</MenuLabel>
        </MenuItem>
        <MenuItem component={<Link to={ROUTES.CERT_ADD} />} icon={<AnimatedIcon icon={FileDescriptionIcon} size={16} />} active={isCertAddActive} onClick={() => broken && onMobileClose()}>
          <MenuLabel active={isCertAddActive}>{t("sidebar.addCert")}</MenuLabel>
        </MenuItem>
      </SubMenu>
      <MenuItem component={<Link to={ROUTES.ANALYSIS_TLS} />} icon={<AnimatedIcon icon={MagnifierIcon} size={18} />} active={isActive(ROUTES.ANALYSIS_TLS)} onClick={() => broken && onMobileClose()}>
        <MenuLabel active={isActive(ROUTES.ANALYSIS_TLS)}>{t("sidebar.analyzeTLS")}</MenuLabel>
      </MenuItem>
      <MenuItem component={<Link to={ROUTES.FILE_FOLDER} />} icon={<AnimatedIcon icon={StackIcon} size={18} />} active={isActive(ROUTES.FILE_FOLDER)} onClick={() => broken && onMobileClose()}>
        <MenuLabel active={isActive(ROUTES.FILE_FOLDER)}>{t("sidebar.fileFolder")}</MenuLabel>
      </MenuItem>
      <SubMenu label={t("sidebar.namecheap")} icon={<AnimatedIcon icon={RouterIcon} size={18} />} open={namecheapOpen} onOpenChange={setNamecheapOpen} active={isNamecheapChildActive}>
        {namecheapSubItems.map((item) => (
          <MenuItem key={item.key} component={<Link to={item.to} />} icon={item.icon} active={item.active} onClick={() => broken && onMobileClose()}>
            <MenuLabel active={item.active}>{item.label}</MenuLabel>
          </MenuItem>
        ))}
      </SubMenu>
    </Menu>
  );
}

function SettingsSection({ collapsed, broken, onMobileClose }: SectionProps) {
  const { t } = useTranslation("language");
  const location = useLocation();
  const isActive = (to: string) => location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <Menu renderExpandIcon={({ open }) => <AnimatedIcon icon={open ? ArrowNarrowUpIcon : DownChevron} size={14} />} closeOnClick>
      <SectionTitle label={t("sidebar.settings")} icon={GearIcon} collapsed={collapsed} />
      <MenuItem
        component={<Link to={ROUTES.USER_SETTINGS} />}
        icon={<AnimatedIcon icon={GearIcon} size={18} />}
        active={isActive(ROUTES.USER_SETTINGS)}
        onClick={() => broken && onMobileClose()}
      >
        <MenuLabel active={isActive(ROUTES.USER_SETTINGS)}>{t("sidebar.settingsItem")}</MenuLabel>
      </MenuItem>
    </Menu>
  );
}

function Sidebar() {
  const { t } = useTranslation("language");
  const [desktopCollapsed, setCollapsed] = useState(false);
  const [toggled, setToggled] = useState(false);
  const [broken, setBroken] = useState(false);
  const collapsed = !broken && desktopCollapsed;
  const drawerRef = useRef<HTMLHtmlElement>(null);
  useEffect(() => {
    if (!broken || !toggled) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () =>
      Array.from(drawerRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], [tabindex='0']") ?? []).filter(
        (node) => node.getClientRects().length && getComputedStyle(node).visibility !== "hidden",
      );
    focusable()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.key === "Escape") {
        event.preventDefault();
        setToggled(false);
      }
      if (event.key !== "Tab") return;
      const nodes = focusable();
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [broken, toggled]);

  const { kind, data, profile } = useCurrentProfile();

  const accountId = safeNullable(data?.account.id);
  const displayName = resolveAccountDisplayName(profile?.displayName, accountId);
  const avatarImageId = safeNullable(profile?.avatars?.[0]?.imageId);

  const closeMobile = () => broken && setToggled(false);

  const handleLogout = () => {
    void logoutSession();
  };

  return (
    <Flex className={styles.shell} minHeight="100dvh" width="100%">
      <SidebarMenuState collapsed={collapsed}>
        <Box className={styles.proSidebar}>
          <ProSidebar
            ref={drawerRef}
            inert={broken && !toggled ? true : undefined}
            aria-hidden={broken && !toggled ? true : undefined}
            collapsed={collapsed}
            toggled={toggled}
            onBackdropClick={() => setToggled(false)}
            onBreakPoint={setBroken}
            breakPoint="md"
            width={SIDEBAR_WIDTH}
            collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
          >
            <Flex direction="column" className={styles.sidebar} height="100%" minHeight="0">
              <Box >
                <Container size="4" width="100%" maxWidth="100%" px="5" >
                  <Box position="relative">
                    <Section size="1" pt="21px" pb="22px" className={styles.headerRule}>
                      <Button type="button" variant="ghost" className={styles.accountCard} aria-label={displayName}>
                        <Flex align="center" width="100%" gap="3">
                          <Box >
                            <Avatar
                              size="3"
                              src={avatarImageId ? buildImageUrl(avatarImageId) : undefined}
                              fallback={<UserIcon size={20} />}
                              alt=""
                              aria-hidden="true"
                            />
                          </Box>
                          {!collapsed && (
                            <Flex direction="column" flexGrow="1" minWidth="0" gap="1">
                              <span className={styles.accountRole}>{t(kind === ProfileKindEnum.AUTHORITY ? "sidebar.profileAuthority" : "sidebar.profileCommunity")}</span>
                              <span className={styles.accountName}>{displayName}</span>
                            </Flex>
                          )}
                        </Flex>
                      </Button>
                    </Section>
                    <IconButton
                      variant="outline"
                      size="1"
                      className={styles.toggle}
                      aria-label={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
                      aria-expanded={!collapsed}
                      onClick={() => (broken ? setToggled(false) : setCollapsed((value) => !value))}
                    >
                      <AnimatedIcon icon={collapsed ? RightChevron : ArrowNarrowLeftIcon} size={14} />
                    </IconButton>
                  </Box>
                </Container>
              </Box>

              <Box minHeight="0" className={styles.menuArea} data-collapsed={collapsed ? "true" : "false"} >
                <Section size="1" py="2">
                  <Container size="4" width="100%" maxWidth="100%" px="5" >
                    <OverviewSection collapsed={collapsed} broken={broken} onMobileClose={closeMobile} />
                    <MainMenuSection collapsed={collapsed} broken={broken} onMobileClose={closeMobile} />
                    <SettingsSection collapsed={collapsed} broken={broken} onMobileClose={closeMobile} />
                  </Container>
                </Section>
              </Box>

              <Section size="1" pt="3" pb="5" className={styles.footer} data-collapsed={collapsed ? "true" : "false"} >
                <Container size="4" width="100%" maxWidth="100%" px="5" >
                  <Button
                    variant="ghost"
                    className={styles.logout}
                    data-collapsed={collapsed ? "true" : "false"}
                    onClick={handleLogout}
                    aria-label={t("sidebar.logout")}
                    title={collapsed ? t("sidebar.logout") : undefined}
                  >
                    <Flex align="center" justify={collapsed ? "center" : "start"} gap="3" width="100%">
                      <AnimatedIcon icon={LogoutIcon} size={18} />
                      {!collapsed && t("sidebar.logout")}
                    </Flex>
                  </Button>
                </Container>
              </Section>
            </Flex>
          </ProSidebar>
        </Box>
      </SidebarMenuState>

      <Flex className={styles.content} direction="column" flexGrow="1" minWidth="0" minHeight="0" height="100%" position="relative" inert={broken && toggled ? true : undefined}>
        {broken ? (
          <IconButton variant="surface" color="gray" size="3" className={styles.mobileToggle} onClick={() => setToggled(true)} aria-label={t("sidebar.openMenu")}>
            <AnimatedIcon icon={UnorderedListIcon} size={18} />
          </IconButton>
        ) : null}
        <Box minWidth="0" minHeight="0" position="relative" width="100%" height="100%" >
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}

export default Sidebar;
