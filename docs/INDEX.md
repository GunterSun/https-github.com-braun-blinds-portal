# Braun Smart Portal 文档中心

本目录保存 Braun Smart Portal 的产品目标、业务规则、技术设计和开发路线。后续开发应以这些文档为依据，避免需求散落在聊天记录、多个门户和多个 Excel 中。

## 核心文档

- [项目愿景与统一门户原则](./PROJECT_VISION.md)
- [产品需求与模块范围](./PRODUCT_REQUIREMENTS.md)
- [开发路线图](./ROADMAP.md)
- [角色与权限](./ROLE_PERMISSION.md)
- [数据库与数据关系](./DATABASE.md)
- [Excel 导入规则](./IMPORT_RULES.md)
- [业务规则](./BUSINESS_RULES.md)
- [字段字典](./DATA_DICTIONARY.md)
- [物流中心](./LOGISTICS.md)
- [AI 助手](./AI_ASSISTANT.md)
- [界面设计规范](./UI_GUIDE.md)

## 唯一门户原则

- 唯一主仓库：`GunterSun/https-github.com-braun-blinds-portal`
- 唯一统一入口：`/hub`
- 正式域名目标：`portal.braunblinds.com`
- 旧门户只用于过渡，最终跳转到统一门户
- 不再为同一业务建立多个互相独立的门户
- 不使用演示订单、虚假 KPI 或不可操作按钮冒充真实功能

## 当前状态

代码开发、GitHub 合并与线上部署是不同状态。文档和代码进入主分支，不代表外部门户已经部署。上线必须经过真实部署、数据库迁移、密钥配置和访问测试。
