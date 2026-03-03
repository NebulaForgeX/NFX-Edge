# NFX-Edge

[English Version](Docs/en/README.md)

<div align="center">
  <img src="./Docs/image.png" alt="NFX-Edge Logo" width="200">
</div>

NFX-Edge 是一个基于 Traefik v3 + Docker Compose 的多站点入口层模板，面向“可复用部署”场景。  
它默认采用 **NFX-Vault 外部证书管理**，不使用 Traefik 内置 ACME 申请器。

## 项目目标

- 统一承载多个静态站点（如 `site1`、`site1-admin`、`site2`）
- 统一处理 HTTP -> HTTPS 跳转
- 通过文件动态配置加载 TLS 证书
- 将 ACME HTTP-01 challenge 转发到外部证书服务

## 快速开始

```bash
cp .env.example .env
# 编辑 .env
./start.sh
sudo docker compose ps
```

## 文档导航

- 使用说明：`Docs/README.md`
- 部署指南：`Docs/DEPLOYMENT.md`
- 配置详解：`Docs/CONFIGURATION.md`
- 项目结构：`Docs/STRUCTURE.md`
- 文档索引：`Docs/INDEX.md`

## NAS 网络注意事项

本项目主要面向 NAS 场景，请在部署前先完成以下检查：

1. **避免端口冲突（重点）**
   - 若 NAS 自带 Web 服务占用 `80/443`，请先关闭或改端口。
   - 例如将 NAS 管理入口改为 `5000/5001` 或其他自定义端口，确保 Traefik 可以独占 `80/443`。

2. **固定 NAS 局域网地址**
   - 在路由器为 NAS 绑定静态 DHCP（固定内网 IP）。
   - 端口转发必须指向这个固定 IP，避免重启后 IP 变化导致转发失效。

3. **路由器与光猫配置**
   - 优先使用“单层 NAT”架构（光猫桥接 + 路由器拨号），减少转发问题。
   - 若无法桥接，需在光猫和路由器两层都正确配置转发（双重 NAT）。
   - 将公网 `80/443` 转发到 NAS 的 `80/443`。

4. **内外网验证方式**
   - 先在 NAS 本机验证容器和路由是否正常，再做外网验证。
   - 如内网设备访问公网域名异常，可能是 NAT Loopback（Hairpin NAT）限制，不代表公网一定不可用。

5. **防火墙与安全建议**
   - 放行 `80/443` 入站。
   - 建议关闭路由器 UPnP，采用手动端口转发。
   - Dashboard 必须启用认证，不要裸露管理入口。