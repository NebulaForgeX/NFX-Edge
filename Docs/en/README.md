# NFX-Edge Usage Guide

[中文版本](../README.md)

## Quick Start

```bash
cp .env.example .env
# edit .env with local paths
./start.sh
sudo docker compose ps
```

## Recommended `.env` Template

```bash
CERTS_DIR=/absolute/path/to/certs
SITE1_WWW_DIR=./site1-www
SITE1_ADMIN_DIR=./site1-admin
SITE2_WWW_DIR=./site2-www
NGINX_CONFIG_FILE=./public/nginx.conf
```

Notes:

- `CERTS_DIR`: certificate root directory from an external cert manager
- Site directory variables: mounted into Nginx containers
- `NGINX_CONFIG_FILE`: shared Nginx config

## Certificate Flow (External Management)

1. External cert service issues and renews certificates
2. Certificates are written to subfolders under `CERTS_DIR`
3. `dynamic/tls.yaml` maps cert files for Traefik
4. `dynamic/acme-challenge.yml` forwards HTTP-01 challenge requests

## Add a New Site (Template Style)

1. Create a site directory and place static files (for example `./site1-www`)
2. Add an Nginx service in `docker-compose.yml`
3. Add Traefik labels (`Host(...)`, `websecure`, `tls=true`)
4. Add cert paths in `dynamic/tls.yaml`
5. Run `sudo docker compose up -d`

## Common Issues

- HTTP does not redirect to HTTPS: check Traefik entrypoint redirection flags
- Certificate not applied: check file paths in `dynamic/tls.yaml`
- ACME challenge fails: check target service and network reachability in `dynamic/acme-challenge.yml`
