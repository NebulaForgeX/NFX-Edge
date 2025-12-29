# Websites - Docker Compose 多网站集群

基于 Traefik v3.4 和 Docker Compose 的多网站反向代理解决方案，统一管理多个静态网站，提供自动 HTTPS、证书管理和 HTTP 重定向。

---

## ✨ 特性

- 🔒 **自动 HTTPS** - 使用 Let's Encrypt 自动申请和续期 SSL 证书
- 🔄 **自动重定向** - HTTP (80) 自动重定向到 HTTPS (443)
- 🌐 **多域名支持** - 轻松管理多个域名和子域名
- 📦 **统一配置** - 所有网站共享统一的 Nginx 配置
- 🚀 **SPA 支持** - 完美支持 React/Vue 等单页应用
- 📊 **Dashboard** - Traefik Web UI 监控和管理
- ⚙️ **配置分离** - 使用 `.env` 文件管理容器和镜像列表
- 🔧 **一键重启** - 提供便捷的重启脚本

---

## 📁 项目结构

```
Websites/
├── docker-compose.yml          # Docker Compose 配置文件
├── docker-compose.example.yml  # Docker Compose 配置模板
├── .env                        # 环境配置文件（需创建）
├── .env.example               # 环境配置模板
├── traefik.yml                # Traefik 静态配置文件
├── nginx.conf                 # 统一的 Nginx 配置
├── restart.sh                 # 服务重启脚本
├── dynamic/                   # Traefik 动态配置目录
│   └── redirect-to-https.yml  # HTTP → HTTPS 重定向规则
├── www.sjgztea.com/           # 网站静态文件目录
├── admin.sjgztea.com/         # 管理后台静态文件目录
├── www.pqttec.com/            # 网站静态文件目录
└── www.lucaslyu.com/          # 网站静态文件目录
```

---

## 🚀 快速开始

### 前置要求

- Docker 和 Docker Compose 已安装
- 域名 DNS 已正确解析到服务器 IP（A 记录）
- 服务器端口 80 和 443 已开放
- 服务器可以访问 Let's Encrypt 服务器

### 安装步骤

1. **克隆或下载项目**
   ```bash
   cd /volume1/Websites
   ```

2. **创建配置文件**
   ```bash
   # 复制 Docker Compose 配置模板
   cp docker-compose.example.yml docker-compose.yml
   
   # 复制环境配置模板
   cp .env.example .env
   ```

3. **编辑配置文件**
   ```bash
   # 编辑 docker-compose.yml，修改域名、容器名等配置
   vim docker-compose.yml
   
   # 编辑 .env 文件，设置容器和镜像列表
   vim .env
   ```

4. **创建网站目录并添加静态文件**
   ```bash
   mkdir -p www.example.com
   # 将网站静态文件放入对应目录
   ```

5. **启动服务**
   ```bash
   sudo docker compose up -d
   ```

6. **查看服务状态**
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
- **证书存储**: `/volume1/Certs/Websites/acme.json`

#### 网站服务（Nginx）

- **镜像**: `nginx:alpine`
- **配置**: 使用统一的 `nginx.conf`
- **静态文件**: 通过 volumes 挂载各自目录

### 2. 环境配置文件 (.env)

`.env` 文件用于管理容器和镜像列表，便于维护：

```bash
# 容器名称列表（使用空格分隔）
CONTAINERS="Websites-Reverse-Proxy Websites-WWW-SJGZTEA Websites-Admin-SJGZTEA"

# 镜像名称列表（使用空格分隔）
IMAGES="traefik:v3.4 nginx:alpine"
```

**使用 `.env` 的好处**：
- ✅ 无需修改脚本代码
- ✅ 添加/删除容器只需编辑配置文件
- ✅ 版本控制更清晰（使用 `.env.example`）

### 3. Traefik 配置

**traefik.yml** - Traefik 静态配置

```yaml
certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@example.com  # 修改为你的邮箱
      storage: /certs/acme.json
      httpChallenge:
        entryPoint: web
```

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

访问地址：`https://traefik.example.com/dashboard/`

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
  container_name: Websites-WWW-NEWDOMAIN
  restart: always
  volumes:
    - ./www.newdomain.com:/usr/share/nginx/html:ro
    - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
  labels:
    - traefik.enable=true
    - traefik.http.routers.newdomain.rule=Host(`newdomain.com`) || Host(`www.newdomain.com`)
    - traefik.http.routers.newdomain.entrypoints=websecure
    - traefik.http.routers.newdomain.tls.certresolver=letsencrypt
  depends_on:
    - reverse-proxy
```

2. **创建网站目录并添加文件**

```bash
mkdir -p www.newdomain.com
# 将网站静态文件放入 www.newdomain.com/
```

3. **更新 .env 文件**

```bash
# 在 CONTAINERS 中添加新容器名
CONTAINERS="... Websites-WWW-NEWDOMAIN"
```

4. **启动服务**

```bash
sudo docker compose up -d www_newdomain
```

### 方法 2: 使用 docker-compose.example.yml 模板

1. 参考 `docker-compose.example.yml` 中的 `www_example` 和 `admin_example` 模板
2. 复制模板并修改配置
3. 按照上述步骤执行

---

## 🔐 SSL 证书管理

### 证书自动申请

- ✅ Traefik 首次检测到新域名时自动申请证书
- ✅ 使用 HTTP-01 挑战验证域名所有权
- ✅ 证书存储在 `/volume1/Certs/Websites/acme.json`
- ✅ 证书到期前自动续期

### 证书查看

```bash
# 查看证书文件
cat /volume1/Certs/Websites/acme.json

# 查看 Traefik 日志中的证书信息
sudo docker compose logs reverse-proxy | grep -i certificate
sudo docker compose logs reverse-proxy | grep -i acme
```

### 证书配置

证书配置在 `traefik.yml` 中：

```yaml
certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@example.com  # ⚠️ 修改为你的邮箱
      storage: /certs/acme.json
      httpChallenge:
        entryPoint: web
```

### 证书合并

Traefik 会自动将同一主域名下的所有子域名合并到一个证书：

- `example.com`, `www.example.com`, `admin.example.com` → **1 个证书**

这样可以减少证书数量，提高效率。

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

1. **检查证书申请状态**
   ```bash
   sudo docker compose logs reverse-proxy | grep -i certificate
   sudo docker compose logs reverse-proxy | grep -i acme
   ```

2. **检查网络连接**
   ```bash
   curl -I https://acme-v02.api.letsencrypt.org/directory
   ```

3. **检查证书文件**
   ```bash
   ls -la /volume1/Certs/Websites/acme.json
   cat /volume1/Certs/Websites/acme.json
   ```

4. **重新申请证书**（谨慎操作）
   ```bash
   # 删除证书文件（谨慎）
   # rm /volume1/Certs/Websites/acme.json
   # 重启 Traefik
   sudo docker compose restart reverse-proxy
   ```

### Traefik Dashboard 无法访问

1. **检查域名 DNS 解析**
   ```bash
   nslookup traefik.example.com
   ```

2. **检查证书**
   ```bash
   sudo docker compose logs reverse-proxy | grep traefik.example.com
   ```

3. **检查 BasicAuth 配置**
   ```bash
   grep basicauth docker-compose.yml
   ```

### Nginx 配置错误

1. **检查配置语法**
   ```bash
   docker exec Websites-WWW-EXAMPLE nginx -t
   ```

2. **查看错误日志**
   ```bash
   sudo docker compose logs www_example | grep error
   ```

### 证书申请失败

可能原因：
- Let's Encrypt 速率限制（每个域名每周 50 个证书）
- 端口 80 未开放
- DNS 解析不正确
- 网络无法访问 Let's Encrypt 服务器

查看详细日志：
```bash
sudo docker compose logs reverse-proxy | grep -i error
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
- ⚠️ 保护好 `/volume1/Certs/Websites/acme.json` 文件权限

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
- [Let's Encrypt 文档](https://letsencrypt.org/docs/)

---

## 📝 文件说明

| 文件 | 说明 |
|------|------|
| `docker-compose.yml` | Docker Compose 主配置文件 |
| `docker-compose.example.yml` | Docker Compose 配置模板 |
| `.env` | 环境配置文件（容器和镜像列表） |
| `.env.example` | 环境配置模板 |
| `traefik.yml` | Traefik 静态配置文件 |
| `nginx.conf` | 统一的 Nginx 配置文件 |
| `restart.sh` | 服务重启脚本 |
| `dynamic/redirect-to-https.yml` | HTTP → HTTPS 重定向规则 |

---

## 📄 许可证

本项目为内部使用项目，不对外开源。

---

**最后更新**: 2024-12-19  
**维护者**: Lucas Lyu
