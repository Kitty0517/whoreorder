# Noir Atelier · 沉浸式赛博卖淫幻想平台

纯虚拟、纯文字的高端幻想接客平台。女孩开放注册，客人可下单并评价。  
所有内容均为意淫，不涉及任何真实交易或线下行为。

## 功能

### 女孩端（沉浸接客）
- 开放注册
- 接客面板：状态切换（空闲可约 / 接客中 / 已收工）
- 待接订单列表（「有人点了你」）
- 写服侍回复：强制第一人称、下贱、听话引导
- 编辑接客资料（简介、标签、价格、emoji）

### 客户端
- 浏览所有在线女孩
- 点单：必须写具体幻想需求（≥20字）
- 查看服侍内容
- 完成后可评价（评分 + 文字）

## 技术栈
- Next.js 15 (App Router)
- Turso (LibSQL) + Drizzle ORM
- JWT + bcrypt 简单认证
- Tailwind CSS 极暗主题

## 本地 / Vercel 部署步骤

### 1. 创建 Turso 数据库
```bash
# 安装 turso CLI 后
turso db create noir-atelier
turso db show noir-atelier --url
turso db tokens create noir-atelier
```

### 2. 克隆 / 上传代码后安装依赖
```bash
cd noir-atelier
npm install
```

### 3. 配置环境变量
复制 `.env.example` 为 `.env.local`，填入：
```
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
JWT_SECRET=一长串随机字符
```

### 4. 推送数据库结构
```bash
npx drizzle-kit push
```

### 5. 本地运行
```bash
npm run dev
```

### 6. 部署到 Vercel
1. 把项目推到 GitHub
2. Vercel 导入项目
3. 在 Vercel 项目设置里添加同样的三个环境变量
4. Deploy

部署后女孩直接访问首页 →「我要当赛博妓女」注册即可开始接客。

## 沉浸感设计要点
- 所有文案避免「角色扮演」等抽离词汇
- 使用「接客」「服侍」「被用」「下贱」「听话」等直接词汇
- 写回复时有固定提示引导第一人称淫荡表达
- 状态、订单、评价全流程模拟真实接客职业感

仅供成人意淫使用。
