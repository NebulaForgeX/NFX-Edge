# NFX-Edge

[中文](README.md)

NebulaForgeX **sole** HTTP/HTTPS reverse proxy (Traefik v3) plus cert/DNS console (sites-base). Owns host **80/443** and network `nfx-edge`. **sites-base** writes certs to `websites/<site>/` in this repo; Traefik does **not** issue them. Products only set `traefik.project` labels; they must not run Traefik. Login is [NFX-Identity](https://github.com/NebulaForgeX/NFX-Identity).

Config: [NFX-Documentation chapter 4](https://github.com/NebulaForgeX/NFX-Documentation/blob/main/books/en/chapter-04-nfx-edge-deployment.md).

```bash
cp .example.env .env
task traefik
task proto:gen
task atlas:pipeline:run
task run
```
