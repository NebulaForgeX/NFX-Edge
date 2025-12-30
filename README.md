# NFX-Edge - Docker Compose 多网站集群

基于 Traefik v3.4 和 Docker Compose 的多网站反向代理解决方案，统一管理多个静态网站，提供自动 HTTPS、证书管理和 HTTP 重定向。

<div align="center">
  <img src="image.png" alt="Websites Logo" width="200">
</div>

---

## ✨ 特性

- 🔒 **HTTPS 支持** - 使用文件证书提供 HTTPS 服务
- 🔄 **自动重定向** - HTTP (80) 自动重定向到 HTTPS (443)
- 🌐 **多域名支持** - 轻松管理多个域名和子域名
- 📦 **统一配置** - 所有网站共享统一的 Nginx 配置
- 🚀 **SPA 支持** - 完美支持 React/Vue 等单页应用
- 📊 **Dashboard** - Traefik Web UI 监控和管理
- 🔧 **一键重启** - 提供便捷的重启脚本
- 🔐 **证书管理集成** - 可集成 NFX-Vault 进行证书申请和管理

---

## 📁 项目结构

```
Websites/
├── docker-compose.yml          # Docker Compose 主配置文件
├── docker-compose.example.yml  # Docker Compose 配置模板
├── .env                        # 环境配置文件（需创建）
├── traefik.yml                # Traefik 静态配置文件
├── nginx.conf                 # 统一的 Nginx 配置文件
├── restart.sh                 # 服务重启脚本
├── dynamic/                   # Traefik 动态配置目录
│   ├── acme-challenge.yml     # ACME HTTP-01 挑战转发配置
│   ├── certs.yml              # TLS 证书文件路径配置
│   └── redirect-to-https.yml # HTTP → HTTPS 重定向规则
└── www.example.com/           # 网站静态文件目录（示例）
```

---

## 📄 文件说明

### 核心配置文件

#### `docker-compose.yml`
Docker Compose 主配置文件，定义所有服务：
- **reverse-proxy**: Traefik 反向代理服务
- **www_***: 各个网站的 Nginx 服务
- **admin_***: 管理后台的 Nginx 服务

每个服务通过 Traefik labels 配置路由规则和 TLS 证书。

#### `docker-compose.example.yml`
Docker Compose 配置模板，包含详细的注释说明。新用户可以参考此文件创建自己的 `docker-compose.yml`。

#### `.env`
环境配置文件（需要手动创建），定义：
- `CERTS_DIR`: 证书存储目录路径（如 `/volume1/Certs/Websites`）
- `TRAEFIK_CONFIG_FILE`: Traefik 配置文件路径（如 `/volume1/Websites/traefik.yml`）
- `TRAEFIK_DYNAMIC_DIR`: Traefik 动态配置目录路径（如 `/volume1/Websites/dynamic`）
- `NGINX_CONFIG_FILE`: Nginx 配置文件路径（如 `/volume1/Websites/nginx.conf`）

### Traefik 配置文件

#### `traefik.yml`
Traefik 静态配置文件，定义：
- API Dashboard 配置
- EntryPoints（web:80, websecure:443）
- Providers（Docker、File）
- **注意**: 不再使用 `certificatesResolvers` 自动申请证书，改为使用文件证书

#### `dynamic/acme-challenge.yml`
ACME HTTP-01 挑战转发配置，将 Let's Encrypt 的验证请求转发到 NFX-Vault 服务：
- 匹配所有域名的 `/.well-known/acme-challenge` 路径
- 转发到 `NFX-Vault-Backend-API:8000`（需要 NFX-Vault 服务运行）
- 高优先级（1000），确保先于其他路由匹配

**重要**: 此配置只有在使用 NFX-Vault 进行证书申请时才需要。

#### `dynamic/certs.yml`
TLS 证书文件路径配置，定义每个域名使用的证书文件：
- 每个网站使用独立的证书文件（`cert.crt` 和 `key.key`）
- 证书文件存储在 `${CERTS_DIR}` 目录下的子文件夹中
- 格式：`/certs/websites/{folder_name}/cert.crt` 和 `/certs/websites/{folder_name}/key.key`

#### `dynamic/redirect-to-https.yml`
HTTP 到 HTTPS 重定向规则：
- 匹配所有 HTTP 请求（除了 ACME 挑战路径）
- 自动重定向到 HTTPS
- 永久重定向（301）

### Nginx 配置文件

#### `nginx.conf`
统一的 Nginx 配置文件，所有网站共享此配置：
- **SPA 路由支持**: `try_files` 回退到 `index.html`，解决前端路由刷新 404 问题
- **Gzip 压缩**: 减少传输大小
- **静态资源缓存**: 30 天缓存，提高性能
- **HTML 不缓存**: 确保内容更新及时生效
- **安全响应头**: X-Content-Type-Options、X-Frame-Options、X-XSS-Protection 等

### 工具脚本

#### `restart.sh`
服务重启脚本，功能：
1. 停止 Docker Compose 服务
2. 删除容器和镜像（根据 `.env` 配置）
3. 重新启动服务
4. 显示服务状态

使用方式：
```bash
chmod +x restart.sh
./restart.sh
```

### 网站目录

每个网站都有独立的目录，存放静态文件：
- `www.example.com/` - 示例主站
- `admin.example.com/` - 示例管理后台

**注意**: 这些目录是用户自己配置的，不在版本控制中。

---

## 🔐 证书管理集成

### 使用 NFX-Vault 进行证书申请和管理

**NFX-Vault** 是一个基于 Web 的 SSL 证书管理和监控系统，提供统一的证书申请、检查、导出和管理功能。

#### 项目地址
- GitHub: https://github.com/NebulaForgeX/NFX-Vault
- 本地路径: `/volume1/Certs`

#### 集成说明

1. **启动 NFX-Vault 服务**
   ```bash
   cd /volume1/Certs
   # 根据 NFX-Vault 的 README 启动服务
   docker compose up -d
   ```

2. **确保网络连接**
   - NFX-Vault 的 `backend-api` 服务需要加入 `websites_default` 网络
   - 或者确保两个项目在同一个 Docker 网络中

3. **配置 ACME 挑战转发**
   - `dynamic/acme-challenge.yml` 已配置将 ACME 挑战请求转发到 `NFX-Vault-Backend-API:8000`
   - 确保 NFX-Vault 的 API 服务正常运行

4. **申请证书**
   - 通过 NFX-Vault 的 Web 界面申请证书
   - 证书会存储在 `${CERTS_DIR}` 目录下
   - 更新 `dynamic/certs.yml` 添加新证书路径

5. **证书文件结构**
   ```
   /volume1/Certs/Websites/
   ├── traefik_example/
   │   ├── cert.crt
   │   └── key.key
   ├── www_example/
   │   ├── cert.crt
   │   └── key.key
   └── ...
   ```

#### 不使用 NFX-Vault 的情况

如果不需要自动证书申请功能：
- 可以删除或注释 `dynamic/acme-challenge.yml`
- 手动将证书文件放置到 `${CERTS_DIR}` 目录下
- 在 `dynamic/certs.yml` 中配置证书路径

---

## 🚀 快速开始

### 前置要求

- Docker 和 Docker Compose 已安装
- 域名 DNS 已正确解析到服务器 IP（A 记录）
- 服务器端口 80 和 443 已开放
- （可选）NFX-Vault 服务已启动（用于证书申请）

### 安装步骤

1. **克隆或下载项目**
   ```bash
   cd /volume1/Websites
   ```

2. **创建配置文件**
   ```bash
   # 复制 Docker Compose 配置模板
   cp docker-compose.example.yml docker-compose.yml
   
   # 创建 .env 文件（参考下面的配置示例）
   vim .env
   ```

3. **配置 .env 文件**
   ```bash
   # 证书存储目录
   CERTS_DIR=/volume1/Certs/Websites
   
   # Traefik 配置文件路径
   TRAEFIK_CONFIG_FILE=/volume1/Websites/traefik.yml
   
   # Traefik 动态配置目录
   TRAEFIK_DYNAMIC_DIR=/volume1/Websites/dynamic
   
   # Nginx 配置文件路径
   NGINX_CONFIG_FILE=/volume1/Websites/nginx.conf
   ```

4. **编辑 docker-compose.yml**
   - 修改域名配置
   - 修改容器名称（如需要）
   - 修改 Traefik Dashboard 域名

5. **准备证书文件**（如果已有证书）
   ```bash
   # 创建证书目录
   mkdir -p /volume1/Certs/Websites/www_example
   
   # 复制证书文件
   cp cert.pem /volume1/Certs/Websites/www_example/cert.crt
   cp key.pem /volume1/Certs/Websites/www_example/key.key
   
   # 更新 dynamic/certs.yml 添加证书路径
   ```

6. **创建网站目录并添加静态文件**
   ```bash
   mkdir -p www.example.com
   # 将网站静态文件放入对应目录
   ```

7. **启动服务**
   ```bash
   sudo docker compose up -d
   ```

8. **查看服务状态**
   ```bash
   sudo docker compose ps
   sudo docker compose logs -f
   ```

---

## ⚙️ 配置说明

### 1. Docker Compose 配置

主要配置文件：`docker-compose.yml`

#### reverse-proxy 服务（Traefik）

- **镜像**: `traefik:v3.4`
- **端口**: 80 (HTTP), 443 (HTTPS)
- **功能**: 反向代理、SSL 终止、路由管理
- **证书存储**: 通过 volumes 挂载 `${CERTS_DIR}` 目录
- **动态配置**: 从 `dynamic/` 目录读取路由和证书配置

#### 网站服务（Nginx）

- **镜像**: `nginx:alpine`
- **配置**: 使用统一的 `nginx.conf`
- **静态文件**: 通过 volumes 挂载各自目录
- **TLS**: 通过 Traefik labels 配置，使用文件证书

### 2. 环境配置文件 (.env)

`.env` 文件用于定义路径和配置：

```bash
# 证书存储目录
CERTS_DIR=/volume1/Certs/Websites

# Traefik 配置文件路径
TRAEFIK_CONFIG_FILE=/volume1/Websites/traefik.yml

# Traefik 动态配置目录
TRAEFIK_DYNAMIC_DIR=/volume1/Websites/dynamic

# Nginx 配置文件路径
NGINX_CONFIG_FILE=/volume1/Websites/nginx.conf
```

### 3. Traefik 配置

**traefik.yml** - Traefik 静态配置

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

**注意**: 不再使用 `certificatesResolvers` 自动申请证书，改为使用文件证书。

### 4. Nginx 配置

**nginx.conf** - 统一的 Nginx 配置

特性：
- ✅ SPA 路由支持（`try_files` 回退到 `index.html`）
- ✅ Gzip 压缩
- ✅ 静态资源缓存（30 天）
- ✅ HTML 文件不缓存
- ✅ 安全响应头

---

## 📖 使用指南

### 启动服务

```bash
# 启动所有服务
sudo docker compose up -d

# 启动特定服务
sudo docker compose up -d www_example
```

### 停止服务

```bash
# 停止所有服务
sudo docker compose down

# 停止并删除数据卷
sudo docker compose down -v
```

### 重启服务

使用提供的重启脚本：

```bash
# 使用重启脚本（会清理容器和镜像后重新启动）
./restart.sh

# 或使用 Docker Compose 命令
sudo docker compose restart
sudo docker compose restart www_example
```

### 查看日志

```bash
# 查看所有服务日志
sudo docker compose logs -f

# 查看特定服务日志
sudo docker compose logs -f reverse-proxy
sudo docker compose logs -f www_example

# 查看最近的日志
sudo docker compose logs --tail=100 reverse-proxy
```

### 查看服务状态

```bash
# 查看服务运行状态
sudo docker compose ps

# 查看服务资源使用
sudo docker stats
```

### 更新网站内容

网站内容通过 volumes 挂载，修改后立即生效：

```bash
# 直接修改对应目录的文件
vim www.example.com/index.html

# 文件修改后，Nginx 会自动服务新内容，无需重启容器
```

### 更新 Nginx 配置

```bash
# 1. 修改 nginx.conf
vim nginx.conf

# 2. 重启所有 Nginx 服务（应用新配置）
sudo docker compose restart www_example admin_example
```

### 查看 Traefik Dashboard

访问地址：`https://traefik.example.com/dashboard/`（根据你的配置修改域名）

默认使用 BasicAuth 保护，用户名：`admin`

**生成新密码**：
```bash
# 使用 htpasswd 生成密码哈希
htpasswd -nb admin your_password

# 或使用在线工具
# https://hostingcanada.org/htpasswd-generator/
```

**修改密码**：
1. 生成新的密码哈希
2. 修改 `docker-compose.yml` 中的 `traefik.http.middlewares.dashboard-auth.basicauth.users` 标签
3. 重启服务：`sudo docker compose restart reverse-proxy`

---

## ➕ 添加新网站

### 方法 1: 复制现有服务配置

1. **在 docker-compose.yml 中添加新服务**

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
  depends_on:
    - reverse-proxy
```

2. **创建网站目录并添加文件**

```bash
mkdir -p www.newdomain.com
# 将网站静态文件放入 www.newdomain.com/
```

3. **准备证书文件**

如果使用 NFX-Vault：
- 通过 NFX-Vault Web 界面申请证书，folder_name 设为 `www_newdomain`
- 证书会自动存储在 `/volume1/Certs/Websites/www_newdomain/`

如果手动管理证书：
```bash
# 创建证书目录
mkdir -p /volume1/Certs/Websites/www_newdomain

# 复制证书文件
cp cert.pem /volume1/Certs/Websites/www_newdomain/cert.crt
cp key.pem /volume1/Certs/Websites/www_newdomain/key.key
```

4. **更新 dynamic/certs.yml**

```yaml
tls:
  certificates:
    # 添加新证书配置
    - certFile: /certs/websites/www_newdomain/cert.crt
      keyFile: /certs/websites/www_newdomain/key.key
      stores:
        - default
```

5. **启动服务**

```bash
sudo docker compose up -d www_newdomain
```

### 方法 2: 使用 docker-compose.example.yml 模板

1. 参考 `docker-compose.example.yml` 中的 `www_example` 和 `admin_example` 模板
2. 复制模板并修改配置
3. 按照上述步骤执行

---

## 🔐 SSL 证书管理

### 使用 NFX-Vault 申请证书（推荐）

1. **启动 NFX-Vault 服务**
   ```bash
   cd /volume1/Certs
   docker compose up -d
   ```

2. **通过 Web 界面申请证书**
   - 访问 NFX-Vault Web 界面
   - 填写域名、邮箱、folder_name 等信息
   - 提交申请，等待证书生成

3. **证书自动存储**
   - 证书存储在 `/volume1/Certs/Websites/{folder_name}/`
   - 文件：`cert.crt` 和 `key.key`

4. **更新 certs.yml**
   - 在 `dynamic/certs.yml` 中添加新证书路径
   - 重启 Traefik：`sudo docker compose restart reverse-proxy`

### 手动管理证书

1. **准备证书文件**
   ```bash
   mkdir -p /volume1/Certs/Websites/www_example
   cp cert.pem /volume1/Certs/Websites/www_example/cert.crt
   cp key.pem /volume1/Certs/Websites/www_example/key.key
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
ls -la /volume1/Certs/Websites/

# 查看证书内容
openssl x509 -in /volume1/Certs/Websites/www_example/cert.crt -text -noout

# 查看证书过期时间
openssl x509 -in /volume1/Certs/Websites/www_example/cert.crt -noout -dates
```

---

## 🐛 故障排查

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
   ls -la /volume1/Certs/Websites/www_example/
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
   openssl x509 -in /volume1/Certs/Websites/www_example/cert.crt -text -noout
   openssl rsa -in /volume1/Certs/Websites/www_example/key.key -check
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

### Nginx 配置错误

1. **检查配置语法**
   ```bash
   docker exec NFX-Edge-WWW-EXAMPLE nginx -t
   ```

2. **查看错误日志**
   ```bash
   sudo docker compose logs www_example | grep error
   ```

### ACME 挑战失败（使用 NFX-Vault 时）

1. **检查 NFX-Vault 服务状态**
   ```bash
   cd /volume1/Certs
   docker compose ps
   ```

2. **检查网络连接**
   ```bash
   # 检查 NFX-Vault API 是否可达
   docker exec NFX-Edge-Reverse-Proxy wget -O- http://NFX-Vault-Backend-API:8000/health
   ```

3. **检查 acme-challenge.yml 配置**
   ```bash
   cat dynamic/acme-challenge.yml
   ```

4. **查看 Traefik 日志**
   ```bash
   sudo docker compose logs reverse-proxy | grep -i acme
   sudo docker compose logs reverse-proxy | grep -i challenge
   ```

---

## 🔒 安全建议

- ✅ 使用 HTTPS（已自动配置）
- ✅ 安全响应头（已在 nginx.conf 中配置）
- ✅ BasicAuth 保护 Dashboard（已配置）
- ✅ 只读文件系统挂载（`:ro` 标志）
- ✅ 定期更新 Docker 镜像
- ✅ 定期检查证书状态
- ⚠️ 不要在代码仓库中提交 `.env` 文件（已在 `.gitignore` 中排除）
- ⚠️ 保护好证书文件权限（建议 `chmod 600`）

---

## 📊 性能优化

已实施的优化：

- ✅ **Gzip 压缩** - 减少传输大小
- ✅ **静态资源缓存** - 30 天缓存，减少服务器负载
- ✅ **HTML 不缓存** - 确保内容更新及时生效
- ✅ **只读挂载** - 提高安全性和性能
- ✅ **Alpine 镜像** - 减小镜像体积

建议：

- 静态文件通过 volumes 挂载，修改后立即生效
- 使用 CDN 可以进一步提升性能
- 定期检查证书状态，确保 HTTPS 正常

---

## 📚 相关资源

- [Traefik 官方文档](https://doc.traefik.io/traefik/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [Nginx 官方文档](https://nginx.org/en/docs/)
- [NFX-Vault 项目](https://github.com/NebulaForgeX/NFX-Vault) - 证书管理系统

---

## 📝 文件说明总结

| 文件 | 说明 |
|------|------|
| `docker-compose.yml` | Docker Compose 主配置文件 |
| `docker-compose.example.yml` | Docker Compose 配置模板 |
| `.env` | 环境配置文件（路径配置） |
| `traefik.yml` | Traefik 静态配置文件 |
| `nginx.conf` | 统一的 Nginx 配置文件 |
| `restart.sh` | 服务重启脚本 |
| `dynamic/acme-challenge.yml` | ACME HTTP-01 挑战转发配置（需要 NFX-Vault） |
| `dynamic/certs.yml` | TLS 证书文件路径配置 |
| `dynamic/redirect-to-https.yml` | HTTP → HTTPS 重定向规则 |

---

## 📄 许可证

本项目为内部使用项目，不对外开源。

---

**最后更新**: 2025-12-29  
**维护者**: Lucas Lyu
