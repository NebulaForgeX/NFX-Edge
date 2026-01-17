# Gitea 部署与配置指南

## 重要注意事项

⚠️ **首次启动需要 1-2 分钟**，Gitea 启动速度很快。

⚠️ **修改配置后需要重启容器**（`sudo docker compose restart gitea`）才能生效。

⚠️ **所有 Docker 命令需要使用 `sudo`**（除非用户已加入 docker 组）。

⚠️ **Gitea 配置简单**：
- 配置通过环境变量管理，无需复杂的 reconfigure 过程
- 首次访问会进入安装向导，完成初始设置
- 支持通过 `/etc/gitea/app.ini` 文件进行高级配置

## 部署步骤

### ① 确认 Gitea 容器状态

#### 1️⃣ 检查容器状态

```bash
sudo docker ps | grep Gitea
```

**期望输出**：
```
NFX-Edge-Gitea   gitea/gitea:latest   Up
```

**如果容器正在运行**：
- Gitea 启动很快，通常几秒钟就能访问
- 如果无法访问，检查日志：`sudo docker compose logs gitea`

### ② 首次访问和初始设置

⚠️ **重要**：Gitea **没有默认管理员账户**，首次访问需要进入安装向导创建管理员账户。

1. **访问 Gitea Web 界面**
   - 打开浏览器访问：`https://${GITEA_DOMAIN}`
   - 例如：`https://git.lyulucas.com`
   - 首次访问会自动进入**安装向导**页面

2. **完成安装向导**
   - **数据库类型**：选择 SQLite3（默认，适合小型部署）
   - **站点标题**：设置你的站点名称（例如 `My Git Server`）
   - **仓库根路径**：`/data/git/repositories`（默认，无需修改）
   - **管理员账户设置**（重要）：
     - **用户名**：设置管理员用户名（例如 `admin` 或你的名字）
     - **密码**：设置管理员密码（请记住这个密码）
     - **邮箱**：设置管理员邮箱（用于接收通知）
   - 点击 **Install Gitea** 完成安装

3. **登录**
   - 安装完成后会自动跳转到登录页面
   - 使用刚才创建的管理员账户（用户名和密码）登录
   - 登录后即可开始使用 Gitea

### ③ 配置 SSH（推荐）

#### 1️⃣ 本机生成 SSH key（如果还没有）

```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
```

按提示操作，可以直接回车使用默认路径 `~/.ssh/id_ed25519`。

#### 2️⃣ 复制公钥

```bash
cat ~/.ssh/id_ed25519.pub
```

复制输出的公钥内容。

#### 3️⃣ 在 Gitea Web 中添加 SSH Key

1. 登录 Gitea Web 界面
2. 右上角头像 → **Settings**
3. 左侧菜单 → **SSH / GPG Keys**
4. 点击 **Add Key**
5. 粘贴公钥内容
6. 点击 **Add Key**

#### 4️⃣ 测试 SSH 连接

```bash
ssh -p ${GITEA_SSH_PORT} git@${GITEA_DOMAIN}
```

**示例**（如果端口是 10122）：
```bash
ssh -p 10122 git@git.example.com
```

**正确结果应该是**：
```
Hi there, username! You've successfully authenticated...
```

❌ **如果连不上，检查**：
- 防火墙是否开放 `${GITEA_SSH_PORT}` 端口
- `docker-compose.yml` 中的 `ports: ${GITEA_SSH_PORT}:22` 映射
- `docker-compose.yml` 中的环境变量 `GITEA__server__SSH_PORT` 配置
- DNS 是否正确解析 `${GITEA_DOMAIN}`

### ④ 创建你的第一个仓库

1. 在 Gitea Web 界面点击 **+** → **New Repository**
2. 填写仓库信息：
   - **Repository Name**：例如 `my-project`
   - **Visibility**：选择 `Private` 或 `Public`
3. 点击 **Create Repository**

### ⑤ 本地 clone 验证

```bash
# Clone 项目（注意使用 SSH URL 和端口）
git clone ssh://git@${GITEA_DOMAIN}:${GITEA_SSH_PORT}/用户名/项目名.git
cd 项目名
```

**示例**：
```bash
git clone ssh://git@git.example.com:10122/admin/my-project.git
cd my-project
```

**测试提交**：
```bash
echo "# My Project" > README.md
git add .
git commit -m "init"
git push
```

👉 **如果 push 成功**：✅ Gitea Web + SSH 完全 OK

## 常用命令

### 查看 Gitea 日志

```bash
# 实时查看日志
sudo docker compose logs -f gitea

# 查看最近 100 行
sudo docker compose logs --tail 100 gitea
```

### 重启 Gitea

```bash
# 重启容器
sudo docker compose restart gitea
```

### 备份与恢复

```bash
# 备份 Gitea 数据（直接备份数据目录）
sudo docker compose stop gitea
sudo tar -czf gitea-backup-$(date +%Y%m%d).tar.gz ${GITEA_DATA_VOLUME}
sudo docker compose start gitea

# 恢复备份（需要先停止服务）
sudo docker compose stop gitea
sudo tar -xzf gitea-backup-YYYYMMDD.tar.gz -C /
sudo docker compose start gitea
```

### 进入 Gitea 容器

```bash
sudo docker exec -it NFX-Edge-Gitea sh
```

## 配置管理

### 环境变量配置

Gitea 配置通过 `docker-compose.yml` 中的环境变量管理：

```yaml
environment:
  - GITEA__server__DOMAIN=${GITEA_DOMAIN}
  - GITEA__server__ROOT_URL=https://${GITEA_DOMAIN}
  - GITEA__server__SSH_DOMAIN=${GITEA_DOMAIN}
  - GITEA__server__SSH_PORT=${GITEA_SSH_PORT}
```

### 高级配置（app.ini）

如果需要更详细的配置，可以编辑 `/etc/gitea/app.ini` 文件：

```bash
# 进入容器
sudo docker exec -it NFX-Edge-Gitea sh

# 编辑配置文件
vi /etc/gitea/app.ini
```

**重要配置项**：
- `[server]` - 服务器配置（域名、端口等）
- `[database]` - 数据库配置
- `[repository]` - 仓库配置
- `[mailer]` - 邮件配置

修改后需要重启容器：
```bash
sudo docker compose restart gitea
```

## 故障排查

### Gitea 无法访问

1. **检查容器状态**：`sudo docker ps | grep Gitea`
2. **查看日志**：`sudo docker compose logs gitea`
3. **检查 Traefik 路由**：确保 `reverse-proxy` 服务正在运行
4. **检查域名解析**：`nslookup ${GITEA_DOMAIN}`
5. **检查证书配置**：确认 `dynamic/certs.yml` 中配置了 Gitea 的证书

### 配置不生效

1. **确认已重启容器**：`sudo docker compose restart gitea`
2. **检查环境变量配置**：确认 `docker-compose.yml` 中的环境变量配置正确
3. **检查配置文件路径**：确认 `${GITEA_CONFIG_VOLUME}` 正确挂载
4. **查看配置**：`sudo docker exec -it NFX-Edge-Gitea cat /etc/gitea/app.ini`

### SSH 连接失败

1. **检查端口映射**：
   ```bash
   sudo docker port NFX-Edge-Gitea
   ```
   应该看到 `${GITEA_SSH_PORT}:22` 的映射

2. **检查防火墙**：
   ```bash
   # Ubuntu/Debian
   sudo ufw status
   sudo ufw allow ${GITEA_SSH_PORT}/tcp
   
   # CentOS/RHEL
   sudo firewall-cmd --list-ports
   sudo firewall-cmd --add-port=${GITEA_SSH_PORT}/tcp --permanent
   sudo firewall-cmd --reload
   ```

3. **检查配置**：
   - 检查 `docker-compose.yml` 中的 `GITEA__server__SSH_PORT` 环境变量
   - 或检查容器内的配置：
   ```bash
   sudo docker exec -it NFX-Edge-Gitea cat /etc/gitea/app.ini | grep SSH
   ```

4. **测试端口连通性**：
   ```bash
   telnet ${GITEA_DOMAIN} ${GITEA_SSH_PORT}
   # 或
   nc -zv ${GITEA_DOMAIN} ${GITEA_SSH_PORT}
   ```

### 数据库问题

如果使用 SQLite（默认）：
- 数据库文件位于：`${GITEA_DATA_VOLUME}/gitea/gitea.db`
- 定期备份此文件即可

如果需要切换到 PostgreSQL 或 MySQL：
1. 修改 `docker-compose.yml` 中的数据库环境变量
2. 添加数据库服务（postgres 或 mysql）
3. 重启 Gitea 容器

## 相关文档

- [配置详解](CONFIGURATION.md#gitea-配置) - Gitea 详细配置说明
- [部署指南](DEPLOYMENT.md#gitea-维护操作) - Gitea 维护操作
- [项目结构](STRUCTURE.md#gitea-服务) - Gitea 服务架构说明
- [Gitea 官方文档](https://docs.gitea.com/) - Gitea 官方文档
