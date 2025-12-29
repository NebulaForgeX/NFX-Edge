#!/bin/bash
# ============================================
# 🔄 Websites Docker Compose 重启脚本
# Author: Lucas Lyu
# 功能：停止服务、删除容器和镜像、重新启动
# ============================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 加载 .env 配置文件
ENV_FILE="$SCRIPT_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ 错误: 找不到配置文件 $ENV_FILE${NC}"
    exit 1
fi

# 从 .env 文件加载配置
set -a  # 自动导出变量
source "$ENV_FILE"
set +a  # 关闭自动导出

# 将空格分隔的字符串转换为数组
IFS=' ' read -r -a CONTAINERS_ARRAY <<< "$CONTAINERS"
IFS=' ' read -r -a IMAGES_ARRAY <<< "$IMAGES"

echo "==============================================="
echo "🔄 Websites Docker Compose 重启脚本"
echo "==============================================="
echo ""

# 步骤 1: 停止并删除 Docker Compose 服务
echo -e "${YELLOW}[1/4] 停止 Docker Compose 服务...${NC}"
sudo docker compose down || true
echo -e "${GREEN}✅ Docker Compose 服务已停止${NC}"
echo ""

# 步骤 2: 删除容器（如果还存在）
echo -e "${YELLOW}[2/4] 删除容器...${NC}"
for container in "${CONTAINERS_ARRAY[@]}"; do
    if sudo docker ps -a --format '{{.Names}}' | grep -q "^${container}$"; then
        echo "  删除容器: ${container}"
        sudo docker rm -f "$container" || true
    else
        echo "  容器不存在，跳过: ${container}"
    fi
done
echo -e "${GREEN}✅ 容器清理完成${NC}"
echo ""

# 步骤 3: 删除镜像（如果还存在）
echo -e "${YELLOW}[3/4] 删除镜像...${NC}"
for image in "${IMAGES_ARRAY[@]}"; do
    if sudo docker images --format '{{.Repository}}:{{.Tag}}' | grep -q "^${image}$"; then
        echo "  删除镜像: ${image}"
        sudo docker rmi -f "$image" || true
    else
        echo "  镜像不存在，跳过: ${image}"
    fi
done
echo -e "${GREEN}✅ 镜像清理完成${NC}"
echo ""

# 步骤 4: 重新启动服务
echo -e "${YELLOW}[4/4] 重新启动 Docker Compose 服务...${NC}"
sudo docker compose up -d
echo -e "${GREEN}✅ 服务已启动${NC}"
echo ""

# 显示服务状态
echo "==============================================="
echo "📊 服务状态"
echo "==============================================="
sudo docker compose ps
echo ""

# 显示日志提示
echo "==============================================="
echo "📝 查看日志命令"
echo "==============================================="
echo "查看所有服务日志: sudo docker compose logs -f"
echo "查看 Traefik 日志: sudo docker compose logs -f reverse-proxy"
echo "查看 Nginx 日志: sudo docker compose logs -f www_sjgztea"
echo ""

echo -e "${GREEN}✅ 重启完成！${NC}"

