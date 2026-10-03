# NFX-Edge

[English](README.en.md)

<div align="center">
  <img src="console/public/logo.png" alt="NFX-Edge" width="200">
</div>

NebulaForgeX **唯一**的 HTTP/HTTPS 入口，外加证书和 DNS 控制台。Traefik **v3.7.13**（`docker-compose.traefik.yml`）独占主机 **80/443**，容器名 `NFX-Edge-Reverse-Proxy`。产品 Compose **没有** Traefik labels，也 **不**加入共享 Docker 网络。Traefik 只认 `dynamic/*.project.yml` 里的 `NAS_IP:宿主机端口`。

静态配置是 `traefik.yml`（file provider，`watch: true`）。改 `dynamic/` 之后 Traefik 自己重载，一般不用重启。`.env` 里的 `NAS1_IP` / `NAS2_IP` 注入到 `{{ env "NAS1_IP" }}`。两台 NAS 用同一套端口，靠 IP 区分。

## 路由文件

模板在 `dynamic.example/`，本机生效的是 `dynamic/`（gitignore）：`identity`、`news`、`storages`、`edge`、`documentation`、`sites`、`minio`、`dashboard`，以及 `tls.yaml`。

```bash
cp .example.env .env
cp dynamic.example/*.project.yml dynamic/
task traefik
```

`*.project.yml` 的通配 **不会**复制 `tls.yaml`。`websites/<site>/cert.crt` 和 `key.key` 已经存在时，再 `cp dynamic.example/tls.yaml dynamic/tls.yaml`。文件还不存在就写进 `tls.yaml`，整份 file provider 会加载失败。不要给 Traefik 开 `httpchallenge` / `tlschallenge` / `certResolver`。私钥不要提交 Git。

## 局域网控制台跳到各自端口

`Host(NAS1_IP)` 的 `*-console-lan` / `documentation-lan` 挂了 `redirectRegex`，`permanent: false`，所以是 302。`https://<NAS1_IP>/console/nfx-*` 跳到 `http://<NAS1_IP>:<端口>/console/nfx-*/`。端口不同，登录状态就不会串。域名路由 `*-console-host` 不挂这个中间件，仍然是 HTTPS。

| 路径 | 局域网跳到 |
|------|------------|
| `/console/nfx-identity` | **10039** |
| `/console/nfx-edge` | **10115** |
| `/console/nfx-news` | **10075** |
| `/console/nfx-storages` | **10101** |
| `/console/nfx-documentation` | **10120** |

文档站的公网 Host 是 `identity.nebulaforgex.com`，不是单独的文档域名。

跳到端口之后，接口不再经过 Traefik。Identity、Edge、News、Storages 的 secure console nginx 去掉 `/nfx-*` 前缀再转发：Identity auth **10035**、asset **10037**；Edge sites **10113**；News HTTP **10063–10073**；Storages admin/object/iam/notify **10093–10099**。Edge、News、Storages 的 console 同时转发 `/nfx-identity/auth` 和 `/asset`。

## 产品前缀（StripPrefix 之后）

- `/nfx-identity/auth|asset` 去掉 `/nfx-identity`，Fiber 仍收到 `/auth`、`/asset`。dev 前缀是 `/dev/nfx-identity`
- `/nfx-edge/edge/...` 去掉 `/nfx-edge`
- `/nfx-news/{source,news,crawl,report,notify,mcp}` 去掉 `/nfx-news`
- `/nfx-storages/{admin,object,iam,notify}` 去掉 `/nfx-storages`。S3 是 Host `s3.nebulaforgex.com`，不 strip，secure 后端 **10091**
- ACME `/.well-known/acme-challenge` 在 `edge.project.yml`，走 `web` 入口，不跟随 80→443 重定向，打到 sites 的 secure HTTP **10113**
- 静态站：`aquawork.ca` → **10400**，`timetablecraft.com` → **10401**

## sites-base（证书 / DNS / 文件）

登录走 Identity。本仓 `.env` **没有** `GRPC_PORT_AUTH`。拨号是 `${GRPC_HOST_AUTH}:${GRPC_EXT_PORT_AUTH}`，`GRPC_HOST_AUTH` 填 NAS 的 IP，不是容器名。`50071` 是 Identity 容器内的 listen。

| | dev | secure |
|--|-----|--------|
| sites HTTP | **10110** | **10113** |
| sites gRPC | **10111** | **10114** |
| console | **10112** | **10115** |
| 拨 Identity | **10031** | **10036** |

Vite `5175`。dev 浏览器前缀是 `/dev/nfx-edge`、`/dev/console/nfx-edge/`、`/dev/nfx-identity`；secure 去掉 `/dev`。Fiber 路径是 `/edge/tls`、`/edge/dns`、`/edge/file`、`/edge/analysis`。库只有 schema `sites`：`tls_certificates`、`namecheap_credentials`。没有 `dns` schema，也没有 DDNS 表。Console 业务页在 `/certs`、`/analysis/tls`、`/filefolder`、`/namecheap`。资料页仍是 `/user/profile/*`，还没改成 Identity 的 `/forger/*`。

```bash
task proto:gen
task atlas:pipeline:run
task console:i
task run
```

`TOKEN_SECRET_KEY` / `TOKEN_ISSUER=nfxidentity` 必须和 Identity 完全一致。证书写出目录是本仓 `./websites`，Traefik 只读挂载 `/certs/websites`。

详细信息见 [第四章 反向代理](https://github.com/NebulaForgeX/NFX-Documentation/blob/main/books/zh/chapter-04-nfx-edge-deployment.md) 和 [第五章 证书](https://github.com/NebulaForgeX/NFX-Documentation/blob/main/books/zh/chapter-05-nfx-vault-deployment.md)。
