# NFX-Edge

[中文](README.md)

<div align="center">
  <img src="console/public/logo.png" alt="NFX-Edge" width="200">
</div>

The **only** HTTP/HTTPS ingress for NebulaForgeX, plus the certificate and DNS console. Traefik **v3.7.13** (`docker-compose.traefik.yml`) owns host **80/443**. The container is `NFX-Edge-Reverse-Proxy`. Product Compose has **no** Traefik labels and does **not** join a shared Docker network. Traefik only dials `NAS_IP:host port` from `dynamic/*.project.yml`.

Static config is `traefik.yml` (file provider, `watch: true`). Editing `dynamic/` reloads Traefik; a restart is not required. `NAS1_IP` / `NAS2_IP` in `.env` fill `{{ env "NAS1_IP" }}`. Both NAS machines use the same port numbers and are told apart by IP.

## Route files

Templates live in `dynamic.example/`. The live copies are `dynamic/` (gitignored): `identity`, `news`, `storages`, `edge`, `documentation`, `sites`, `minio`, `dashboard`, and `tls.yaml`.

```bash
cp .example.env .env
cp dynamic.example/*.project.yml dynamic/
task traefik
```

The `*.project.yml` glob does **not** copy `tls.yaml`. Copy it with `cp dynamic.example/tls.yaml dynamic/tls.yaml` only after `websites/<site>/cert.crt` and `key.key` exist. Listing a missing file makes the whole file provider fail to load. Do not enable Traefik `httpchallenge`, `tlschallenge`, or `certResolver`. Do not commit private keys.

## LAN consoles redirect to their own ports

`*-console-lan` and `documentation-lan` (`Host(NAS1_IP)`) use `redirectRegex` with `permanent: false`, so the response is 302. `https://<NAS1_IP>/console/nfx-*` goes to `http://<NAS1_IP>:<port>/console/nfx-*/`. Different ports keep login state apart. Domain routers `*-console-host` do not use this middleware and stay on HTTPS.

| Path | LAN redirect |
|------|----------------|
| `/console/nfx-identity` | **10039** |
| `/console/nfx-edge` | **10115** |
| `/console/nfx-news` | **10075** |
| `/console/nfx-storages` | **10101** |
| `/console/nfx-documentation` | **10120** |

Documentation's public Host is `identity.nebulaforgex.com`, not a separate docs domain.

After the redirect, APIs no longer pass through Traefik. The secure console nginx of Identity, Edge, News, and Storages strips `/nfx-*` and forwards: Identity auth **10035**, asset **10037**; Edge sites **10113**; News HTTP **10063–10073**; Storages admin/object/iam/notify **10093–10099**. The Edge, News, and Storages consoles also proxy `/nfx-identity/auth` and `/asset`.

## Product prefixes after StripPrefix

- `/nfx-identity/auth|asset` drops `/nfx-identity`, so Fiber still sees `/auth` and `/asset`. The dev prefix is `/dev/nfx-identity`
- `/nfx-edge/edge/...` drops `/nfx-edge`
- `/nfx-news/{source,news,crawl,report,notify,mcp}` drops `/nfx-news`
- `/nfx-storages/{admin,object,iam,notify}` drops `/nfx-storages`. S3 is Host `s3.nebulaforgex.com` with no strip. The secure backend is **10091**
- ACME `/.well-known/acme-challenge` is in `edge.project.yml` on the `web` entrypoint, so the 80→443 redirect does not swallow it. It hits sites secure HTTP **10113**
- Static sites: `aquawork.ca` → **10400**, `timetablecraft.com` → **10401**

## sites-base (certificates / DNS / files)

Login is Identity. This repo's `.env` has **no** `GRPC_PORT_AUTH`. The dial string is `${GRPC_HOST_AUTH}:${GRPC_EXT_PORT_AUTH}`, and `GRPC_HOST_AUTH` is the NAS IP, not a container name. `50071` is Identity's in-container listen.

| | dev | secure |
|--|-----|--------|
| sites HTTP | **10110** | **10113** |
| sites gRPC | **10111** | **10114** |
| console | **10112** | **10115** |
| dial Identity | **10031** | **10036** |

Vite is `5175`. Dev browser prefixes are `/dev/nfx-edge`, `/dev/console/nfx-edge/`, and `/dev/nfx-identity`. Secure drops `/dev`. Fiber serves `/edge/tls`, `/edge/dns`, `/edge/file`, and `/edge/analysis`. The only schema is `sites`: `tls_certificates` and `namecheap_credentials`. There is no `dns` schema and no DDNS table. Console product pages are `/certs`, `/analysis/tls`, `/filefolder`, and `/namecheap`. Profile pages are still `/user/profile/*`, not Identity's `/forger/*` yet.

```bash
task proto:gen
task atlas:pipeline:run
task console:i
task run
```

`TOKEN_SECRET_KEY` and `TOKEN_ISSUER=nfxidentity` must match Identity exactly. Certs are written to `./websites` in this repo. Traefik mounts that directory read-only at `/certs/websites`.

Full detail: [chapter 4, reverse proxy](https://github.com/NebulaForgeX/NFX-Documentation/blob/main/books/en/chapter-04-nfx-edge-deployment.md) and [chapter 5, certificates](https://github.com/NebulaForgeX/NFX-Documentation/blob/main/books/en/chapter-05-nfx-vault-deployment.md).
