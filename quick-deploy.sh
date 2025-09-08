#!/bin/bash

# 快速部署脚本 - 学生积分管理系统
# 使用方法: ./quick-deploy.sh [服务器地址] [用户名]

set -e

# 检查参数
if [ $# -lt 2 ]; then
    echo "使用方法: $0 [服务器地址] [用户名]"
    echo "例如: $0 your-server-ip root"
    exit 1
fi

SERVER_IP=$1
USERNAME=$2

echo "🚀 开始快速部署..."

# 构建项目
echo "📦 构建项目..."
npm run build

# 上传文件
echo "📤 上传文件..."
rsync -avz --delete dist/ $USERNAME@$SERVER_IP:/var/www/html/

# 重启服务
echo "🔄 重启服务..."
ssh $USERNAME@$SERVER_IP "sudo systemctl reload nginx"

echo "✅ 部署完成！"
echo "🌐 访问: http://$SERVER_IP"
