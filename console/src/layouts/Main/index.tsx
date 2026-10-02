import type { CSSProperties } from "react";

import { Box, Section } from "@radix-ui/themes";
import { useLayoutStore } from "nfx-ui/stores";
import { Outlet } from "react-router";

import Asider from "@/layouts/Asider";
import Header from "@/layouts/Header";

import styles from "./s.module.css";

function Main() {
  const headerHeight = useLayoutStore((state) => state.headerHeight);

  return (
    <Box position="relative" minHeight="100%" width="100%">
      <Header />
      <Asider />
      <Section
        size="1"
        className={styles.page}
        style={{ paddingTop: headerHeight, paddingBottom: 0, "--app-header-height": `${headerHeight}px` } as CSSProperties}
      >
        <main>
          <Outlet />
        </main>
      </Section>
    </Box>
  );
}

export default Main;
