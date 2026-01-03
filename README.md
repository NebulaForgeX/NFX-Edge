# NFX-Edge - Docker Compose 多网站集群

基于 Traefik v3.4 和 Docker Compose 的多网站反向代理解决方案，统一管理多个静态网站，提供自动 HTTPS、证书管理和 HTTP 重定向。

<div align="center">
  <img src="image.png" alt="NFX-Edge Logo" width="200">
  
  [English Documentation](Docs/en/README.md) | [配置文档](Docs/README.md) | [部署指南](Docs/DEPLOYMENT.md) | [项目结构](Docs/STRUCTURE.md)
</div>

---

## ✨ 核心特性

### 🔒 HTTPS 支持
- 使用文件证书提供 HTTPS 服务
- 支持多域名和子域名
- 自动 HTTP 到 HTTPS 重定向

### 🌐 多网站管理
- 统一管理多个静态网站
- 每个网站独立配置和证书
- 支持主站和管理后台分离

### 🚀 SPA 支持
- 完美支持 React/Vue 等单页应用
- 自动路由回退到 `index.html`
- 解决前端路由刷新 404 问题

### 📊 管理界面
- Traefik Web UI Dashboard
- 实时监控路由和证书状态
- BasicAuth 保护

### 🔧 便捷工具
- 一键重启脚本
- 自动配置加载
- 统一 Nginx 配置

### 🔐 证书管理集成
- 可集成 [NFX-Vault](https://github.com/NebulaForgeX/NFX-Vault) 进行自动证书申请和管理
- 支持手动证书管理
- 自动证书文件加载
- ACME HTTP-01 挑战自动转发

---

## 📁 项目结构

```
Websites/
├── docker-compose.yml          # Docker Compose 主配置文件
├── docker-compose.example.yml   # Docker Compose 配置模板
├── .env                        # 环境配置文件（需创建）
├── traefik.yml                 # Traefik 静态配置文件
├── nginx.conf                  # 统一的 Nginx 配置文件
├── restart.sh                  # 服务重启脚本
├── dynamic/                    # Traefik 动态配置目录
│   ├── acme-challenge.yml      # ACME HTTP-01 挑战转发配置
│   ├── certs.yml               # TLS 证书文件路径配置
│   └── redirect-to-https.yml  # HTTP → HTTPS 重定向规则
├── Docs/                       # 文档目录
│   ├── README.md               # 配置文档使用说明
│   ├── STRUCTURE.md            # 项目结构文档
│   ├── DEPLOYMENT.md           # 部署指南
│   ├── CONFIGURATION.md        # 配置详解
│   ├── INDEX.md                # 文档索引
│   └── en/                     # 英文文档目录
└── www.*.com/                  # 网站静态文件目录
```

---

## 🚀 快速开始

### 前置要求

- Docker 和 Docker Compose 已安装
- 域名 DNS 已正确解析到服务器 IP（A 记录）
- 服务器端口 80 和 443 已开放
- （可选）[NFX-Vault](https://github.com/NebulaForgeX/NFX-Vault) 服务已安装和配置（用于自动证书申请）

### 安装步骤

1. **进入项目目录**
   ```bash
   cd /volume1/Websites
   ```

2. **创建配置文件**
   ```bash
   # 复制 Docker Compose 配置模板
   cp docker-compose.example.yml docker-compose.yml
   
   # 创建 .env 文件
   cat > .env << EOF
   CERTS_DIR=/path/to/certs/websites
   TRAEFIK_CONFIG_FILE=/volume1/Websites/traefik.yml
   TRAEFIK_DYNAMIC_DIR=/volume1/Websites/dynamic
   NGINX_CONFIG_FILE=/volume1/Websites/nginx.conf
   EOF
   ```

3. **编辑 docker-compose.yml**
   - 修改域名配置
   - 修改容器名称（如需要）
   - 修改 Traefik Dashboard 域名

4. **准备证书文件**（如果已有证书）
   ```bash
   # 创建证书目录
   mkdir -p ${CERTS_DIR}/www_example
   
   # 复制证书文件
   cp cert.pem ${CERTS_DIR}/www_example/cert.crt
   cp key.pem ${CERTS_DIR}/www_example/key.key
   
   # 更新 dynamic/certs.yml 添加证书路径
   ```

5. **创建网站目录并添加静态文件**
   ```bash
   mkdir -p www.example.com
   # 将网站静态文件放入对应目录
   ```

6. **启动服务**
   ```bash
   sudo docker compose up -d
   ```

7. **查看服务状态**
   ```bash
   sudo docker compose ps
   sudo docker compose logs -f
   ```

---

## 📖 文档导航

- **[配置文档使用指南](Docs/README.md)** - 配置模板使用说明
- **[项目结构](Docs/STRUCTURE.md)** - 详细的目录结构和服务说明
- **[部署指南](Docs/DEPLOYMENT.md)** - 部署步骤和最佳实践
- **[配置详解](Docs/CONFIGURATION.md)** - 所有配置选项的详细说明
- **[文档索引](Docs/INDEX.md)** - 完整文档导航

---

## 🔐 证书管理

NFX-Edge 支持两种证书管理方式：

1. **使用 NFX-Vault（推荐）** - 自动申请和管理 Let's Encrypt 证书
2. **手动管理证书** - 手动上传和管理证书文件

### 使用 NFX-Vault（推荐）

NFX-Vault 是一个基于 Web 的 SSL 证书管理和监控系统，提供统一的证书申请、检查、导出和管理功能。

**项目地址**：https://github.com/NebulaForgeX/NFX-Vault

**集成步骤**：

1. **安装和启动 NFX-Vault 服务**
   ```bash
   # 克隆 NFX-Vault 项目
   git clone https://github.com/NebulaForgeX/NFX-Vault.git
   cd NFX-Vault
   
   # 根据 NFX-Vault 的 README 配置并启动服务
   docker compose up -d
   ```

2. **配置网络连接**
   - 确保 NFX-Vault 的 `backend-api` 服务加入 `nfx-edge` 网络
   - 或确保两个项目在同一个 Docker 网络中
   - NFX-Edge 的 `dynamic/acme-challenge.yml` 已配置将 ACME 挑战请求转发到 `NFX-Vault-Backend-API:8000`

3. **通过 Web 界面申请证书**
   - 访问 NFX-Vault Web 界面
   - 填写域名、邮箱、folder_name 等信息
   - 提交申请，等待证书生成

4. **证书自动存储**
   - 证书存储在 `${CERTS_DIR}/{folder_name}/` 目录下
   - 文件：`cert.crt` 和 `key.key`

5. **更新 certs.yml**
   - 在 `dynamic/certs.yml` 中添加新证书路径
   - 重启 Traefik：`sudo docker compose restart reverse-proxy`

**配置 NFX-Vault 网络连接**：

为了确保 NFX-Vault 和 NFX-Edge 能够正常通信，需要在 NFX-Vault 的 `docker-compose.yml` 中添加网络配置：

```yaml
services:
  backend-api:
    networks:
      - nfx-edge  # 添加 nfx-edge 网络
      # ... 其他网络配置

networks:
  nfx-edge:
    external: true  # 使用外部网络
  # ... 其他网络配置
```

然后重启 NFX-Vault 服务：

```bash
cd NFX-Vault
docker compose down
docker compose up -d
```

**验证连接**：

```bash
# 检查 NFX-Vault API 是否可达
docker exec NFX-Edge-Reverse-Proxy wget -O- http://NFX-Vault-Backend-API:8000/health
```

详细说明请参考 [配置文档](Docs/README.md)。

### 手动管理证书

1. 将证书文件放置到 `${CERTS_DIR}/{folder_name}/` 目录
2. 文件命名：`cert.crt` 和 `key.key`
3. 在 `dynamic/certs.yml` 中配置证书路径

---

## ➕ 添加新网站

### 快速添加

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
     networks:
       - nfx-edge
     depends_on:
       - reverse-proxy
   ```

2. **创建网站目录**
   ```bash
   mkdir -p www.newdomain.com
   # 将网站静态文件放入目录
   ```

3. **准备证书文件**
   - 使用 NFX-Vault 申请证书，folder_name 设为 `www_newdomain`
   - 或手动复制证书文件到 `${CERTS_DIR}/www_newdomain/`

4. **更新 dynamic/certs.yml**
   ```yaml
   tls:
     certificates:
       - certFile: /certs/websites/www_newdomain/cert.crt
         keyFile: /certs/websites/www_newdomain/key.key
         stores:
           - default
   ```

5. **启动服务**
   ```bash
   sudo docker compose up -d www_newdomain
   ```

详细步骤请参考 [部署指南](Docs/DEPLOYMENT.md)。

---

## 🛠️ 常用操作

### 启动服务

```bash
sudo docker compose up -d
```

### 停止服务

```bash
sudo docker compose down
```

### 重启服务

```bash
# 使用重启脚本（推荐）
./restart.sh

# 或使用 Docker Compose 命令
sudo docker compose restart
```

### 查看日志

```bash
# 查看所有服务日志
sudo docker compose logs -f

# 查看特定服务日志
sudo docker compose logs -f reverse-proxy
sudo docker compose logs -f www_example
```

### 查看服务状态

```bash
sudo docker compose ps
```

### 更新网站内容

网站内容通过 volumes 挂载，修改后立即生效，无需重启容器。

---

## 🔒 安全建议

- ✅ 使用 HTTPS（已自动配置）
- ✅ 安全响应头（已在 nginx.conf 中配置）
- ✅ BasicAuth 保护 Dashboard（已配置）
- ✅ 只读文件系统挂载（`:ro` 标志）
- ✅ 定期更新 Docker 镜像
- ✅ 定期检查证书状态
- ⚠️ 不要在代码仓库中提交 `.env` 文件
- ⚠️ 保护好证书文件权限（建议 `chmod 600`）

---

## 📊 性能优化

已实施的优化：

- ✅ **Gzip 压缩** - 减少传输大小
- ✅ **静态资源缓存** - 30 天缓存，减少服务器负载
- ✅ **HTML 不缓存** - 确保内容更新及时生效
- ✅ **只读挂载** - 提高安全性和性能
- ✅ **Alpine 镜像** - 减小镜像体积

---

## 📚 相关资源

- [Traefik 官方文档](https://doc.traefik.io/traefik/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [Nginx 官方文档](https://nginx.org/en/docs/)
- [NFX-Vault 项目](https://github.com/NebulaForgeX/NFX-Vault) - 证书管理系统

---

## 支持

如果您在使用 NFX-Edge 时遇到问题或有建议，欢迎通过以下方式联系：

- 发送邮件：lyulucas2003@gmail.com
- 提交 Issue（如果项目托管在代码仓库中）

**开发者**：Lucas Lyu  
**联系方式**：lyulucas2003@gmail.com

---

**最后更新**: 2025-01-XX  
**维护者**: Lucas Lyu
