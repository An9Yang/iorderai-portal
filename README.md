# iOrderAI 商家端 Portal

iOrderAI Voice Agent 点餐系统的商家管理后台。

## 技术栈

- **框架**: React 19 + TypeScript + Vite
- **样式**: TailwindCSS 4
- **路由**: React Router v7
- **国际化**: i18next (中文/英文)
- **图表**: Recharts
- **地图**: Google Maps (@react-google-maps/api)

## 功能模块

| 模块 | 说明 |
|------|------|
| 登录 | 商户账号登录、手机号验证码登录、忘记密码（4 步向导）、修改密码 |
| 仪表盘 | 今日订单、收入概览 |
| 订单管理 | 订单列表、搜索筛选、导出、状态操作 |
| 通话记录 | 通话列表、对话详情、录音回放、实时演示 |
| 财务中心 | 财务统计、趋势图表、打款记录 |
| 餐馆信息 | 基本信息、配送模式、配送范围设置 |

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 部署

### Firebase Hosting

1. 安装 Firebase CLI:
```bash
npm install -g firebase-tools
```

2. 登录 Firebase:
```bash
firebase login
```

3. 配置项目 ID (编辑 `.firebaserc`):
```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

4. 部署:
```bash
npm run deploy
```

## 环境变量

在项目根目录创建 `.env` 文件:

```env
# Google Maps API Key (配送范围地图功能)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# API Base URL (后端接口地址，当前使用 Mock 数据)
VITE_API_BASE_URL=https://api.iorderai.com/v1
```

## 项目结构

```
src/
├── components/          # 通用组件
│   ├── Layout/          # 布局组件 (侧边栏、头部)
│   ├── ChangePasswordModal.tsx  # 修改密码弹窗
│   ├── PasswordStrengthBar.tsx  # 密码强度指示器
│   └── ui/              # 基础 UI 组件
├── contexts/            # React Context
│   └── AuthContext.tsx  # 认证状态管理
├── hooks/               # 自定义 Hooks
│   ├── useAudioPlayer.ts       # 录音播放控制
│   └── useLanguageToggle.ts    # 语言切换
├── i18n/                # 多语言配置
│   └── locales/         # 翻译文件 (zh.json, en.json)
├── mock/                # Mock 模拟数据
│   └── data.ts          # 订单、餐馆、财务模拟数据
├── pages/               # 页面组件
│   ├── CallRecords/     # 通话记录
│   ├── Dashboard/       # 仪表盘
│   ├── Finance/         # 财务模块
│   ├── ForgotPassword/  # 忘记密码
│   ├── Login/           # 登录页
│   ├── Orders/          # 订单管理
│   └── Restaurant/      # 餐馆信息
├── types/               # TypeScript 类型定义
├── utils/               # 共享工具函数
│   ├── password.ts      # 密码校验与强度计算
│   └── format.ts        # 格式化工具
├── App.tsx              # 应用入口、路由配置
└── main.tsx             # React 入口
```

## API 文档

后端接口文档位于 [docs/API.md](docs/API.md)，包含：

- 所有接口的请求/响应格式
- 当前 Mock 数据位置说明
- 前端替换指南

## 测试账号

当前使用 Mock 数据，测试登录:

- **账号登录**: 用户名 `demo`，密码 `demo123`
- **手机号登录**: 任意 10 位手机号，验证码 `123456`

## 开发说明

### 数据来源

当前所有数据来自 `src/mock/data.ts`，后端开发完成后需替换为真实 API 调用。详见 [API 文档](docs/API.md)。

### 多语言

- 中文: `src/i18n/locales/zh.json`
- 英文: `src/i18n/locales/en.json`

切换语言使用顶部导航栏的语言切换按钮。

### 配送范围地图

需要配置 `VITE_GOOGLE_MAPS_API_KEY` 环境变量才能显示 Google Maps。未配置时会显示提示信息，但滑块控件仍可使用。
