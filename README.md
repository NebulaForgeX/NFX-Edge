# NFX-Edge

[English](README.en.md)

NebulaForgeX **唯一** HTTP/HTTPS 反向代理（Traefik v3）+ 证书 / DNS 控制台（sites-base）。占用主机 **80/443**。路由在 `dynamic/*.project.yml`，后端是 `NAS_IP:宿主机端口`。证书由 **sites-base** 写到 `websites/<site>/`，Traefik **不**签发。产品 Compose 不打 Traefik 标签。登录走 [NFX-Identity](https://github.com/NebulaForgeX/NFX-Identity)。

配置：[NFX-Documentation 第四章](https://github.com/NebulaForgeX/NFX-Documentation/blob/main/books/zh/chapter-04-nfx-edge-deployment.md)。

```bash
cp .example.env .env
task traefik
task proto:gen
task atlas:pipeline:run
task run
```
