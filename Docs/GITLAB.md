# GitLab 部署与配置指南

## 重要注意事项

⚠️ **首次启动需要 5-15 分钟**，请耐心等待。

⚠️ **修改 `gitlab.rb` 后必须执行 `gitlab-ctl reconfigure`** 才能生效。

⚠️ **初始 root 密码文件会在 24 小时后自动删除**，请及时保存。

⚠️ **所有 Docker 命令需要使用 `sudo`**（除非用户已加入 docker 组）。

## 部署步骤

### ① 确认 GitLab 真正"起来了"

#### 1️⃣ 检查容器状态

```bash
sudo docker ps | grep GitLab
```

**期望输出**：
```
NFX-Edge-GitLab   gitlab/gitlab-ce   Up (healthy)
```

**如果看到 `Up (health: starting)`**：
- 正常，首次启动需要 5-15 分钟
- 继续等待，直到显示 `Up (healthy)`

#### 2️⃣ 检查 GitLab 内部服务状态（重要）

```bash
sudo docker exec -it NFX-Edge-GitLab gitlab-ctl status
```

**必须看到这些服务都是 `run:` 状态**：
- `nginx` - Web 服务器
- `puma` - GitLab Rails 应用服务器
- `sidekiq` - 后台任务处理器
- `redis` - 缓存和会话存储
- `postgresql` - 数据库
- `gitaly` - Git 仓库服务
- `gitlab-kas` - Kubernetes Agent Server

**如果还有服务显示 `down:` 或 `starting:`**：
- 继续等待，不要执行后续步骤
- 可以查看日志：`sudo docker compose logs -f gitlab`

### ② 应用 gitlab.rb 配置（第一次必须执行）

即使你已经写好了 `GitLab/config/gitlab.rb`，GitLab 默认不会自动读取。

**必须手动执行**：

```bash
sudo docker exec -it NFX-Edge-GitLab gitlab-ctl reconfigure
```

**这一步会**：
- 读取 `/etc/gitlab/gitlab.rb`
- 生成 nginx / registry / ssh 配置
- 重启内部服务

⚠️ **第一次执行会比较慢（5-10 分钟），耐心等待。**

**后续修改配置后**：
- 每次修改 `gitlab.rb` 后都需要执行 `gitlab-ctl reconfigure`
- 或者重启容器：`sudo docker compose restart gitlab`

### ③ 获取 root 初始密码（只做一次）

```bash
sudo docker exec -it NFX-Edge-GitLab cat /etc/gitlab/initial_root_password
```

**登录信息**：
- **用户名**：`root`
- **密码**：输出中的 `Password:` 后面的字符串

**重要**：
- 登录后**立即修改密码**（GitLab 会提示）
- 这个文件会在 24 小时后自动删除
- 如果错过，需要手动重置密码

### ④ 设置 SSH（这是你接下来最常用的）

#### 1️⃣ 本机生成 SSH key（如果还没有）

```bash
ssh-keygen -t ed25519 -C "lucas@gitlab"
```

按提示操作，可以直接回车使用默认路径 `~/.ssh/id_ed25519`。

#### 2️⃣ 复制公钥

```bash
cat ~/.ssh/id_ed25519.pub
```

复制输出的公钥内容。

#### 3️⃣ 在 GitLab Web 中添加 SSH Key

1. 登录 GitLab Web 界面
2. 右上角头像 → **Preferences**
3. 左侧菜单 → **SSH Keys**
4. 粘贴公钥内容
5. 点击 **Add key**

#### 4️⃣ 测试 SSH 连接（关键）

```bash
ssh -p ${GITLAB_SSH_PORT} git@${GITLAB_DOMAIN}
```

**示例**（如果端口是 10122）：
```bash
ssh -p 10122 git@git.lucaslyu.com
```

**正确结果应该是**：
```
Welcome to GitLab, @lucas!
```

❌ **如果连不上，检查**：
- 防火墙是否开放 `${GITLAB_SSH_PORT}` 端口
- `docker-compose.yml` 中的 `ports: ${GITLAB_SSH_PORT}:22` 映射
- `gitlab.rb` 中的 `gitlab_shell_ssh_port` 配置
- DNS 是否正确解析 `${GITLAB_DOMAIN}`

### ⑤ 创建你的第一个 Project（Repo）

1. 在 GitLab Web 界面点击 **New project** → **Blank project**
2. 填写项目信息：
   - **Name**：例如 `nfx-infra`
   - **Visibility**：选择 `Private` 或 `Public`
3. 点击 **Create project**

### ⑥ 本地 clone 验证（闭环）

```bash
# Clone 项目（注意使用 SSH URL 和端口）
git clone ssh://git@${GITLAB_DOMAIN}:${GITLAB_SSH_PORT}/用户名/项目名.git
cd 项目名
```

**示例**：
```bash
git clone ssh://git@git.lucaslyu.com:10122/lucas/nfx-infra.git
cd nfx-infra
```

**测试提交**：
```bash
echo "# NFX Infra" > README.md
git add .
git commit -m "init"
git push
```

👉 **如果 push 成功**：✅ GitLab Web + SSH 完全 OK

### ⑦（可选，但强烈推荐）启用 Runner

如果你暂时不想搞 CI，这一步可以先跳过。

#### 1️⃣ 在 GitLab Web 中获取 Token

1. 进入项目 → **Settings** → **CI/CD**
2. 展开 **Runners** 部分
3. 复制 **Registration token**

#### 2️⃣ 注册 Runner

```bash
sudo docker exec -it NFX-Edge-GitLab-Runner gitlab-runner register
```

**填写建议**：
- **GitLab URL**：`https://git.lucaslyu.com`（或你的 `${GITLAB_DOMAIN}`）
- **Token**：粘贴刚才复制的 Token
- **Executor**：`docker`
- **Default image**：`alpine:latest`

**验证 Runner 注册成功**：
```bash
sudo docker exec -it NFX-Edge-GitLab-Runner gitlab-runner list
```

### ⑧（可选）验证 Registry（以后用）

如果你启用了 Container Registry：

#### 1️⃣ 创建 Access Token

1. GitLab Web → 右上角头像 → **Preferences** → **Access Tokens**
2. 填写 Token 信息：
   - **Token name**：例如 `docker-registry`
   - **Scopes**：勾选 `read_registry` 和 `write_registry`
   - **Expiration date**：设置过期时间（可选）
3. 点击 **Create personal access token**
4. **立即复制 Token**（只显示一次）

#### 2️⃣ 登录 Registry

```bash
docker login ${GITLAB_REGISTRY_DOMAIN}
```

**示例**：
```bash
docker login registry.lucaslyu.com
```

**登录信息**：
- **用户名**：GitLab 用户名（不是邮箱）
- **密码**：**不是登录密码**，而是刚才创建的 Access Token

**验证登录成功**：
```bash
docker pull alpine:latest
docker tag alpine:latest ${GITLAB_REGISTRY_DOMAIN}/用户名/项目名:latest
docker push ${GITLAB_REGISTRY_DOMAIN}/用户名/项目名:latest
```

## 常用命令

### 查看 GitLab 日志

```bash
# 实时查看日志
sudo docker compose logs -f gitlab

# 查看最近 100 行
sudo docker compose logs --tail 100 gitlab
```

### 重启 GitLab

```bash
# 重启容器
sudo docker compose restart gitlab

# 或进入容器执行
sudo docker exec -it NFX-Edge-GitLab gitlab-ctl restart
```

### 检查配置

```bash
# 检查配置语法
sudo docker exec -it NFX-Edge-GitLab gitlab-ctl check-config

# 查看当前配置
sudo docker exec -it NFX-Edge-GitLab cat /etc/gitlab/gitlab.rb
```

### 备份与恢复

```bash
# 创建备份
sudo docker exec -it NFX-Edge-GitLab gitlab-backup create

# 恢复备份（需要先停止服务）
sudo docker compose stop gitlab
sudo docker compose run --rm gitlab gitlab-backup restore BACKUP=备份文件名
sudo docker compose start gitlab
```

## 故障排查

### GitLab 无法访问

1. **检查容器状态**：`sudo docker ps | grep GitLab`
2. **检查内部服务**：`sudo docker exec -it NFX-Edge-GitLab gitlab-ctl status`
3. **查看日志**：`sudo docker compose logs gitlab`
4. **检查 Traefik 路由**：确保 `reverse-proxy` 服务正在运行

### 配置不生效

1. **确认已执行 reconfigure**：`sudo docker exec -it NFX-Edge-GitLab gitlab-ctl reconfigure`
2. **检查配置文件路径**：确认 `${GITLAB_CONFIG_VOLUME}` 正确挂载
3. **查看配置错误**：`sudo docker exec -it NFX-Edge-GitLab gitlab-ctl check-config`

### 忘记 root 密码

```bash
# 进入 GitLab Rails 控制台
sudo docker exec -it NFX-Edge-GitLab gitlab-rails console

# 在控制台中执行
user = User.find_by_username('root')
user.password = '新密码'
user.password_confirmation = '新密码'
user.save!
exit
```

### SSH 连接失败

1. **检查端口映射**：
   ```bash
   sudo docker port NFX-Edge-GitLab
   ```
   应该看到 `${GITLAB_SSH_PORT}:22` 的映射

2. **检查防火墙**：
   ```bash
   # Ubuntu/Debian
   sudo ufw status
   sudo ufw allow ${GITLAB_SSH_PORT}/tcp
   
   # CentOS/RHEL
   sudo firewall-cmd --list-ports
   sudo firewall-cmd --add-port=${GITLAB_SSH_PORT}/tcp --permanent
   sudo firewall-cmd --reload
   ```

3. **检查 gitlab.rb 配置**：
   ```bash
   sudo docker exec -it NFX-Edge-GitLab grep gitlab_shell_ssh_port /etc/gitlab/gitlab.rb
   ```
   应该显示 `gitlab_rails['gitlab_shell_ssh_port'] = ${GITLAB_SSH_PORT}`

4. **测试端口连通性**：
   ```bash
   telnet ${GITLAB_DOMAIN} ${GITLAB_SSH_PORT}
   # 或
   nc -zv ${GITLAB_DOMAIN} ${GITLAB_SSH_PORT}
   ```

## 相关文档

- [配置详解](CONFIGURATION.md#gitlab-配置) - GitLab 详细配置说明
- [部署指南](DEPLOYMENT.md#gitlab-维护操作) - GitLab 维护操作
- [项目结构](STRUCTURE.md#gitlab-服务) - GitLab 服务架构说明
