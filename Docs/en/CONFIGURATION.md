# NFX-Edge Configuration Details

[中文版本](../CONFIGURATION.md)

## Config Files

- `.env`
- `docker-compose.yml`
- `docker-compose.example.yml`
- `traefik.yml`
- `dynamic/tls.yaml`
- `dynamic/acme-challenge.yml`
- `public/nginx.conf`

## Recommended `.env` Template

```bash
CERTS_DIR=/absolute/path/to/certs
SITE1_WWW_DIR=./site1-www
SITE1_ADMIN_DIR=./site1-admin
SITE2_WWW_DIR=./site2-www
NGINX_CONFIG_FILE=./public/nginx.conf
```

## Key Traefik Settings

### HTTP -> HTTPS redirection

- `--entrypoints.web.http.redirections.entrypoint.to=websecure`
- `--entrypoints.web.http.redirections.entrypoint.scheme=https`
- `--entrypoints.web.http.redirections.entrypoint.permanent=true`
- `--entrypoints.web.http.redirections.entrypoint.priority=1`

### Provider and isolation constraint

- `--providers.file.directory=/dynamic`
- `--providers.file.watch=true`
- `--providers.docker=true`
- `--providers.docker.exposedbydefault=false`
- `--providers.docker.constraints=LabelRegex(\`traefik.project\`, \`^(nfx-edge|nfx-identity|nfx-vault|nfx-news|nfx-storages|nfx-documentation)$\`)`

## Dynamic File Conventions

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

## Site Label Template

```yaml
labels:
  - traefik.enable=true
  - traefik.project=nfx-edge
  - traefik.http.routers.site1.rule=Host(`site1.example.com`) || Host(`www.site1.example.com`)
  - traefik.http.routers.site1.entrypoints=websecure
  - traefik.http.routers.site1.tls=true
```

Product stacks (Identity / Vault / News / Storages / Documentation) use the same `traefik.enable` + `traefik.project=<product>` labels and join the external `nfx-edge` network. **Do not** run Traefik in those repos.

## Validation Commands

```bash
sudo docker compose config
sudo docker compose ps
sudo docker compose logs --tail 200 NFX-Edge-Reverse-Proxy
```
