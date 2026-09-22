import type { ReactNode } from "react";

import { DataProvider as NfxDataProvider } from "nfx-ui/providers";

import { EdgeRepositoriesContext, edgeRepositories } from "@/apis/repositories";

export function DataProvider({ children }: { children: ReactNode }) {
  return (
    <NfxDataProvider>
      <EdgeRepositoriesContext.Provider value={edgeRepositories}>{children}</EdgeRepositoriesContext.Provider>
    </NfxDataProvider>
  );
}
