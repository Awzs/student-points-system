# 学生积分管理系统

一个专为高一学生设计的手机使用积分兑换系统，通过学习表现获得积分，兑换娱乐时间，培养良好的学习和时间管理习惯。

## 🌟 功能特色

### 核心功能
- **积分管理系统**：记录和计算学生的学习积分
- **时间兑换功能**：将积分转换为娱乐时间
- **进度跟踪**：显示当前积分、可用时间等状态
- **历史记录**：查看过往的积分变化和时间使用情况
- **规则说明**：详细的积分评价指标和使用规则

### 技术特色
- **移动端优化**：响应式设计，完美适配手机屏幕
- **混合存储**：本地缓存 + Supabase云端同步
- **离线支持**：网络断开时自动切换到本地模式
- **现代技术栈**：React + Vite + Supabase
- **PWA支持**：可安装到手机桌面

## 📱 积分评价指标

### 加分项
- **书写笔迹优秀**：5分/次
- **单科班级前5名**：15分
- **单科排名进步**：5分/名次
- **班级总排名进步**：5分/名次
- **错题积累**：2分/题
- **错题举一反三刷题**：1分/题（准确率需达到80%以上）

### 扣分项
- **老师投诉**：-20分/次

### 初始设定
- 单科班级排名：第10名
- 总分班级排名：第10名
- 总分年级排名：第50名

## ⏰ 时间兑换与使用规则

### 兑换规则
- **兑换比例**：1积分 = 1分钟娱乐时间
- **结算周期**：每周五晚上进行积分结算
- **时间上限**：每周最多200分钟娱乐时间

### 时间分配
- **游戏时间**：50%（用于游戏）
- **泛娱乐时间**：50%（用于短视频、社交软件等）

### 使用限制
- 仅限周六、周日使用
- 不得将两天的时间集中在一天使用
- 未用完的积分可结转下周

## 🏆 奖惩机制

### 奖励
- **连续两周积分超过300分**：获得一次"自由娱乐时间"
- **月考大幅进步**：特殊家庭活动奖励

### 惩罚
- **触发扣分项**：额外禁娱1-7天
- **总积分为负数**：本周无娱乐时间，下周需先补足负分

## 🚀 快速开始

### 环境要求
- Node.js 16+
- npm 或 yarn
- Supabase 账号（已配置，用于云端同步）

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/Awzs/student-points-system.git
cd student-points-system
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
环境变量已经配置完成，包含了 Supabase 连接信息。如需修改，请编辑 `.env` 文件：
```env
VITE_SUPABASE_URL=https://mhtvmrtdkwozlbkgtwdh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. **Supabase 数据库**
数据库表结构已经创建完成。如需重新创建，请在 Supabase SQL Editor 中运行 `supabase-schema.sql` 文件。

5. **启动开发服务器**
```bash
npm start
```

6. **访问应用**
打开浏览器访问 `http://localhost:5173`

## ✅ 项目状态

- ✅ Supabase 环境变量已配置
- ✅ 数据库表结构已创建
- ✅ 本地运行测试通过
- ✅ ESLint 代码检查通过
- ✅ 生产构建测试通过
- ✅ GitHub 仓库已创建

## 📦 项目结构

```
student-points-system/
├── public/                 # 静态资源
├── src/
│   ├── components/         # React 组件
│   │   ├── Dashboard.jsx   # 首页仪表板
│   │   ├── PointEntry.jsx  # 积分录入
│   │   ├── TimeExchange.jsx # 时间兑换
│   │   ├── HistoryView.jsx # 历史记录
│   │   ├── RulesView.jsx   # 规则说明
│   │   └── SettingsView.jsx # 设置页面
│   ├── services/           # 服务层
│   │   └── dataService.js  # 数据服务（本地+云端）
│   ├── utils/              # 工具函数
│   │   ├── dataModel.js    # 数据模型定义
│   │   ├── storage.js      # 本地存储
│   │   ├── supabase.js     # Supabase 配置
│   │   ├── pointsCalculator.js # 积分计算
│   │   ├── mobile.js       # 移动端工具
│   │   ├── test.js         # 功能测试
│   │   └── demoData.js     # 演示数据
│   ├── App.jsx             # 主应用组件
│   ├── App.css             # 样式文件
│   └── main.jsx            # 入口文件
├── supabase-schema.sql     # 数据库表结构
├── .env.example            # 环境变量模板
└── README.md               # 项目文档
```

## 🛠️ 开发指南

### 本地开发
```bash
# 启动开发服务器
npm start

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 测试功能
在开发模式下，打开浏览器控制台：

```javascript
// 运行功能测试
runTests()

// 加载演示数据
loadDemoData()

// 生成随机测试数据
generateRandomData(50)

// 重置应用
resetApp()
```

### 数据存储模式
应用支持三种数据存储模式：

1. **本地模式**：仅使用 localStorage
2. **云端模式**：仅使用 Supabase
3. **混合模式**：本地缓存 + 云端同步（推荐）

应用会根据网络状态和 Supabase 连接情况自动选择合适的模式。

## 🌐 部署指南

### Vercel 部署（推荐）

1. **连接 GitHub**
   - 将代码推送到 GitHub 仓库
   - 在 Vercel 中导入项目

2. **配置环境变量**
   在 Vercel 项目设置中添加：
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **部署**
   Vercel 会自动构建和部署应用

### 阿里云服务器部署

1. **构建项目**
```bash
npm run build
```

2. **上传文件到阿里云服务器**
```bash
# 方法1：使用 scp 命令上传
scp -r dist/* user@your-server-ip:/var/www/html/

# 方法2：使用 rsync 同步（推荐）
rsync -avz --delete dist/ user@your-server-ip:/var/www/html/

# 方法3：打包后上传
tar -czf dist.tar.gz dist/
scp dist.tar.gz user@your-server-ip:/tmp/
ssh user@your-server-ip "cd /var/www/html && tar -xzf /tmp/dist.tar.gz --strip-components=1"
```

3. **配置 Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    # 支持 SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

4. **更新依赖和重启服务**
```bash
# 连接到服务器
ssh user@your-server-ip

# 测试 Nginx 配置
sudo nginx -t

# 重新加载 Nginx 配置
sudo systemctl reload nginx

# 或重启 Nginx 服务
sudo systemctl restart nginx

# 检查服务状态
sudo systemctl status nginx
```

5. **自动化部署脚本**
创建 `deploy.sh` 脚本：
```bash
#!/bin/bash
echo "开始构建项目..."
npm run build

echo "上传文件到服务器..."
rsync -avz --delete dist/ user@your-server-ip:/var/www/html/

echo "重启 Nginx 服务..."
ssh user@your-server-ip "sudo systemctl reload nginx"

echo "部署完成！"
```

## 📱 移动端优化

### PWA 功能
- 可安装到手机桌面
- 离线缓存支持
- 原生应用体验

### 移动端特性
- 触摸优化的交互
- 响应式设计
- 安全区域适配（iPhone X 等）
- 触觉反馈支持

## 🔧 配置选项

### 环境变量
```env
# Supabase 配置
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 应用配置
VITE_APP_NAME=学生积分管理系统
VITE_APP_VERSION=1.0.0
```

### 自定义配置
可以在 `src/utils/dataModel.js` 中修改：
- 积分值设定
- 时间兑换比例
- 使用规则等

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证

## 📞 支持与反馈

如有问题或建议，请提交 Issue 或联系开发者。

---

**注意**：本系统旨在帮助学生培养良好的学习和时间管理习惯，请合理使用，避免过度依赖电子设备。
