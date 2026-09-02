# AI Form Builder

低代码表单配置平台 — 基于 JSON Schema 文档化设计的表单构建器。

## 技术栈

| 维度 | 方案 |
|------|------|
| 前端框架 | React 18 + Ant Design 5 |
| 后端框架 | Node.js Express + Prisma |
| 数据模型 | JSON Schema 文档化存储 |
| 状态管理 | Zustand |
| 拖拽排序 | @dnd-kit |
| 表单校验 | Zod（后端）+ Ant Design Form Rules（前端） |
| 控件渲染 | 组件注册表模式 |
| 数据库 | SQLite + JSON 数据存储 |
| 运行时引擎 | SchemaEngine（TypeScript 模块化） |

## 功能特性

- **可视化表单设计器** — 拖拽排序、字段属性配置、分组管理
- **14 种字段类型** — 文本、数字、日期、选择、开关、评分等
- **校验规则** — 必填、邮箱、手机号、长度、范围等
- **栅格布局** — 支持 1-4 列自适应布局
- **表单预览** — 设计器中实时预览
- **运行时渲染** — 根据 Schema 动态渲染可填写表单
- **数据管理** — 提交数据的列表查看与删除
- **表单发布** — 草稿/发布/归档状态管理

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装与运行

```bash
# 安装依赖
npm install

# 初始化数据库
npm run db:push
npm run db:seed

# 启动开发服务（前端 + 后端）
npm run dev
```

- 前端：http://localhost:5173
- 后端 API：http://localhost:3001

### 演示数据

种子数据包含一个「员工信息登记表」示例表单（编码：`employee_registration`），已发布可直接填写。

## 项目结构

```
ai-form-builder/
├── packages/
│   ├── server/                 # 后端 API 服务
│   │   ├── prisma/             # 数据库 Schema
│   │   └── src/
│   │       ├── routes/         # REST 路由
│   │       ├── services/       # 业务逻辑
│   │       │   ├── form-service.ts       # 表单 CRUD
│   │       │   ├── submission-service.ts # 数据提交
│   │       │   └── schema-engine.ts      # Schema 引擎
│   │       ├── lib/            # 工具库
│   │       └── types/          # 类型定义
│   └── web/                    # 前端应用
│       └── src/
│           ├── api/            # API 客户端
│           ├── components/
│           │   ├── designer/   # 设计器组件
│           │   └── renderer/   # 运行时渲染
│           ├── pages/          # 页面
│           ├── registry/       # 字段组件注册表
│           ├── stores/         # Zustand 状态
│           └── types/          # 类型定义
└── package.json                # Monorepo 根配置
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/forms | 表单列表 |
| POST | /api/forms | 创建表单 |
| GET | /api/forms/:id | 获取表单详情 |
| PUT | /api/forms/:id | 更新表单 |
| DELETE | /api/forms/:id | 删除表单 |
| POST | /api/forms/:id/publish | 发布表单 |
| POST | /api/forms/:id/duplicate | 复制表单 |
| GET | /api/forms/runtime/:code | 获取运行时 Schema |
| POST | /api/forms/runtime/:code/submit | 提交表单数据 |
| GET | /api/forms/:formId/submissions | 提交数据列表 |

## License

MIT
