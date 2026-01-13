# NFX-Edge 配置详解

本文档详细说明 NFX-Edge 的所有配置选项。

[English Version](en/CONFIGURATION.md)

## 配置文件

NFX-Edge 使用多个配置文件进行配置：

- `.env` - 环境变量配置文件
- `docker-compose.yml` - Docker Compose 服务定义
- `traefik.yml` - Traefik 静态配置
- `dynamic/*.yml` - Traefik 动态配置
- `nginx.conf` - Nginx 配置

### 创建配置文件

```bash
# 从模板复制
cp docker-compose.example.yml docker-compose.yml

# 创建 .env 文件
cat > .env << EOF
CERTS_DIR=/path/to/certs/websites
TRAEFIK_CONFIG_FILE=/home/kali/repo/traefik.yml
TRAEFIK_DYNAMIC_DIR=/home/kali/repo/dynamic
NGINX_CONFIG_FILE=/home/kali/repo/nginx.conf
EOF
```

## 环境变量配置 (.env)

### CERTS_DIR

证书存储目录路径。

```bash
CERTS_DIR=/path/to/certs/websites
```

**说明**：
- 所有网站的证书文件都存储在此目录下
- 每个网站使用独立的子文件夹
- 格式：`{CERTS_DIR}/{folder_name}/cert.crt` 和 `{CERTS_DIR}/{folder_name}/key.key`

### TRAEFIK_CONFIG_FILE

Traefik 静态配置文件路径。

```bash
TRAEFIK_CONFIG_FILE=/home/kali/repo/traefik.yml
```

### TRAEFIK_DYNAMIC_DIR

Traefik 动态配置目录路径。

```bash
TRAEFIK_DYNAMIC_DIR=/home/kali/repo/dynamic
```

**说明**：
- 此目录包含所有动态配置文件
- Traefik 会监控此目录的变化并自动重新加载

### NGINX_CONFIG_FILE

Nginx 配置文件路径。

```bash
NGINX_CONFIG_FILE=/home/kali/repo/nginx.conf
```

## Docker Compose 配置

### reverse-proxy 服务

Traefik 反向代理服务配置：

```yaml
reverse-proxy:
  image: traefik:v3.4
  container_name: NFX-Edge-Reverse-Proxy
  restart: always
  command:
    - --api.dashboard=true
    - --providers.docker
    - --providers.docker.exposedByDefault=false
    - --providers.file.directory=/etc/traefik/dynamic
    - --providers.file.watch=true
    - --entrypoints.web.address=:80
    - --entrypoints.websecure.address=:443
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro
    - ${CERTS_DIR}:/certs/websites:ro
    - ${TRAEFIK_CONFIG_FILE}:/etc/traefik/traefik.yml:ro
    - ${TRAEFIK_DYNAMIC_DIR}:/etc/traefik/dynamic:ro
  labels:
    - traefik.enable=true
    - traefik.http.routers.web-dashboard.rule=Host(`traefik.example.com`) && (PathPrefix(`/dashboard`) || PathPrefix(`/api`))
    - traefik.http.routers.web-dashboard.entrypoints=websecure
    - traefik.http.routers.web-dashboard.tls=true
    - traefik.http.routers.web-dashboard.service=api@internal
    - traefik.http.middlewares.dashboard-auth.basicauth.users=admin:$$2y$$05$$...
    - traefik.http.routers.web-dashboard.middlewares=dashboard-auth
```

**关键配置说明**：

- **ports**: 映射主机端口 80 和 443
- **volumes**: 挂载 Docker socket、证书目录、配置文件
- **labels**: 配置 Traefik Dashboard 路由和认证

### 网站服务配置

每个网站服务的配置模板：

```yaml
www_example:
  image: nginx:alpine
  container_name: NFX-Edge-WWW-EXAMPLE
  restart: always
  volumes:
    - ./www.example.com:/usr/share/nginx/html:ro
    - ${NGINX_CONFIG_FILE}:/etc/nginx/conf.d/default.conf:ro
  labels:
    - traefik.enable=true
    - traefik.http.routers.example.rule=Host(`example.com`) || Host(`www.example.com`)
    - traefik.http.routers.example.entrypoints=websecure
    - traefik.http.routers.example.tls=true
  networks:
    - nfx-edge
  depends_on:
    - reverse-proxy
```

**关键配置说明**：

- **volumes**: 挂载网站静态文件目录和 Nginx 配置（只读）
- **labels**: 配置 Traefik 路由规则和 TLS
- **depends_on**: 确保 reverse-proxy 先启动

## Traefik 配置

### traefik.yml

Traefik 静态配置文件：

```yaml
api:
  dashboard: true
  insecure: false

entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"

providers:
  docker:
    exposedByDefault: false
  file:
    directory: /etc/traefik/dynamic
    watch: true
```

**配置说明**：

- **api.dashboard**: 启用 Dashboard
- **api.insecure**: 禁用不安全模式（必须使用 HTTPS）
- **entryPoints**: 定义 HTTP (80) 和 HTTPS (443) 入口点
- **providers.docker**: 启用 Docker provider，默认不暴露服务
- **providers.file**: 启用文件 provider，监控动态配置目录

### dynamic/certs.yml

TLS 证书文件路径配置：

```yaml
tls:
  certificates:
    - certFile: /certs/websites/www_example/cert.crt
      keyFile: /certs/websites/www_example/key.key
      stores:
        - default
```

**配置说明**：

- **certFile**: 证书文件路径（容器内路径）
- **keyFile**: 私钥文件路径（容器内路径）
- **stores**: 证书存储位置（default 表示默认存储）

### dynamic/acme-challenge.yml

ACME HTTP-01 挑战转发配置：

```yaml
http:
  routers:
    acme-challenge:
      rule: "PathPrefix(`/.well-known/acme-challenge`)"
      entrypoints:
        - web
      service: acme-challenge-service
      priority: 1000
  services:
    acme-challenge-service:
      loadBalancer:
        servers:
          - url: "http://NFX-Vault-Backend-API:8000"
        passHostHeader: true
```

**配置说明**：

- **rule**: 匹配所有 `/.well-known/acme-challenge` 路径
- **priority**: 高优先级，确保先于其他路由匹配
- **service**: 转发到 NFX-Vault API 服务

**注意**：此配置只有在使用 NFX-Vault 进行证书申请时才需要。

**NFX-Vault 项目地址**：https://github.com/NebulaForgeX/NFX-Vault

**配置 NFX-Vault 网络连接**：

确保 NFX-Vault 的 `backend-api` 服务加入 `nfx-edge` 网络，在 NFX-Vault 的 `docker-compose.yml` 中添加：

```yaml
services:
  backend-api:
    networks:
      - nfx-edge
networks:
  nfx-edge:
    external: true
```

### dynamic/redirect-to-https.yml

HTTP 到 HTTPS 重定向规则：

```yaml
http:
  middlewares:
    redirect-to-https:
      redirectScheme:
        scheme: https
        permanent: true
  routers:
    http-to-https:
      rule: "HostRegexp(`{host:.+}`) && !PathPrefix(`/.well-known/acme-challenge/`)"
      entryPoints:
        - web
      middlewares:
        - redirect-to-https
      service: api@internal
      priority: 1
```

**配置说明**：

- **redirectScheme**: 重定向到 HTTPS，永久重定向（301）
- **rule**: 匹配所有主机，但排除 ACME 挑战路径
- **priority**: 低优先级，确保其他路由优先匹配

## Nginx 配置

### nginx.conf

统一的 Nginx 配置文件，所有网站共享：

**主要特性**：

1. **SPA 路由支持**
   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```

2. **Gzip 压缩**
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   ```

3. **静态资源缓存**
   ```nginx
   location ~* \.(?:ico|css|js|gif|jpe?g|png|webp|woff2?|ttf|svg|eot)$ {
       expires 30d;
       add_header Cache-Control "public, immutable";
   }
   ```

4. **HTML 不缓存**
   ```nginx
   location ~* \.(?:html)$ {
       expires -1;
       add_header Cache-Control "no-cache";
   }
   ```

5. **安全响应头**
   ```nginx
   add_header X-Content-Type-Options "nosniff" always;
   add_header X-Frame-Options "SAMEORIGIN" always;
   add_header X-XSS-Protection "1; mode=block" always;
   ```

## 配置验证

### 检查配置

```bash
# 验证 Docker Compose 配置
sudo docker compose config

# 检查特定服务的配置
sudo docker compose config reverse-proxy
```

### 测试连接

```bash
# 测试 HTTP 重定向
curl -I http://www.example.com

# 测试 HTTPS
curl -I https://www.example.com

# 测试 Traefik Dashboard
curl -I https://traefik.example.com/dashboard/
```

### 验证证书

```bash
# 查看证书内容
openssl x509 -in ${CERTS_DIR}/www_example/cert.crt -text -noout

# 查看证书过期时间
openssl x509 -in ${CERTS_DIR}/www_example/cert.crt -noout -dates

# 验证私钥
openssl rsa -in ${CERTS_DIR}/www_example/key.key -check
```

## 配置最佳实践

### 1. 路径配置

- 使用绝对路径，避免相对路径问题
- 确保所有路径都存在且可访问

### 2. 证书管理

- 定期检查证书过期时间
- 使用 NFX-Vault 自动管理证书（推荐）
  - 项目地址: https://github.com/NebulaForgeX/NFX-Vault
  - 配置网络连接，确保 NFX-Vault 的 `backend-api` 服务加入 `nfx-edge` 网络
  - 通过 Web 界面申请证书，证书自动存储在 `${CERTS_DIR}` 目录
- 备份证书文件

### 3. 安全配置

- 使用强密码保护 Traefik Dashboard
- 定期更新 Docker 镜像
- 配置防火墙限制访问

### 4. 性能优化

- 启用 Gzip 压缩
- 配置静态资源缓存
- 使用 Alpine 镜像减小体积

## 相关文档

- [配置文档使用指南](README.md) - 配置模板使用说明
- [部署指南](DEPLOYMENT.md) - 部署步骤和最佳实践
- [项目结构](STRUCTURE.md) - 项目目录结构
- [主项目 README](../README.md) - 项目介绍和快速开始

---

## 支持

**开发者**：Lucas Lyu  
**联系方式**：lyulucas2003@gmail.com

