# NFX-Edge 部署指南

本文档提供 NFX-Edge 在不同环境下的部署说明。

[English Version](en/DEPLOYMENT.md)

## 前置要求

### 系统要求

- **操作系统**：Linux（推荐 Ubuntu 20.04+ 或 Debian 11+）、macOS、Windows（WSL2）
- **Docker**：版本 20.10 或更高
- **Docker Compose**：版本 2.0 或更高
- **磁盘空间**：至少 1GB 可用空间（用于 Docker 镜像和网站文件）
- **内存**：建议至少 2GB RAM

### 软件安装

#### 安装 Docker

**Ubuntu/Debian**：
```bash
# 更新包索引
sudo apt-get update

# 安装必要的依赖
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# 添加 Docker 官方 GPG 密钥
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 设置 Docker 仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

**macOS**：
```bash
# 使用 Homebrew
brew install --cask docker
```

**Windows**：
- 下载并安装 [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)

#### 验证安装

```bash
docker --version
docker compose version
```

## 快速部署

### 1. 准备项目目录

```bash
cd /volume1/Websites
```

### 2. 创建配置文件

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

### 3. 编辑 docker-compose.yml

根据实际需求修改：

- 修改域名配置
- 修改容器名称（如需要）
- 修改 Traefik Dashboard 域名
- 添加或删除网站服务

### 4. 准备证书文件

如果已有证书：

```bash
# 创建证书目录
   mkdir -p ${CERTS_DIR}/www_example
   
   # 复制证书文件
   cp cert.pem ${CERTS_DIR}/www_example/cert.crt
   cp key.pem ${CERTS_DIR}/www_example/key.key

# 更新 dynamic/certs.yml 添加证书路径
```

如果使用 NFX-Vault：

```bash
# 克隆 NFX-Vault 项目
git clone https://github.com/NebulaForgeX/NFX-Vault.git
cd NFX-Vault

# 根据 NFX-Vault 的 README 配置并启动服务
docker compose up -d

# 配置网络连接（确保 NFX-Vault 的 backend-api 服务加入 nfx-edge 网络）
# 在 NFX-Vault 的 docker-compose.yml 中添加：
# networks:
#   nfx-edge:
#     external: true

# 通过 Web 界面申请证书
# 证书会自动存储在配置的证书目录下（如 ${CERTS_DIR}/{folder_name}/）
```

### 5. 创建网站目录并添加静态文件

```bash
mkdir -p www.example.com
# 将网站静态文件放入对应目录
```

### 6. 启动服务

```bash
sudo docker compose up -d
```

### 7. 验证部署

```bash
# 检查所有容器是否运行
sudo docker compose ps

# 应该看到所有服务状态为 "Up"
```

访问各个网站验证服务是否正常：

- 主站：`https://www.example.com`
- 管理后台：`https://admin.example.com`
- Traefik Dashboard：`https://traefik.example.com/dashboard/`

## 生产环境部署

### 安全配置

1. **更改默认密码**
   - 修改 Traefik Dashboard 的 BasicAuth 密码
   - 使用强密码生成器生成随机密码

2. **网络安全**
   - 仅在内网或受信任的网络中开放端口
   - 使用防火墙限制访问来源
   - 考虑使用 VPN 进行远程访问

3. **证书管理**
   - 定期检查证书状态
   - 配置证书自动续期（如果使用 NFX-Vault）
   - NFX-Vault 项目地址: https://github.com/NebulaForgeX/NFX-Vault
   - 备份证书文件

### 性能优化

1. **资源限制**
   在 `docker-compose.yml` 中为每个服务添加资源限制：

```yaml
services:
  reverse-proxy:
    # ... 其他配置 ...
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

2. **日志管理**
   配置日志轮转以防止磁盘空间耗尽：

```yaml
services:
  reverse-proxy:
    # ... 其他配置 ...
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

3. **静态资源优化**
   - 使用 CDN 加速静态资源
   - 启用 Gzip 压缩（已在 nginx.conf 中配置）
   - 配置静态资源缓存（已在 nginx.conf 中配置）

## 维护操作

### 停止服务

```bash
# 进入项目目录
cd /volume1/Websites

# 停止所有服务（保留数据）
sudo docker compose down

# 停止并删除数据卷
sudo docker compose down -v
```

### 重启服务

```bash
# 使用重启脚本（推荐）
./restart.sh

# 或使用 Docker Compose 命令
sudo docker compose restart

# 重启特定服务
sudo docker compose restart reverse-proxy
sudo docker compose restart www_example
```

### 更新服务

```bash
# 拉取最新镜像
sudo docker compose pull

# 重新创建并启动容器
sudo docker compose up -d
```

### 查看日志

```bash
# 查看所有服务日志
sudo docker compose logs -f

# 查看特定服务日志
sudo docker compose logs -f reverse-proxy
sudo docker compose logs -f www_example

# 查看最近 100 行日志
sudo docker compose logs --tail 100 reverse-proxy

# 查看带时间戳的日志
sudo docker compose logs -f -t reverse-proxy
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

### 更新证书

```bash
# 1. 替换证书文件
   cp new_cert.pem ${CERTS_DIR}/www_example/cert.crt
   cp new_key.pem ${CERTS_DIR}/www_example/key.key

# 2. 重启 Traefik（重新加载证书）
sudo docker compose restart reverse-proxy
```

## 故障排查

### 容器无法启动

1. **检查日志**：
   ```bash
   sudo docker compose logs <service-name>
   ```

2. **检查端口冲突**：
   ```bash
   netstat -tulpn | grep -E ':(80|443)'
   ```

3. **检查磁盘空间**：
   ```bash
   df -h
   ```

### 服务无法连接

1. **检查网络**：
   ```bash
   docker network inspect nfx-edge
   ```

2. **检查容器状态**：
   ```bash
   sudo docker compose ps
   ```

3. **测试连接**：
   ```bash
   # 测试 Traefik 是否可达
   curl -I http://localhost
   ```

### 网站无法访问

1. **检查 DNS 解析**：
   ```bash
   nslookup www.example.com
   dig www.example.com
   ```

2. **检查证书配置**：
   ```bash
   cat dynamic/certs.yml
   ls -la ${CERTS_DIR}/www_example/
   ```

3. **检查 Traefik 路由**：
   - 访问 Traefik Dashboard
   - 查看路由配置是否正确

### HTTPS 证书错误

1. **检查证书文件**：
   ```bash
   ls -la ${CERTS_DIR}/www_example/
   openssl x509 -in ${CERTS_DIR}/www_example/cert.crt -text -noout
   ```

2. **检查 certs.yml 配置**：
   ```bash
   cat dynamic/certs.yml
   ```

3. **检查 Traefik 日志**：
   ```bash
   sudo docker compose logs reverse-proxy | grep -i certificate
   sudo docker compose logs reverse-proxy | grep -i tls
   ```

### 性能问题

1. **检查资源使用**：
   ```bash
   docker stats
   ```

2. **检查日志中的错误信息**
3. **考虑增加资源限制或优化配置**

## 卸载

```bash
# 进入项目目录
cd /volume1/Websites

# 停止并删除所有容器和网络（保留数据）
sudo docker compose down

# 删除所有数据（谨慎操作！）
# 请确保已备份重要数据
   sudo rm -rf ${CERTS_DIR}/*
sudo rm -rf www.*.com/

# 删除镜像（可选）
sudo docker compose down --rmi all

# 删除网络（如果存在）
docker network rm nfx-edge
```

---

## 支持

**开发者**：Lucas Lyu  
**联系方式**：lyulucas2003@gmail.com

