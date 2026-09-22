import type { EdgeRepositories } from "./types";

import { createContext, useContext } from "react";

export const EdgeRepositoriesContext = createContext<EdgeRepositories | null>(null);

export function useEdgeRepositories(): EdgeRepositories {
  const ctx = useContext(EdgeRepositoriesContext);
  if (!ctx) throw new Error("useEdgeRepositories must be used inside product DataProvider");
  return ctx;
}

export function useTlsRepository() {
  return useEdgeRepositories().tls;
}

export function useFileRepository() {
  return useEdgeRepositories().file;
}

export function useAnalysisRepository() {
  return useEdgeRepositories().analysis;
}

export function useDnsRepository() {
  return useEdgeRepositories().dns;
}
