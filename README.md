# NFX-Edge

> 部署、网络、配置与安全的详细说明见 [NFX-Documentation](https://github.com/NebulaForgeX/NFX-Documentation)（[第四章：NFX-Edge](https://github.com/NebulaForgeX/NFX-Documentation/blob/New-Arch/books/zh/chapter-04-nfx-edge-deployment.md)）。
> Deploy, network, config, and security: [NFX-Documentation](https://github.com/NebulaForgeX/NFX-Documentation) ([Chapter 4: NFX-Edge](https://github.com/NebulaForgeX/NFX-Documentation/blob/New-Arch/books/en/chapter-04-nfx-edge-deployment.md)).

<div align="center">
  <img src="./image.png" alt="NFX-Edge Logo" width="200">
</div>

NFX-Edge 是 NebulaForgeX **唯一**的 HTTP 反向代理（Traefik v3 + Docker Compose），对齐 CityPulso：产品服务自己不跑 Traefik，只挂 `nfx-edge` 网络并打 `traefik.project` 标签。  
它默认采用 **NFX-Vault 外部证书管理**，不使用 Traefik 内置 ACME 申请器。

## 项目目标

- 统一入口：静态站点 + Identity / Vault / News / Storages / Documentation
- 产品栈 **禁止** 再起 `reverse-proxy`；HTTP 只经本仓 80/443
- 统一处理 HTTP -> HTTPS 跳转
- 通过文件动态配置加载 TLS 证书
- ACME HTTP-01 由 NFX-Vault `tls-api` 的 Docker labels 承接

## 快速开始

```bash
cp .env.example .env
# 编辑 .env
./start.sh
sudo docker compose ps
```

NAS / 路由器 / 80·443 占用等细节见 Documentation 第一至四章。
