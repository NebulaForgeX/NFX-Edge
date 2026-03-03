# NFX-Edge Project Structure

[中文版本](../STRUCTURE.md)

## Directory Layout (Template View)

```text
NFX-Edge/
├── .env
├── .env.example
├── docker-compose.yml
├── docker-compose.example.yml
├── traefik.yml
├── start.sh
├── dynamic/
│   ├── acme-challenge.yml
│   └── tls.yaml
├── public/
│   └── nginx.conf
├── site1-www/
├── site1-admin/
├── site2-www/
└── Docs/
    ├── INDEX.md
    ├── README.md
    ├── DEPLOYMENT.md
    ├── CONFIGURATION.md
    ├── STRUCTURE.md
    └── en/
```

## Service Composition

### `traefik`

- edge proxy container
- listens on `80/443`
- reads Docker labels and `dynamic/*` files
- hosts dashboard and access logs

### Site containers (Nginx)

- one container per site
- mount static files to `/usr/share/nginx/html`
- share `public/nginx.conf`

## Network Topology

- all services run in `nfx-edge` network
- Traefik discovers business containers through Docker provider
- external cert API must be reachable for challenge forwarding

## Example vs Runtime Files

- `docker-compose.example.yml` / `.env.example`: reusable public template
- `docker-compose.yml` / `.env`: runtime configuration
