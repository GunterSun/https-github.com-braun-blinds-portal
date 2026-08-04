# BRN-013 Developer Platform — 架构与安全

## 1. 架构

```text
External App / Plugin
  ↓ HTTPS
API Gateway
  ├── Authentication
  ├── Scope & tenant checks
  ├── Rate limiting
  ├── Schema validation
  └── Request audit
  ↓
Business Service Layer
  ├── Orders
  ├── Customers
  ├── Invoices & Payments
  ├── Logistics
  ├── Installations
  └── Knowledge / AI tools
  ↓
Unified Database
```

外部应用不得绕过业务服务层直接查询数据库。

## 2. 身份认证

支持：

- 服务端 API Key：仅用于受控内部集成
- OAuth 2.0 Authorization Code + PKCE：代表用户操作
- Client Credentials：后台服务账号
- Webhook 签名密钥：仅用于验证事件

禁止把密钥放入浏览器代码、GitHub 仓库、日志或错误信息。

## 3. Scope 示例

- `orders:read`
- `orders:write`
- `customers:read`
- `invoices:read`
- `payments:read`
- `payments:write`
- `shipping:read`
- `shipping:write`
- `installations:read`
- `knowledge:read`
- `webhooks:manage`

`payments:write`、退款、权限管理和密钥管理必须使用更严格审批，不得默认授权。

## 4. 数据范围

Scope 只决定功能范围，不能替代数据范围检查。每次请求还必须校验：

- 当前用户或服务账号
- 角色
- 客户归属
- 订单分配
- 工厂或安装任务分配
- 字段级隐藏规则

## 5. Webhook 安全

- 使用 HMAC-SHA256 或等效签名。
- 请求包含时间戳、事件 ID 和签名版本。
- 拒绝超过允许时间窗口的重放请求。
- 接收端必须按事件 ID 幂等处理。
- 密钥支持轮换并允许短期双密钥验证。
- 投递正文不得包含密码、Session、完整信用卡号或不必要的内部成本。

## 6. API 安全

- 全站 TLS。
- 输入使用严格 Schema 校验和字段白名单。
- 禁止自由 SQL、动态表名和任意文件路径。
- 所有写入使用事务、幂等键和审计日志。
- 限制分页、导出数量和批量写入规模。
- 错误响应不泄露 SQL、堆栈、密钥或内部路径。

## 7. 限流与滥用防护

按应用、用户、IP 和接口风险分级限流。高风险操作需要更低限额和二次确认。达到限额时返回标准 `429` 和重试时间，不得静默丢弃写请求。

## 8. 密钥生命周期

- 创建时仅显示一次完整密钥。
- 数据库只保存安全哈希或加密密文。
- 支持到期日、最后使用时间和来源 IP。
- 支持立即撤销和计划轮换。
- 发现泄露时自动停用、告警并生成审计事件。

## 9. 沙箱

- 沙箱与生产使用不同密钥、URL 和数据。
- 沙箱不得包含真实客户敏感信息。
- 沙箱 Webhook 明确标记 `livemode=false`。
- 测试付款、物流和邮件不得产生真实费用或真实发送。

## 10. 插件隔离

- 插件以最小权限运行。
- 外部域名采用允许列表。
- 插件不可执行任意服务器命令。
- 插件升级时重新核对新增 Scope。
- 停用插件后立即阻止 API 和 Webhook 访问。

## 11. 审计与保留

记录应用、用户、Scope、请求 ID、接口、对象 ID、结果、耗时、来源 IP 和写入前后摘要。敏感字段脱敏；日志保留期限由 Owner 策略统一管理。
