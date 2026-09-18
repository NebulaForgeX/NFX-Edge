# NFX-Edge 配置详解

[English Version](en/CONFIGURATION.md)

## 配置文件

- `.env`
- `docker-compose.yml`
- `docker-compose.example.yml`
- `traefik.yml`
- `dynamic/tls.yaml`
- `dynamic/acme-challenge.yml`
- `public/nginx.conf`

## `.env` 示例（推荐通用命名）

```bash
CERTS_DIR=/absolute/path/to/certs
SITE1_WWW_DIR=./site1-www
SITE1_ADMIN_DIR=./site1-admin
SITE2_WWW_DIR=./site2-www
NGINX_CONFIG_FILE=./public/nginx.conf
```

## Traefik 关键项

### HTTP -> HTTPS 重定向

- `--entrypoints.web.http.redirections.entrypoint.to=websecure`
- `--entrypoints.web.http.redirections.entrypoint.scheme=https`
- `--entrypoints.web.http.redirections.entrypoint.permanent=true`
- `--entrypoints.web.http.redirections.entrypoint.priority=1`

### Provider 与隔离约束

- `--providers.file.directory=/dynamic`
- `--providers.file.watch=true`
- `--providers.docker=true`
- `--providers.docker.exposedbydefault=false`
- `--providers.docker.constraints=LabelRegex(\`traefik.project\`, \`^(nfx-edge|nfx-identity|nfx-vault|nfx-news|nfx-storages|nfx-documentation)$\`)`

## 动态文件规范

### `dynamic/tls.yaml`

```yaml
tls:
  certificates:
    - certFile: /certs/websites/site1/cert.crt
      keyFile: /certs/websites/site1/key.key
    - certFile: /certs/websites/site2/cert.crt
      keyFile: /certs/websites/site2/key.key
```

### `dynamic/acme-challenge.yml`

```yaml
http:
  routers:
    acme-challenge:
      rule: "PathPrefix(`/.well-known/acme-challenge/`)"
      entryPoints:
        - web
      service: acme-challenge-service
      priority: 100
```

## 站点标签模板

```yaml
labels:
  - traefik.enable=true
  - traefik.project=nfx-edge
  - traefik.http.routers.site1.rule=Host(`site1.example.com`) || Host(`www.site1.example.com`)
  - traefik.http.routers.site1.entrypoints=websecure
  - traefik.http.routers.site1.tls=true
```

产品服务（Identity / Vault / News / Storages / Documentation）在各自 compose 里同样打 `traefik.enable` + `traefik.project=<产品>`，并加入外部网络 `nfx-edge`。**不要**在产品仓再起 Traefik。

## 验证命令

```bash
sudo docker compose config
sudo docker compose ps
sudo docker compose logs --tail 200 NFX-Edge-Reverse-Proxy
```

