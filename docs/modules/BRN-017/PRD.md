# BRN-017 Developer Platform — 产品需求

## 1. 目标

为 Braun Smart Portal 建立统一、受控、可审计的开发者平台，使 Stripe、物流平台、邮件、短信、网站、移动端、AI Agent 和未来第三方系统能够通过稳定 API、Webhook 和插件机制接入，而不是直接读写数据库或复制业务逻辑。

## 2. 核心能力

- API 应用与凭证管理
- OAuth 2.0 / 服务账号授权
- API Key 与细粒度 Scope
- Webhook 订阅、签名、重试和投递历史
- 沙箱环境与测试数据
- API 文档、版本和变更日志
- 插件注册、启停、权限和审核
- 调用日志、用量、错误率和限流
- 密钥轮换、撤销和泄露处理

## 3. 首批接入对象

- Stripe：付款与退款状态事件
- UPS、FedEx、USPS、Shippo：报价、运单和 Tracking
- 邮件与短信服务：草稿、发送和送达状态
- Braun 官网与客户门户：客户、报价和订单进度
- AI 助理与 AI Agent：仅通过受控业务工具调用
- Codex 与内部开发工具：读取规范、创建分支、提交 PR 和测试

## 4. 权限原则

- 外部应用只能访问被明确授予的 Scope。
- 不提供“万能数据库访问”权限。
- 客户、工厂、安装工的数据范围继续受订单分配和角色限制。
- 财务、利润、导入原始数据和审计日志默认仅 Owner 或专门服务账号可访问。
- 写操作必须使用幂等键并写入审计日志。

## 5. API 版本

- 正式前缀：`/api/v4`。
- 破坏性变更必须进入新版本或经过明确弃用周期。
- 响应中返回 `requestId`、`dataAsOf` 和版本信息。
- 文档必须标明字段币种、时区、权限和可空性。

## 6. Webhook

首批事件：

- `order.created`
- `order.status_changed`
- `invoice.issued`
- `payment.received`
- `payment.refunded`
- `shipment.created`
- `shipment.tracking_updated`
- `installation.scheduled`
- `installation.completed`
- `import.batch_confirmed`

Webhook 必须签名、带唯一事件 ID、支持重试、死信队列和人工重放。

## 7. 插件

插件必须声明：

- 名称、版本、开发者和用途
- 所需 Scope
- 读取与写入对象
- 外部域名
- 数据保留策略
- Webhook 订阅
- 停用与卸载行为

Owner 批准后才能启用。卸载不得删除正式业务记录。

## 8. 页面

建议路径：

- `/settings/developer/apps`
- `/settings/developer/webhooks`
- `/settings/developer/api-logs`
- `/settings/developer/plugins`
- `/settings/developer/sandbox`

## 9. 非目标

- 不允许第三方直接连接生产数据库。
- 不允许插件绕过门户五级权限。
- 不允许在前端暴露服务端密钥。
- 不把代码合并状态当作已部署状态。
