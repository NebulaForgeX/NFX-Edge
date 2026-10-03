import type { ReactNode } from "react";
import type { MenuItemProps, SubMenuProps } from "react-pro-sidebar";

import { createContext, isValidElement, useContext, useEffect, useRef, useState } from "react";
import { Box, IconButton, Popover, Section, Tooltip } from "@radix-ui/themes";
import { motion } from "motion/react";
import { Menu, MenuItem as ProMenuItem, SubMenu as ProSubMenu } from "react-pro-sidebar";

import styles from "./s.module.css";

const CollapsedContext = createContext(false);
const NestedContext = createContext(false);

export function SidebarMenuState({ collapsed, children }: { collapsed: boolean; children: ReactNode }) {
  return <CollapsedContext.Provider value={collapsed}>{children}</CollapsedContext.Provider>;
}

function labelText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(labelText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return labelText(node.props.children);
  return "";
}

function MenuDot() {
  return <Box className={styles.menuDot} />;
}

function ActivePill() {
  return <motion.span layoutId="sidebar-active-pill" className={styles.activePill} transition={{ type: "spring", stiffness: 520, damping: 42 }} aria-hidden />;
}

export function MenuItem(props: MenuItemProps) {
  const collapsed = useContext(CollapsedContext);
  const nested = useContext(NestedContext);
  const label = labelText(props.children);
  const hasUnread = nested && isValidElement<{ showDot?: boolean }>(props.icon) && props.icon.props.showDot;
  const inFlyout = collapsed && nested;
  const pill = props.active && !inFlyout ? <ActivePill /> : null;
  const item = (
    <ProMenuItem
      {...props}
      icon={
        nested ? (
          props.icon
        ) : (
          <>
            {pill}
            {props.icon}
          </>
        )
      }
      suffix={props.suffix ?? (hasUnread ? <MenuDot /> : undefined)}
      aria-label={props["aria-label"] ?? label}
      aria-current={props.active ? "page" : undefined}
    >
      {nested ? pill : null}
      {props.children}
    </ProMenuItem>
  );
  return collapsed && !nested ? (
    <Tooltip content={label} side="right" sideOffset={14} delayDuration={150}>
      {item}
    </Tooltip>
  ) : (
    item
  );
}

function CollapsedSubMenu({ children, label, icon, active }: SubMenuProps) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pointerOpened = useRef(false);
  const content = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const cancelClose = () => clearTimeout(closeTimer.current);
  const scheduleClose = () => {
    if (!pointerOpened.current) return;
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  };
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  const state = active ? "current" : open ? "active" : "idle";
  return (
    <li className="ps-menuitem-root">
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger>
          <IconButton
            ref={trigger}
            type="button"
            variant="ghost"
            my="1"
            mx="auto"
            className={styles.triggerHit}
            data-state={state}
            aria-label={labelText(label)}
            aria-expanded={open}
            onPointerEnter={() => {
              cancelClose();
              pointerOpened.current = true;
              setOpen(true);
            }}
            onPointerLeave={scheduleClose}
            onClick={(event) => {
              // Hover may already have opened the panel. A click should keep it open.
              event.preventDefault();
              cancelClose();
              pointerOpened.current = false;
              setOpen(true);
              content.current?.querySelector<HTMLAnchorElement>("a[href]")?.focus();
            }}
          >
            {icon}
          </IconButton>
        </Popover.Trigger>
        <Popover.Content
          ref={content}
          side="right"
          align="start"
          sideOffset={12}
          collisionPadding={12}
          className={styles.flyoutReset}
          aria-label={labelText(label)}
          onPointerEnter={cancelClose}
          onPointerLeave={scheduleClose}
          onOpenAutoFocus={(event) => {
            if (pointerOpened.current) event.preventDefault();
          }}
          onCloseAutoFocus={(event) => {
            if (pointerOpened.current) event.preventDefault();
          }}
        >
          <Box className={styles.flyout}>
            <Section size="1" py="1">
              <NestedContext.Provider value={true}>
                <Menu
                  onClick={(event) => {
                    if ((event.target as HTMLElement).closest("a[href]")) setOpen(false);
                  }}
                >
                  {children}
                </Menu>
              </NestedContext.Provider>
            </Section>
          </Box>
        </Popover.Content>
      </Popover.Root>
    </li>
  );
}

export function SubMenu({ children, ...props }: SubMenuProps) {
  const collapsed = useContext(CollapsedContext);
  if (collapsed) return <CollapsedSubMenu {...props}>{children}</CollapsedSubMenu>;
  return (
    <ProSubMenu {...props} aria-label={labelText(props.label)} aria-expanded={props.open}>
      <NestedContext.Provider value={true}>{children}</NestedContext.Provider>
    </ProSubMenu>
  );
}
