# NFX-Edge

[English](README.en.md)

NebulaForgeX **唯一** HTTP/HTTPS 反向代理（Traefik v3）。占用主机 **80/443** 与网络 `nfx-edge`。产品只打 `traefik.project` 标签，禁止再起 Traefik。

配置与证书对接：[NFX-Documentation 第四章](https://github.com/NebulaForgeX/NFX-Documentation/blob/main/books/zh/chapter-04-nfx-edge-deployment.md)。证书由 [NFX-Vault](https://github.com/NebulaForgeX/NFX-Vault) 写出。

```bash
cp .env.example .env
./start.sh
```
