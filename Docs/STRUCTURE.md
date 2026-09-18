# NFX-Edge 项目结构

[English Version](en/STRUCTURE.md)

## 目录结构（模板视角）

```text
NFX-Edge/
├── .env
├── .env.example
├── docker-compose.yml
├── docker-compose.example.yml
├── traefik.yml
├── start.sh
├── dynamic/
│   ├── acme-challenge.yml
│   └── tls.yaml
├── public/
│   └── nginx.conf
├── site1-www/
├── site1-admin/
├── site2-www/
└── Docs/
    ├── INDEX.md
    ├── README.md
    ├── DEPLOYMENT.md
    ├── CONFIGURATION.md
    ├── STRUCTURE.md
    └── en/
```

## 服务组成

### `traefik`

- 入口代理容器
- 监听 `80/443`
- 读取 Docker labels 与 `dynamic/*.yml|yaml`
- 承担 Dashboard 与访问日志

### 站点容器（Nginx）

- 每个站点一个容器
- 挂载静态目录到 `/usr/share/nginx/html`
- 共用 `public/nginx.conf`

## 网络关系

- Traefik 创建并监听 `nfx-edge` 网络（80/443）
- 产品 HTTP 服务双挂：产品内网 + `nfx-edge`（external）
- Traefik Docker provider 用 `traefik.project` LabelRegex 发现业务容器
- ACME HTTP-01 由 NFX-Vault `tls-api` 标签承接，不再转发到产品 Traefik 端口

## 示例文件与生产文件

- `docker-compose.example.yml` / `.env.example`：可直接复制改值的通用模板
- `docker-compose.yml` / `.env`：实际运行配置

