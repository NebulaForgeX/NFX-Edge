# NFX-Edge 配置文档使用说明

本文档介绍如何配置和使用 NFX-Edge 多网站集群系统。

[English Version](en/README.md)

## 快速开始

### 1. 创建配置文件

```bash
cd /home/kali/repo

# 复制 Docker Compose 配置模板
cp docker-compose.example.yml docker-compose.yml

# 创建 .env 文件
cat > .env << EOF
CERTS_DIR=/path/to/certs/websites
TRAEFIK_CONFIG_FILE=/home/kali/repo/traefik.yml
TRAEFIK_DYNAMIC_DIR=/home/kali/repo/dynamic
NGINX_CONFIG_FILE=/home/kali/repo/nginx.conf
EOF
```

### 2. 编辑 docker-compose.yml

根据实际需求修改 `docker-compose.yml`：

- 修改域名配置
- 修改容器名称
- 修改 Traefik Dashboard 域名
- 添加或删除网站服务

### 3. 配置证书

#### 使用 NFX-Vault（推荐）

NFX-Vault 是一个基于 Web 的 SSL 证书管理和监控系统，可以自动申请和管理 Let's Encrypt 证书。

**项目地址**：
- GitHub: https://github.com/NebulaForgeX/NFX-Vault

**配置步骤**：

1. **安装和启动 NFX-Vault**
   ```bash
   # 克隆或下载 NFX-Vault 项目
   cd /volume1
   git clone https://github.com/NebulaForgeX/NFX-Vault.git Certs
   # 或使用现有目录
   cd NFX-Vault
   
   # 根据 NFX-Vault 的 README 配置并启动服务
   docker compose up -d
   ```

2. **配置网络连接**
   - 确保 NFX-Vault 的 `backend-api` 服务加入 `nfx-edge` 网络
   - 在 NFX-Vault 的 `docker-compose.yml` 中添加网络配置：
     ```yaml
     services:
       backend-api:
         networks:
           - nfx-edge
     networks:
       nfx-edge:
         external: true
     ```
   - 或确保两个项目在同一个 Docker 网络中

3. **配置 ACME 挑战转发**
   - NFX-Edge 的 `dynamic/acme-challenge.yml` 已配置将 ACME 挑战请求转发到 `NFX-Vault-Backend-API:8000`
   - 确保此配置文件存在且正确

4. **通过 Web 界面申请证书**
   - 访问 NFX-Vault Web 界面
   - 填写域名、邮箱、folder_name 等信息
   - 提交申请，等待证书生成

5. **证书自动存储**
   - 证书存储在 `${CERTS_DIR}/{folder_name}/` 目录下
   - 文件：`cert.crt` 和 `key.key`

6. **更新 certs.yml**
   - 在 `dynamic/certs.yml` 中添加新证书路径
   - 重启 Traefik：`sudo docker compose restart reverse-proxy`

#### 手动管理证书

1. 创建证书目录
   ```bash
   mkdir -p ${CERTS_DIR}/www_example
   ```

2. 复制证书文件
   ```bash
   cp cert.pem ${CERTS_DIR}/www_example/cert.crt
   cp key.pem ${CERTS_DIR}/www_example/key.key
   ```

3. 更新 `dynamic/certs.yml`
   ```yaml
   tls:
     certificates:
       - certFile: /certs/websites/www_example/cert.crt
         keyFile: /certs/websites/www_example/key.key
         stores:
           - default
   ```

## 配置文件说明

### .env 文件

环境变量配置文件，定义路径和配置：

```bash
# 证书存储目录
CERTS_DIR=/path/to/certs/websites

# Traefik 配置文件路径
TRAEFIK_CONFIG_FILE=/home/kali/repo/traefik.yml

# Traefik 动态配置目录
TRAEFIK_DYNAMIC_DIR=/home/kali/repo/dynamic

# Nginx 配置文件路径
NGINX_CONFIG_FILE=/home/kali/repo/nginx.conf
```

### docker-compose.yml

Docker Compose 主配置文件，定义所有服务：

- **reverse-proxy**: Traefik 反向代理服务
- **www_***: 各个网站的 Nginx 服务
- **admin_***: 管理后台的 Nginx 服务

每个服务通过 Traefik labels 配置路由规则和 TLS 证书。

### traefik.yml

Traefik 静态配置文件，定义：

- API Dashboard 配置
- EntryPoints（web:80, websecure:443）
- Providers（Docker、File）

**注意**: 不再使用 `certificatesResolvers` 自动申请证书，改为使用文件证书。

### dynamic/ 目录

Traefik 动态配置目录，包含：

#### acme-challenge.yml

ACME HTTP-01 挑战转发配置，将 Let's Encrypt 的验证请求转发到 NFX-Vault 服务：

- 匹配所有域名的 `/.well-known/acme-challenge` 路径
- 转发到 `NFX-Vault-Backend-API:8000`
- 高优先级（1000），确保先于其他路由匹配

**重要**: 此配置只有在使用 NFX-Vault 进行证书申请时才需要。

#### certs.yml

TLS 证书文件路径配置，定义每个域名使用的证书文件：

- 每个网站使用独立的证书文件（`cert.crt` 和 `key.key`）
- 证书文件存储在 `${CERTS_DIR}` 目录下的子文件夹中
- 格式：`/certs/websites/{folder_name}/cert.crt` 和 `/certs/websites/{folder_name}/key.key`

#### redirect-to-https.yml

HTTP 到 HTTPS 重定向规则：

- 匹配所有 HTTP 请求（除了 ACME 挑战路径）
- 自动重定向到 HTTPS
- 永久重定向（301）

### nginx.conf

统一的 Nginx 配置文件，所有网站共享此配置：

- **SPA 路由支持**: `try_files` 回退到 `index.html`，解决前端路由刷新 404 问题
- **Gzip 压缩**: 减少传输大小
- **静态资源缓存**: 30 天缓存，提高性能
- **HTML 不缓存**: 确保内容更新及时生效
- **安全响应头**: X-Content-Type-Options、X-Frame-Options、X-XSS-Protection 等

## 添加新网站

### 步骤 1: 在 docker-compose.yml 中添加服务

```yaml
www_newdomain:
  image: nginx:alpine
  container_name: NFX-Edge-WWW-NEWDOMAIN
  restart: always
  volumes:
    - ./www.newdomain.com:/usr/share/nginx/html:ro
    - ${NGINX_CONFIG_FILE}:/etc/nginx/conf.d/default.conf:ro
  labels:
    - traefik.enable=true
    - traefik.http.routers.newdomain.rule=Host(`newdomain.com`) || Host(`www.newdomain.com`)
    - traefik.http.routers.newdomain.entrypoints=websecure
    - traefik.http.routers.newdomain.tls=true
  networks:
    - nfx-edge
  depends_on:
    - reverse-proxy
```

### 步骤 2: 创建网站目录

```bash
mkdir -p www.newdomain.com
# 将网站静态文件放入对应目录
```

### 步骤 3: 准备证书文件

如果使用 NFX-Vault：
- 通过 NFX-Vault Web 界面申请证书，folder_name 设为 `www_newdomain`
- 证书会自动存储在 `${CERTS_DIR}/www_newdomain/`

如果手动管理证书：
```bash
# 创建证书目录
mkdir -p ${CERTS_DIR}/www_newdomain

# 复制证书文件
cp cert.pem ${CERTS_DIR}/www_newdomain/cert.crt
cp key.pem ${CERTS_DIR}/www_newdomain/key.key
```

### 步骤 4: 更新 dynamic/certs.yml

```yaml
tls:
  certificates:
    # 添加新证书配置
    - certFile: /certs/websites/www_newdomain/cert.crt
      keyFile: /certs/websites/www_newdomain/key.key
      stores:
        - default
```

### 步骤 5: 启动服务

```bash
sudo docker compose up -d www_newdomain
```

## Traefik Dashboard 配置

### 访问地址

访问地址：`https://traefik.example.com/dashboard/`（根据你的配置修改域名）

默认使用 BasicAuth 保护，用户名：`admin`

### 生成新密码

```bash
# 使用 htpasswd 生成密码哈希
htpasswd -nb admin your_password

# 或使用在线工具
# https://hostingcanada.org/htpasswd-generator/
```

### 修改密码

1. 生成新的密码哈希
2. 修改 `docker-compose.yml` 中的 `traefik.http.middlewares.dashboard-auth.basicauth.users` 标签
3. 重启服务：`sudo docker compose restart reverse-proxy`

## 证书管理

### 使用 NFX-Vault 申请证书（推荐）

NFX-Vault 是一个基于 Web 的 SSL 证书管理和监控系统，可以自动申请和管理 Let's Encrypt 证书。

**项目地址**：
- GitHub: https://github.com/NebulaForgeX/NFX-Vault

**配置步骤**：

1. **安装和启动 NFX-Vault**
   ```bash
   # 克隆或下载 NFX-Vault 项目
   cd /volume1
   git clone https://github.com/NebulaForgeX/NFX-Vault.git Certs
   # 或使用现有目录
   cd NFX-Vault
   
   # 根据 NFX-Vault 的 README 配置并启动服务
   docker compose up -d
   ```

2. **配置网络连接**
   - 确保 NFX-Vault 的 `backend-api` 服务加入 `nfx-edge` 网络
   - 在 NFX-Vault 的 `docker-compose.yml` 中添加网络配置：
     ```yaml
     services:
       backend-api:
         networks:
           - nfx-edge
     networks:
       nfx-edge:
         external: true
     ```

3. **配置 ACME 挑战转发**
   - NFX-Edge 的 `dynamic/acme-challenge.yml` 已配置将 ACME 挑战请求转发到 `NFX-Vault-Backend-API:8000`
   - 确保此配置文件存在且正确

4. **通过 Web 界面申请证书**
   - 访问 NFX-Vault Web 界面
   - 填写域名、邮箱、folder_name 等信息
   - 提交申请，等待证书生成

5. **证书自动存储**
   - 证书存储在 `${CERTS_DIR}/{folder_name}/`
   - 文件：`cert.crt` 和 `key.key`

6. **更新 certs.yml**
   - 在 `dynamic/certs.yml` 中添加新证书路径
   - 重启 Traefik：`sudo docker compose restart reverse-proxy`

### 手动管理证书

1. **准备证书文件**
   ```bash
   mkdir -p ${CERTS_DIR}/www_example
   cp cert.pem ${CERTS_DIR}/www_example/cert.crt
   cp key.pem ${CERTS_DIR}/www_example/key.key
   ```

2. **更新 certs.yml**
   ```yaml
   tls:
     certificates:
       - certFile: /certs/websites/www_example/cert.crt
         keyFile: /certs/websites/www_example/key.key
         stores:
           - default
   ```

3. **重启 Traefik**
   ```bash
   sudo docker compose restart reverse-proxy
   ```

### 证书查看

```bash
# 查看证书文件
ls -la ${CERTS_DIR}/

# 查看证书内容
openssl x509 -in ${CERTS_DIR}/www_example/cert.crt -text -noout

# 查看证书过期时间
openssl x509 -in ${CERTS_DIR}/www_example/cert.crt -noout -dates
```

## 故障排查

### 网站无法访问

1. **检查容器状态**
   ```bash
   sudo docker compose ps
   ```

2. **检查服务日志**
   ```bash
   sudo docker compose logs www_example
   sudo docker compose logs reverse-proxy
   ```

3. **检查 DNS 解析**
   ```bash
   nslookup www.example.com
   dig www.example.com
   ```

4. **检查端口**
   ```bash
   netstat -tlnp | grep -E ':(80|443)'
   ```

### HTTPS 证书错误

1. **检查证书文件是否存在**
   ```bash
   ls -la ${CERTS_DIR}/www_example/
   ```

2. **检查 certs.yml 配置**
   ```bash
   cat dynamic/certs.yml
   ```

3. **检查 Traefik 日志**
   ```bash
   sudo docker compose logs reverse-proxy | grep -i certificate
   sudo docker compose logs reverse-proxy | grep -i tls
   ```

4. **验证证书文件格式**
   ```bash
   openssl x509 -in ${CERTS_DIR}/www_example/cert.crt -text -noout
   openssl rsa -in ${CERTS_DIR}/www_example/key.key -check
   ```

### Traefik Dashboard 无法访问

1. **检查域名 DNS 解析**
   ```bash
   nslookup traefik.example.com
   ```

2. **检查证书配置**
   ```bash
   cat dynamic/certs.yml | grep traefik
   ```

3. **检查 BasicAuth 配置**
   ```bash
   grep basicauth docker-compose.yml
   ```

### ACME 挑战失败（使用 NFX-Vault 时）

1. **检查 NFX-Vault 服务状态**
   ```bash
   # 进入 NFX-Vault 项目目录
   cd NFX-Vault
   docker compose ps
   ```

2. **检查网络连接**
   - 确保 NFX-Vault 的 `backend-api` 服务已加入 `nfx-edge` 网络
   - 检查网络配置：
     ```bash
     docker network inspect nfx-edge
     ```
   - 检查 NFX-Vault API 是否可达：
     ```bash
     docker exec NFX-Edge-Reverse-Proxy wget -O- http://NFX-Vault-Backend-API:8000/health
     ```

3. **检查 acme-challenge.yml 配置**
   ```bash
   cat dynamic/acme-challenge.yml
   ```
   - 确保配置中的服务地址正确：`http://NFX-Vault-Backend-API:8000`

4. **检查 NFX-Vault 网络配置**
   - 确保 NFX-Vault 的 `docker-compose.yml` 中已配置 `nfx-edge` 网络：
     ```yaml
     services:
       backend-api:
         networks:
           - nfx-edge
     networks:
       nfx-edge:
         external: true
     ```

5. **查看 Traefik 日志**
   ```bash
   sudo docker compose logs reverse-proxy | grep -i acme
   sudo docker compose logs reverse-proxy | grep -i challenge
   ```

6. **查看 NFX-Vault 日志**
   ```bash
   cd NFX-Vault
   docker compose logs backend-api | grep -i acme
   ```

## 相关文档

- [项目结构](STRUCTURE.md) - 了解项目目录结构
- [部署指南](DEPLOYMENT.md) - 部署步骤和最佳实践
- [配置详解](CONFIGURATION.md) - 所有配置选项的详细说明
- [主项目 README](../README.md) - 项目介绍和快速开始

---

## 支持

**开发者**：Lucas Lyu  
**联系方式**：lyulucas2003@gmail.com

