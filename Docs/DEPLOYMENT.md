# NFX-Edge 部署指南

[English Version](en/DEPLOYMENT.md)

## 前置条件

- Docker 和 Docker Compose v2 可用
- DNS 指向部署主机公网 IP
- 路由器/防火墙放通并转发 `80` 与 `443`
- 外部证书服务可用（用于证书申请和续期）

## 部署流程

### 1) 初始化变量

```bash
cp .env.example .env
```

按本机路径修改 `.env`，确保路径存在。

### 2) 启动

```bash
./start.sh
```

### 3) 检查运行状态

```bash
sudo docker compose ps
sudo docker compose logs --tail 200 NFX-Edge-Reverse-Proxy
```

### 4) 验证访问

- `http://site1.example.com` 是否跳转 `https://site1.example.com`
- `https://site1.example.com` 是否返回正常内容
- Dashboard 域名是否可访问并要求 BasicAuth

## 运维命令

```bash
# 重建启动
sudo docker compose up --build -d

# 查看 Traefik 日志
sudo docker compose logs -f NFX-Edge-Reverse-Proxy

# 重启 Traefik
sudo docker compose restart NFX-Edge-Reverse-Proxy
```

## 常见故障排查

- 外网不通但内网可通：检查端口转发、NAT loopback、双重 NAT
- challenge 失败：检查 `dynamic/acme-challenge.yml` 目标地址与网络连通
- 路由错乱：检查 Host 规则是否重叠，以及标签约束是否一致

