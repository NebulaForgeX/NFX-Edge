# NFX-Edge 使用说明

[English Version](en/README.md)

## 快速启动

```bash
cp .env.example .env
# 编辑 .env（按你的机器路径）
./start.sh
sudo docker compose ps
```

## `.env` 推荐模板

```bash
CERTS_DIR=/absolute/path/to/certs
SITE1_WWW_DIR=./site1-www
SITE1_ADMIN_DIR=./site1-admin
SITE2_WWW_DIR=./site2-www
NGINX_CONFIG_FILE=./public/nginx.conf
```

说明：

- `CERTS_DIR`：证书根目录（来自外部证书管理项目）
- 站点目录变量：挂载到各 Nginx 容器
- `NGINX_CONFIG_FILE`：统一站点配置

## 证书流转（外部管理）

1. 外部证书服务负责申请和续签证书  
2. 证书写入 `CERTS_DIR` 子目录（如 `site1/`、`site2/`）  
3. `dynamic/tls.yaml` 声明证书文件映射  
4. `dynamic/acme-challenge.yml` 处理 HTTP-01 challenge 转发

## 添加站点（模板方式）

1. 新建网站目录并放入静态文件（如 `./site1-www`）
2. 在 `docker-compose.yml` 添加 Nginx 服务
3. 添加 Traefik labels（`Host(...)`、`websecure`、`tls=true`）
4. 在 `dynamic/tls.yaml` 增加证书路径
5. 执行 `sudo docker compose up -d`

## 常见问题

- HTTP 不跳转 HTTPS：检查 Traefik entrypoint redirection 参数
- 证书不生效：检查 `dynamic/tls.yaml` 路径是否与容器挂载一致
- ACME challenge 失败：检查 `dynamic/acme-challenge.yml` 目标服务是否可达

