# NFX-Edge 项目结构

本文档详细说明 NFX-Edge 项目的目录结构、服务架构和组织方式。

[English Version](en/STRUCTURE.md)

## 目录结构

```
Websites/
├── docker-compose.yml          # Docker Compose 主配置文件
├── docker-compose.example.yml  # Docker Compose 配置模板
├── .env                        # 环境配置文件（需创建）
├── .gitignore                  # Git 忽略文件
├── traefik.yml                 # Traefik 静态配置文件
├── nginx.conf                  # 统一的 Nginx 配置文件
├── restart.sh                  # 服务重启脚本
├── image.png                   # 项目 Logo
├── dynamic/                    # Traefik 动态配置目录
│   ├── acme-challenge.yml      # ACME HTTP-01 挑战转发配置
│   ├── certs.yml              # TLS 证书文件路径配置
│   └── redirect-to-https.yml  # HTTP → HTTPS 重定向规则
├── GitLab/                     # GitLab 数据目录
│   └── config/                 # GitLab 配置目录
│       ├── gitlab.rb           # GitLab 配置文件（用户自定义，被忽略）
│       ├── gitlab.rb.local.template  # 本地配置模板
│       └── gitlab.rb.template  # 官方配置模板
├── Docs/                       # 文档目录
│   ├── README.md               # 配置文档使用说明
│   ├── STRUCTURE.md            # 项目结构文档（本文档）
│   ├── DEPLOYMENT.md          # 部署指南
│   ├── CONFIGURATION.md       # 配置详解
│   ├── INDEX.md                # 文档索引
│   └── en/                     # 英文文档目录
│       ├── README.md
│       ├── STRUCTURE.md
│       ├── DEPLOYMENT.md
│       ├── CONFIGURATION.md
│       └── INDEX.md
└── www.*.com/                  # 网站静态文件目录（用户配置）
    ├── www.sjgztea.com/
    ├── admin.sjgztea.com/
    ├── www.pqttec.com/
    └── www.lucaslyu.com/
```

## 核心组件

### Docker Compose 服务

NFX-Edge 通过 `docker-compose.yml` 定义以下服务：

#### 1. reverse-proxy (Traefik)

- **容器名**：`NFX-Edge-Reverse-Proxy`
- **镜像**：`traefik:v3.4`
- **端口**：80 (HTTP), 443 (HTTPS)
- **功能**：
  - 反向代理和负载均衡
  - SSL/TLS 终止
  - 路由管理
  - Web Dashboard
- **数据卷**：
  - Docker socket（只读）
  - 证书目录（只读）
  - Traefik 配置文件
  - 动态配置目录

#### 2. 网站服务 (Nginx)

每个网站都有独立的 Nginx 服务：

- **镜像**：`nginx:alpine`
- **容器命名**：`NFX-Edge-WWW-{DOMAIN}` 或 `NFX-Edge-Admin-{DOMAIN}`
- **功能**：
  - 提供静态文件服务
  - SPA 路由支持
  - Gzip 压缩
  - 静态资源缓存
- **数据卷**：
  - 网站静态文件目录（只读）
  - 统一的 Nginx 配置文件（只读）

**当前配置的网站**：
- `www_sjgztea` - SJGZTEA 主站
- `admin_sjgztea` - SJGZTEA 管理后台
- `www_pqttec` - PQTTEC 官网
- `www_lucaslyu` - LucasLyu 个人站

#### 3. GitLab 服务

GitLab 代码托管和 CI/CD 平台：

- **容器名**：`NFX-Edge-GitLab`
- **镜像**：`gitlab/gitlab-ce:latest`
- **端口**：2224 (SSH, 宿主机端口)
- **功能**：
  - Git 代码仓库托管
  - Container Registry（Docker 镜像仓库）
  - CI/CD Pipeline
  - Issue 和 Wiki
- **数据卷**：
  - 配置文件：`${GITLAB_CONFIG_VOLUME}:/etc/gitlab`
  - 日志文件：`${GITLAB_LOGS_VOLUME}:/var/log/gitlab`
  - 数据文件：`${GITLAB_DATA_VOLUME}:/var/opt/gitlab`
- **网络访问**：
  - Web 界面：通过 Traefik 路由到 `${GITLAB_DOMAIN}`
  - Registry：通过 Traefik 路由到 `${GITLAB_REGISTRY_DOMAIN}`
  - SSH：直接通过宿主机端口 `${GITLAB_SSH_PORT}` 访问

#### 4. GitLab Runner 服务

GitLab CI/CD Runner：

- **容器名**：`NFX-Edge-GitLab-Runner`
- **镜像**：`gitlab/gitlab-runner:alpine`
- **功能**：
  - 执行 GitLab CI/CD Pipeline
  - 支持 Docker executor
- **数据卷**：
  - Runner 配置：`${GITLAB_RUNNER_VOLUME}:/etc/gitlab-runner`
  - Docker socket：`/var/run/docker.sock`（用于执行 Docker 任务）

## 网络架构

### Docker 网络

- **网络名称**：`nfx-edge`
- **网络类型**：`bridge`
- **用途**：所有服务在同一网络中，可以通过容器名相互访问

### 服务间通信

- **Traefik → Nginx**：通过 Docker 网络直接访问容器 80 端口
- **Traefik → GitLab**：通过 Docker 网络访问容器 80 端口（Web）和 5050 端口（Registry）
- **Traefik → NFX-Vault**：通过容器名 `NFX-Vault-Backend-API:8000` 访问（如果使用 NFX-Vault）
  - NFX-Vault 项目地址: https://github.com/NebulaForgeX/NFX-Vault
  - 需要确保 NFX-Vault 的 `backend-api` 服务加入 `nfx-edge` 网络
- **GitLab Runner → GitLab**：通过 Docker 网络访问 GitLab 服务

### 外部访问

- **HTTP (80)**：所有 HTTP 请求由 Traefik 接收，自动重定向到 HTTPS
- **HTTPS (443)**：所有 HTTPS 请求由 Traefik 接收，根据域名路由到对应的 Nginx 服务

## 配置文件说明

### docker-compose.yml

Docker Compose 主配置文件，定义：

- 所有服务（Traefik + 各个网站）
- 网络配置
- 数据卷挂载
- Traefik labels（路由规则）

### .env

环境变量配置文件，定义：

- `CERTS_DIR` - 证书存储目录
- `TRAEFIK_CONFIG_FILE` - Traefik 配置文件路径
- `TRAEFIK_DYNAMIC_DIR` - Traefik 动态配置目录
- `NGINX_CONFIG_FILE` - Nginx 配置文件路径
- `GITLAB_SSH_BIND_HOST` - GitLab SSH 绑定地址
- `GITLAB_SSH_PORT` - GitLab SSH 端口
- `GITLAB_TZ` - GitLab 时区
- `GITLAB_CONFIG_VOLUME` - GitLab 配置目录
- `GITLAB_LOGS_VOLUME` - GitLab 日志目录
- `GITLAB_DATA_VOLUME` - GitLab 数据目录
- `GITLAB_DOMAIN` - GitLab Web 域名
- `GITLAB_REGISTRY_DOMAIN` - GitLab Registry 域名
- `GITLAB_RUNNER_VOLUME` - GitLab Runner 配置目录

### traefik.yml

Traefik 静态配置文件，定义：

- API Dashboard 配置
- EntryPoints（web:80, websecure:443）
- Providers（Docker、File）

**注意**：不再使用 `certificatesResolvers` 自动申请证书，改为使用文件证书。

### dynamic/ 目录

Traefik 动态配置目录，包含：

#### acme-challenge.yml

ACME HTTP-01 挑战转发配置：

- 匹配所有域名的 `/.well-known/acme-challenge` 路径
- 转发到 `NFX-Vault-Backend-API:8000`
- 高优先级（1000），确保先于其他路由匹配

**使用场景**：使用 NFX-Vault 进行证书申请时

**NFX-Vault 项目地址**：https://github.com/NebulaForgeX/NFX-Vault

**配置要求**：
- 确保 NFX-Vault 的 `backend-api` 服务加入 `nfx-edge` 网络
- 在 NFX-Vault 的 `docker-compose.yml` 中添加网络配置

#### certs.yml

TLS 证书文件路径配置：

- 定义每个域名使用的证书文件
- 证书文件存储在 `${CERTS_DIR}` 目录下的子文件夹中
- 格式：`/certs/websites/{folder_name}/cert.crt` 和 `/certs/websites/{folder_name}/key.key`

#### redirect-to-https.yml

HTTP 到 HTTPS 重定向规则：

- 匹配所有 HTTP 请求（除了 ACME 挑战路径）
- 自动重定向到 HTTPS
- 永久重定向（301）

### nginx.conf

统一的 Nginx 配置文件，所有网站共享：

- **SPA 路由支持**：`try_files` 回退到 `index.html`
- **Gzip 压缩**：减少传输大小
- **静态资源缓存**：30 天缓存
- **HTML 不缓存**：确保内容更新及时生效
- **安全响应头**：X-Content-Type-Options、X-Frame-Options、X-XSS-Protection 等

### restart.sh

服务重启脚本，功能：

1. 停止 Docker Compose 服务
2. 删除容器和镜像（根据 `.env` 配置）
3. 重新启动服务
4. 显示服务状态

## 数据持久化

### 证书文件

证书文件存储在 `${CERTS_DIR}` 目录下：

```
${CERTS_DIR}/
├── traefik_lucaslyu/
│   ├── cert.crt
│   └── key.key
├── www_sjgztea/
│   ├── cert.crt
│   └── key.key
├── admin_sjgztea/
│   ├── cert.crt
│   └── key.key
└── ...
```

### 网站静态文件

网站静态文件存储在各自的目录中：

```
Websites/
├── www.sjgztea.com/
│   ├── index.html
│   ├── static/
│   └── ...
├── admin.sjgztea.com/
│   ├── index.html
│   └── ...
└── ...
```

**注意**：这些目录通过 volumes 挂载到容器中，修改后立即生效。

### GitLab 数据

GitLab 数据存储在 `${GITLAB_DATA_VOLUME}` 目录下：

```
GitLab/
├── config/                    # GitLab 配置文件
│   ├── gitlab.rb             # 主配置文件（用户自定义，被 .gitignore 忽略）
│   ├── gitlab.rb.local.template  # 配置模板（被 Git 追踪）
│   └── gitlab.rb.template    # 官方配置模板（被 Git 追踪）
├── logs/                      # GitLab 日志文件
├── data/                      # GitLab 数据文件
│   ├── git-data/             # Git 仓库
│   ├── postgresql/           # PostgreSQL 数据库
│   ├── redis/                # Redis 数据
│   ├── uploads/              # 上传的文件
│   └── backups/              # 备份文件
└── runner/                    # GitLab Runner 配置
    └── config.toml           # Runner 配置文件
```

**重要**：
- `config/gitlab.rb` 是用户自定义配置文件，不会被 Git 追踪
- `config/gitlab.rb.local.template` 是配置模板，会被 Git 追踪
- `data/` 目录包含所有重要数据，需要定期备份

## 服务依赖关系

```
reverse-proxy (Traefik)
    ↑
    ├── www_sjgztea (Nginx)
    ├── admin_sjgztea (Nginx)
    ├── www_pqttec (Nginx)
    ├── www_lucaslyu (Nginx)
    └── gitlab (GitLab)
        ↑
        └── gitlab-runner (GitLab Runner)
```

- 所有网站服务都依赖于 `reverse-proxy` 服务
- `gitlab` 服务通过 Traefik 提供 Web 和 Registry 访问
- `gitlab-runner` 服务依赖于 `gitlab` 服务

## 扩展性

### 添加新网站

1. 在 `docker-compose.yml` 中添加新服务定义
2. 创建网站目录并添加静态文件
3. 准备证书文件
4. 更新 `dynamic/certs.yml` 添加新证书路径
5. 启动服务

详细步骤请参考 [配置文档使用指南](README.md)。

### 移除网站

1. 在 `docker-compose.yml` 中删除或注释服务定义
2. 从 `dynamic/certs.yml` 中删除证书配置（可选）
3. 停止并删除服务：`sudo docker compose down <service-name>`

## 文件说明总结

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
| `GitLab/config/gitlab.rb` | GitLab 主配置文件（用户自定义，被 .gitignore 忽略） |
| `GitLab/config/gitlab.rb.local.template` | GitLab 配置模板（被 Git 追踪） |

## 相关文档

- [配置文档使用指南](README.md) - 配置模板使用说明
- [部署指南](DEPLOYMENT.md) - 部署步骤和最佳实践
- [配置详解](CONFIGURATION.md) - 所有配置选项的详细说明
- [主项目 README](../README.md) - 项目介绍和快速开始

---

## 支持

**开发者**：Lucas Lyu  
**联系方式**：lyulucas2003@gmail.com

