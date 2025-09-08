#!/bin/bash

# 学生积分管理系统 - 自动化部署脚本
# 使用方法: ./deploy.sh [环境] [服务器地址] [用户名]
# 例如: ./deploy.sh production your-server-ip root

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查参数
if [ $# -lt 3 ]; then
    log_error "使用方法: $0 [环境] [服务器地址] [用户名]"
    log_info "例如: $0 production your-server-ip root"
    exit 1
fi

ENVIRONMENT=$1
SERVER_IP=$2
USERNAME=$3
REMOTE_PATH="/var/www/html"
BACKUP_PATH="/var/backups/student-points-system"

log_info "开始部署学生积分管理系统..."
log_info "环境: $ENVIRONMENT"
log_info "服务器: $SERVER_IP"
log_info "用户: $USERNAME"

# 检查必要的工具
command -v npm >/dev/null 2>&1 || { log_error "需要安装 npm"; exit 1; }
command -v rsync >/dev/null 2>&1 || { log_error "需要安装 rsync"; exit 1; }

# 1. 运行测试
log_info "运行测试..."
npm test 2>/dev/null || log_warning "测试跳过（没有配置测试脚本）"

# 2. 构建项目
log_info "构建项目..."
npm run build

if [ ! -d "dist" ]; then
    log_error "构建失败，dist 目录不存在"
    exit 1
fi

log_success "项目构建完成"

# 3. 创建备份
log_info "在服务器上创建备份..."
ssh $USERNAME@$SERVER_IP "
    if [ -d '$REMOTE_PATH' ]; then
        sudo mkdir -p $BACKUP_PATH
        sudo cp -r $REMOTE_PATH $BACKUP_PATH/backup-\$(date +%Y%m%d-%H%M%S)
        echo '备份创建完成'
    else
        echo '目标目录不存在，跳过备份'
    fi
"

# 4. 上传文件
log_info "上传文件到服务器..."
rsync -avz --delete \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.env' \
    dist/ $USERNAME@$SERVER_IP:$REMOTE_PATH/

log_success "文件上传完成"

# 5. 设置权限
log_info "设置文件权限..."
ssh $USERNAME@$SERVER_IP "
    sudo chown -R www-data:www-data $REMOTE_PATH
    sudo chmod -R 755 $REMOTE_PATH
    echo '权限设置完成'
"

# 6. 测试 Nginx 配置
log_info "测试 Nginx 配置..."
ssh $USERNAME@$SERVER_IP "
    sudo nginx -t && echo 'Nginx 配置测试通过' || echo 'Nginx 配置有误'
"

# 7. 重新加载 Nginx
log_info "重新加载 Nginx..."
ssh $USERNAME@$SERVER_IP "
    sudo systemctl reload nginx
    sudo systemctl status nginx --no-pager -l
"

# 8. 健康检查
log_info "执行健康检查..."
sleep 5

# 检查网站是否可访问
if curl -f -s http://$SERVER_IP >/dev/null; then
    log_success "网站健康检查通过"
else
    log_warning "网站可能无法访问，请手动检查"
fi

# 9. 显示部署信息
log_success "部署完成！"
echo ""
echo "部署信息:"
echo "  环境: $ENVIRONMENT"
echo "  服务器: http://$SERVER_IP"
echo "  部署时间: $(date)"
echo "  部署用户: $(whoami)"
echo ""
echo "后续操作:"
echo "  1. 访问 http://$SERVER_IP 验证网站"
echo "  2. 检查浏览器控制台是否有错误"
echo "  3. 测试主要功能是否正常"
echo ""

# 10. 可选：运行远程测试
read -p "是否运行远程功能测试？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "运行远程功能测试..."
    # 这里可以添加远程测试逻辑
    log_info "请在浏览器中访问网站并手动测试功能"
fi

log_success "部署脚本执行完成！"
