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

### GitLab 配置

#### GITLAB_SSH_BIND_HOST 和 GITLAB_SSH_PORT

GitLab SSH 端口绑定配置。

```bash
GITLAB_SSH_BIND_HOST=0.0.0.0
GITLAB_SSH_PORT=2224
```

**说明**：
- `GITLAB_SSH_BIND_HOST`：SSH 服务绑定的主机地址（通常为 `0.0.0.0`）
- `GITLAB_SSH_PORT`：宿主机映射的 SSH 端口（默认 2224，避免与系统 SSH 端口 22 冲突）

#### GITLAB_TZ

GitLab 时区设置。

```bash
GITLAB_TZ=America/Vancouver
```

#### GITLAB_CONFIG_VOLUME

GitLab 配置文件存储路径。

```bash
GITLAB_CONFIG_VOLUME=/volume1/NebulaForgeX/NFX-Edge/GitLab/config
```

**说明**：
- 存储 GitLab 配置文件（`gitlab.rb`）
- 配置文件修改后需要运行 `gitlab-ctl reconfigure` 或重启容器

#### GITLAB_LOGS_VOLUME

GitLab 日志文件存储路径。

```bash
GITLAB_LOGS_VOLUME=/volume1/NebulaForgeX/NFX-Edge/GitLab/logs
```

#### GITLAB_DATA_VOLUME

GitLab 数据存储路径（仓库、数据库等）。

```bash
GITLAB_DATA_VOLUME=/volume1/NebulaForgeX/NFX-Edge/GitLab/data
```

**说明**：
- 存储所有 GitLab 数据，包括：
  - Git 仓库
  - PostgreSQL 数据库
  - Redis 数据
  - 上传的文件
  - 备份文件
- **重要**：定期备份此目录

#### GITLAB_DOMAIN

GitLab Web 界面域名。

```bash
GITLAB_DOMAIN=git.example.com
```

**说明**：
- 用于访问 GitLab Web 界面
- 需要在 DNS 中配置 A 记录指向服务器 IP
- 需要在 `dynamic/certs.yml` 中配置对应的证书

#### GITLAB_REGISTRY_DOMAIN

GitLab Container Registry 域名。

```bash
GITLAB_REGISTRY_DOMAIN=registry.example.com
```

**说明**：
- 用于访问 GitLab Container Registry
- 需要在 DNS 中配置 A 记录指向服务器 IP
- 需要在 `dynamic/certs.yml` 中配置对应的证书

#### GITLAB_RUNNER_VOLUME

GitLab Runner 配置文件存储路径。

```bash
GITLAB_RUNNER_VOLUME=/volume1/NebulaForgeX/NFX-Edge/GitLab/runner
```

**说明**：
- 存储 GitLab Runner 的配置文件
- Runner 注册信息存储在此目录

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

### GitLab 服务配置

GitLab 服务配置：

```yaml
gitlab:
  image: gitlab/gitlab-ce:latest
  container_name: NFX-Edge-GitLab
  hostname: gitlab
  restart: always
  shm_size: "1g"
  ports:
    - "${GITLAB_SSH_BIND_HOST}:${GITLAB_SSH_PORT}:22"
  expose:
    - "80"
    - "5050"
  environment:
    TZ: ${GITLAB_TZ:-America/Vancouver}
  volumes:
    - ${GITLAB_CONFIG_VOLUME}:/etc/gitlab
    - ${GITLAB_LOGS_VOLUME}:/var/log/gitlab
    - ${GITLAB_DATA_VOLUME}:/var/opt/gitlab
  labels:
    - traefik.enable=true
    - traefik.project=nfx-edge
    - traefik.http.routers.gitlab.rule=Host(`${GITLAB_DOMAIN}`)
    - traefik.http.routers.gitlab.entrypoints=websecure
    - traefik.http.routers.gitlab.tls=true
    - traefik.http.services.gitlab.loadbalancer.server.port=80
    - traefik.http.routers.registry.rule=Host(`${GITLAB_REGISTRY_DOMAIN}`)
    - traefik.http.routers.registry.entrypoints=websecure
    - traefik.http.routers.registry.tls=true
    - traefik.http.services.registry.loadbalancer.server.port=5050
  networks:
    - nfx-edge
```

**关键配置说明**：

- **shm_size**: 共享内存大小（GitLab 需要至少 1GB）
- **ports**: SSH 端口映射（宿主机端口:容器端口）
- **expose**: 暴露 HTTP (80) 和 Registry (5050) 端口给 Docker 网络
- **volumes**: 挂载配置、日志和数据目录
- **labels**: 配置 Traefik 路由，包括 GitLab Web 和 Registry

### GitLab Runner 服务配置

GitLab Runner 服务配置：

```yaml
gitlab-runner:
  image: gitlab/gitlab-runner:alpine
  container_name: NFX-Edge-GitLab-Runner
  restart: always
  depends_on:
    - gitlab
  volumes:
    - ${GITLAB_RUNNER_VOLUME}:/etc/gitlab-runner
    - /var/run/docker.sock:/var/run/docker.sock
  networks:
    - nfx-edge
```

**关键配置说明**：

- **depends_on**: 确保 GitLab 服务先启动
- **volumes**: 挂载 Runner 配置目录和 Docker socket（用于执行 CI/CD 任务）
- **networks**: 加入 `nfx-edge` 网络以访问 GitLab

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

## GitLab 配置

### gitlab.rb

GitLab 主配置文件，位于 `${GITLAB_CONFIG_VOLUME}/gitlab.rb`。

**重要**：首次部署前，需要从模板创建配置文件：

```bash
# 从模板复制
cp GitLab/config/gitlab.rb.local.template GitLab/config/gitlab.rb

# 根据实际情况修改域名、端口等配置
vim GitLab/config/gitlab.rb
```

**主要配置项**：

1. **外部 URL 配置**
   ```ruby
   external_url "https://git.example.com"
   registry_external_url "https://registry.example.com"
   ```

2. **SSH 端口配置**
   ```ruby
   gitlab_rails['gitlab_shell_ssh_port'] = 2224
   ```

3. **Nginx 配置（容器内）**
   ```ruby
   nginx['listen_port'] = 80
   nginx['listen_https'] = false
   gitlab_rails['gitlab_https'] = true
   gitlab_rails['gitlab_port'] = 443
   ```

4. **反向代理头配置**
   ```ruby
   nginx['proxy_set_headers'] = {
     "X-Forwarded-Proto" => "https",
     "X-Forwarded-Ssl"   => "on",
     "X-Real-IP"         => "$remote_addr",
     "X-Forwarded-For"   => "$proxy_add_x_forwarded_for",
     "Host"              => "$http_host"
   }
   ```

5. **Container Registry 配置**
   ```ruby
   gitlab_rails['registry_enabled'] = true
   registry['enable'] = true
   registry['registry_http_addr'] = "0.0.0.0:5050"
   ```

**配置修改后**：

```bash
# 重启 GitLab 容器以应用配置
sudo docker compose restart gitlab

# 或进入容器执行重新配置（推荐）
sudo docker compose exec gitlab gitlab-ctl reconfigure
```

### GitLab Runner 注册

首次使用 GitLab Runner 需要注册：

```bash
# 进入 Runner 容器
sudo docker compose exec gitlab-runner bash

# 注册 Runner
gitlab-runner register

# 按提示输入：
# - GitLab URL: https://git.example.com
# - Registration token: 从 GitLab Web 界面获取（Settings > CI/CD > Runners）
# - Description: 描述信息
# - Tags: 标签（可选）
# - Executor: docker
# - Docker image: alpine:latest（默认）
```

**或者使用环境变量注册**：

```bash
sudo docker compose exec gitlab-runner \
  gitlab-runner register \
  --non-interactive \
  --url "https://git.example.com" \
  --registration-token "YOUR_REGISTRATION_TOKEN" \
  --executor "docker" \
  --docker-image "alpine:latest" \
  --description "NFX-Edge Runner" \
  --tag-list "docker,linux"
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

### 验证 GitLab 配置

```bash
# 检查 GitLab 容器状态
sudo docker compose ps gitlab

# 查看 GitLab 日志
sudo docker compose logs gitlab

# 进入 GitLab 容器检查配置
sudo docker compose exec gitlab gitlab-ctl status

# 检查 GitLab 配置语法
sudo docker compose exec gitlab gitlab-ctl check-config
```

### 验证 GitLab Runner

```bash
# 检查 Runner 容器状态
sudo docker compose ps gitlab-runner

# 查看 Runner 日志
sudo docker compose logs gitlab-runner

# 查看已注册的 Runner
sudo docker compose exec gitlab-runner gitlab-runner list
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

### 5. GitLab 配置

- **首次部署**：从模板文件创建 `gitlab.rb` 配置文件
- **数据备份**：定期备份 `${GITLAB_DATA_VOLUME}` 目录
- **配置修改**：修改 `gitlab.rb` 后需要重启容器或运行 `gitlab-ctl reconfigure`
- **资源要求**：GitLab 需要至少 4GB RAM 和足够的磁盘空间
- **SSH 端口**：避免使用 22 端口（通常被系统占用），使用其他端口如 2224
- **证书配置**：确保在 `dynamic/certs.yml` 中配置 GitLab 和 Registry 的证书

## 相关文档

- [配置文档使用指南](README.md) - 配置模板使用说明
- [部署指南](DEPLOYMENT.md) - 部署步骤和最佳实践
- [项目结构](STRUCTURE.md) - 项目目录结构
- [主项目 README](../README.md) - 项目介绍和快速开始

---

## 支持

**开发者**：Lucas Lyu  
**联系方式**：lyulucas2003@gmail.com

