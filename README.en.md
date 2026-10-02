# NFX-Edge

[中文](README.md)

NebulaForgeX **sole** HTTP/HTTPS reverse proxy (Traefik v3) plus cert/DNS console (sites-base). Owns host **80/443**. Routes are `dynamic/*.project.yml` and backends are `NAS_IP:host port`. **sites-base** writes certs to `websites/<site>/`; Traefik does **not** issue them. Product Compose does not set Traefik labels. Login is [NFX-Identity](https://github.com/NebulaForgeX/NFX-Identity).

Config: [NFX-Documentation chapter 4](https://github.com/NebulaForgeX/NFX-Documentation/blob/main/books/en/chapter-04-nfx-edge-deployment.md).

```bash
cp .example.env .env
task traefik
task proto:gen
task atlas:pipeline:run
task run
```
