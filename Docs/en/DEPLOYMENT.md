# NFX-Edge Deployment Guide

[中文版本](../DEPLOYMENT.md)

## Prerequisites

- Docker and Docker Compose v2 are available
- DNS points to the host public IP
- Router/firewall allows and forwards ports `80` and `443`
- External certificate service is available for issuance and renewal

## Deployment Steps

### 1) Initialize variables

```bash
cp .env.example .env
```

Update `.env` with valid local paths.

### 2) Start services

```bash
./start.sh
```

### 3) Verify runtime

```bash
sudo docker compose ps
sudo docker compose logs --tail 200 NFX-Edge-Reverse-Proxy
```

### 4) Validate traffic

- `http://site1.example.com` redirects to `https://site1.example.com`
- `https://site1.example.com` serves expected content
- Dashboard domain is reachable and protected by BasicAuth

## Operations

```bash
# rebuild and start in background
sudo docker compose up --build -d

# follow Traefik logs
sudo docker compose logs -f NFX-Edge-Reverse-Proxy

# restart Traefik
sudo docker compose restart NFX-Edge-Reverse-Proxy
```

## Troubleshooting Focus

- External access fails but local works: check port forwarding, NAT loopback, and double NAT
- ACME challenge fails: check target URL and network reachability in `dynamic/acme-challenge.yml`
- Misrouting: check overlapping `Host(...)` rules and label constraints
