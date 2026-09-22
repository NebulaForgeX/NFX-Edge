import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

import {
  loadNfxConsoleEnv,
  nfxKillListenPortPlugin,
  nfxUiAtAliasPlugin,
  nfxUiDedupe,
  nfxUiOptimizeDepsExclude,
  nfxUiViteAliases,
  nfxViteDefine,
  nfxConsoleBase,
  nfxViteDevServer,
  resolveNfxUiRoot,
} from "./vite.nfx-ui.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname);
const nfxUiRoot = resolveNfxUiRoot(root);

export default defineConfig(({ mode, command }) => {
  const env = loadNfxConsoleEnv(root, mode);
  const port = Number(env.VITE_PORT) || 5175;
  const apiUrl = (env.VITE_API_URL || "").replace(/\/$/, "");
  const identityUrl = (env.VITE_IDENTITY_API_URL || "").replace(/\/$/, "");
  const apiIsPath = apiUrl.startsWith("/");
  const identityIsPath = identityUrl.startsWith("/");
  const edgeOrigin = (env.VITE_DEV_API_PROXY_TARGET || "http://192.168.1.64").replace(/\/$/, "");

  return {
    root,
    base: nfxConsoleBase(env),
    define: nfxViteDefine(env),
    plugins: [
      nfxKillListenPortPlugin(port),
      nfxUiAtAliasPlugin(root, nfxUiRoot),
      react(),
      ...(process.env.DOCKER_BUILD === "1"
        ? []
        : [
            visualizer({
              filename: path.resolve(root, "dist/stats.html"),
              open: process.env.DOCKER !== "1" && process.env.DOCKER_BUILD !== "1",
              gzipSize: true,
              brotliSize: true,
            }),
          ]),
    ],
    resolve: {
      alias: nfxUiViteAliases(root, nfxUiRoot),
      dedupe: [...nfxUiDedupe, "@tanstack/react-query-devtools"],
    },
    css: {
      modules: {
        localsConvention: "camelCase",
        generateScopedName: "[name]__[local]___[hash:base64:5]",
      },
    },
    optimizeDeps: {
      exclude: nfxUiOptimizeDepsExclude,
      holdUntilCrawlEnd: false,
    },
    server: {
      ...nfxViteDevServer(env, port),
      fs: { allow: [root, nfxUiRoot] },
      ...(command === "serve" && (apiIsPath || identityIsPath)
        ? {
            proxy: {
              ...(apiIsPath ? { [apiUrl]: { target: edgeOrigin, changeOrigin: true } } : {}),
              ...(identityIsPath ? { [identityUrl]: { target: edgeOrigin, changeOrigin: true } } : {}),
            },
          }
        : {}),
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
      sourcemap: true,
      chunkSizeWarningLimit: 400,
    },
    preview: {
      port,
      strictPort: true,
      host: "0.0.0.0",
    },
  };
});
