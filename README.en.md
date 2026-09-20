# NFX-Edge

[中文](README.md)

NebulaForgeX **sole** HTTP/HTTPS reverse proxy (Traefik v3). Owns host **80/443** and network `nfx-edge`. Products only set `traefik.project` labels; they must not run Traefik.

Config and certificates: [NFX-Documentation chapter 4](https://github.com/NebulaForgeX/NFX-Documentation/blob/main/books/en/chapter-04-nfx-edge-deployment.md). Certs are written by [NFX-Vault](https://github.com/NebulaForgeX/NFX-Vault).

```bash
cp .env.example .env
./start.sh
```
