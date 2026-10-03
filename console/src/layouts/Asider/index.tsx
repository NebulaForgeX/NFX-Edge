import { AnimatedIcon, HomeIcon, LogoutIcon, RightChevron, UserIcon } from "nfx-ui/icons";

import { useEffect, useRef, useState } from "react";
import { Avatar, Box, Button, Container, Flex, IconButton, Section, Text } from "@radix-ui/themes";
import { APP_NAME } from "nfx-ui/config";
import { useCurrentProfile } from "nfx-ui/hooks";
import { closeAsider, useAuthStore, useLayoutStore } from "nfx-ui/stores";
import { useTranslation } from "react-i18next";

import { Logo, PreferencesPopover } from "@/components";
import { routerEventEmitter } from "@/events/router";
import { ROUTES } from "@/navigations";
import { buildImageUrl, logoutSession, resolveAccountDisplayName, resolveAccountInitial, safeNullable } from "@/utils";

import styles from "./s.module.css";

const MOBILE_MENU_BUTTON_ID = "header-mobile-menu-button";

function Asider() {
  const { t } = useTranslation("language");
  const isAuthValid = useAuthStore((state) => state.isAuthValid);
  const isAsiderOpen = useLayoutStore((state) => state.isAsiderOpen);
  const sidebarRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia("(min-width: 981px)").matches);
  const { data: accountInfo, profile } = useCurrentProfile();

  const accountId = safeNullable(accountInfo?.account.id);
  const displayName = resolveAccountDisplayName(profile?.displayName, accountId);
  const initial = resolveAccountInitial(profile?.displayName, accountId);
  const avatarImageId = safeNullable(profile?.avatars?.[0]?.imageId);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 981px)");
    const sync = () => {
      setIsDesktop(mediaQuery.matches);
      if (mediaQuery.matches) closeAsider();
    };
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, [closeAsider]);

  useEffect(() => {
    if (!isAsiderOpen) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAsider();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeAsider, isAsiderOpen]);

  useEffect(() => {
    if (isAsiderOpen) {
      window.requestAnimationFrame(() => closeButtonRef.current?.focus());
      return;
    }

    const active = document.activeElement;
    if (active instanceof HTMLElement && sidebarRef.current?.contains(active)) {
      document.getElementById(MOBILE_MENU_BUTTON_ID)?.focus();
    }
  }, [isAsiderOpen]);

  const navigateFromMenu = (to: string) => {
    closeAsider();
    routerEventEmitter.navigate({ to });
  };

  const open = isAsiderOpen ? "true" : "false";

  if (isDesktop) return null;

  return (
    <>
      <Box>
        <Box
          className={styles.overlay}
          data-open={open}
          onClick={closeAsider}
          role="presentation"
          aria-hidden={!isAsiderOpen}
        />
      </Box>

      <Box inert={!isAsiderOpen ? true : undefined}>
        <Box asChild className={styles.sidebar} data-open={open} height="100%">
          <aside
            id="mobile-asider"
            ref={sidebarRef}
            role="dialog"
            aria-modal={isAsiderOpen}
            aria-label={t("header.openMenu")}
            aria-hidden={!isAsiderOpen}
          >
            <Container size="4" width="100%" maxWidth="100%" height="100%" px="5">
              <Section size="1" height="100%" py="5">
                <Flex direction="column" gap="6" height="100%">
                  <Section size="1" pt="0" pb="5" position="relative" className={styles.headerBand}>
                    <Flex align="center" justify="between" gap="3">
                      {isAuthValid ? (
                        <Flex align="center" gap="3" width="100%">
                          <Avatar size="3" radius="full" src={avatarImageId ? buildImageUrl(avatarImageId) : undefined} fallback={initial} aria-hidden />
                          <Flex direction="column" gap="1" minWidth="0">
                            <Text as="p" size="2" weight="bold" truncate>
                              {displayName}
                            </Text>
                            <Text as="p" size="1" color="gray" weight="medium" truncate>
                              {accountId ?? t("header.accountFallback")}
                            </Text>
                          </Flex>
                        </Flex>
                      ) : (
                        <Logo title={APP_NAME} subtitle="Live local map" />
                      )}
                      <IconButton ref={closeButtonRef} variant="outline" size="2" aria-label={t("header.closeMenu")} onClick={closeAsider}>
                        <AnimatedIcon icon={RightChevron} size={14} />
                      </IconButton>
                    </Flex>
                  </Section>

                  <Section size="1" pb="5" pt="0" className={styles.navHairline}>
                    <Box className={styles.navScroll}>
                      <Flex asChild direction="column" gap="3">
                        <nav>
                          <Button type="button" variant="ghost" color="gray" size="3" className={styles.navLink} onClick={() => navigateFromMenu(ROUTES.HOME)}>
                            <AnimatedIcon icon={HomeIcon} size={18} aria-hidden="true" />
                            <Text as="span" size="2">
                              {t("header.home")}
                            </Text>
                          </Button>
                        </nav>
                      </Flex>
                    </Box>
                  </Section>

                  <Section size="1" pt="0" pb="0" mt="auto">
                    <Flex direction="column" gap="3">
                      {isAuthValid ? (
                        <>
                          <Button
                            className={styles.wideButton}
                            variant="outline"
                            size="2"
                            onClick={() => {
                              closeAsider();
                              routerEventEmitter.navigate({ to: ROUTES.PROFILE });
                            }}
                          >
                            <AnimatedIcon icon={UserIcon} size={18} aria-hidden="true" />
                            {t("header.profile")}
                          </Button>
                          <Button
                            className={styles.wideButton}
                            color="red"
                            variant="outline"
                            size="2"
                            onClick={() => {
                              closeAsider();
                              void logoutSession().then(() => routerEventEmitter.navigate({ to: ROUTES.LOGIN }));
                            }}
                          >
                            <AnimatedIcon icon={LogoutIcon} size={18} aria-hidden="true" />
                            {t("header.logout")}
                          </Button>
                        </>
                      ) : (
                        <>
                          <PreferencesPopover triggerVariant="outline" />

                          <Button
                            className={styles.wideButton}
                            variant="outline"
                            size="2"
                            onClick={() => {
                              closeAsider();
                              routerEventEmitter.navigate({ to: ROUTES.LOGIN });
                            }}
                          >
                            {t("header.login")}
                          </Button>
                          <Button
                            className={styles.wideButton}
                            variant="solid"
                            size="2"
                            onClick={() => {
                              closeAsider();
                              routerEventEmitter.navigate({ to: ROUTES.SIGNUP });
                            }}
                          >
                            {t("header.signup")}
                          </Button>
                        </>
                      )}
                    </Flex>
                  </Section>
                </Flex>
              </Section>
            </Container>
          </aside>
        </Box>
      </Box>
    </>
  );
}

export default Asider;
