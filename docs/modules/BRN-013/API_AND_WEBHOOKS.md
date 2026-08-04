# BRN-013 Developer Platform — API 与 Webhook 规范

## 1. 通用 API 响应

成功响应建议包含：

```json
{
  "data": {},
  "requestId": "req_...",
  "apiVersion": "v4",
  "dataAsOf": "2026-08-04T00:00:00Z"
}
```

错误响应：

```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid request",
    "fields": []
  },
  "requestId": "req_..."
}
```

## 2. 应用管理

- `GET /api/v4/developer/apps`
- `POST /api/v4/developer/apps`
- `GET /api/v4/developer/apps/[appId]`
- `PATCH /api/v4/developer/apps/[appId]`
- `POST /api/v4/developer/apps/[appId]/rotate-secret`
- `POST /api/v4/developer/apps/[appId]/revoke`

仅 Owner 或被授权管理员可管理应用。创建和轮换密钥必须要求重新认证。

## 3. OAuth

- `/oauth/authorize`
- `/oauth/token`
- `/oauth/revoke`

要求：

- Authorization Code + PKCE
- Redirect URI 精确匹配
- 短期 Access Token
- 可撤销 Refresh Token
- Scope 在授权页清晰展示
- 禁止隐式授权模式

## 4. 业务 API

业务 API 复用现有 `/api/v4` 服务层，例如：

- `GET /orders`
- `GET /orders/[orderNumber]`
- `GET /customers`
- `GET /invoices/[invoiceNumber]`
- `GET /shipments/[shipmentId]`
- `GET /installations`

所有返回内容按 Scope、角色和对象归属裁剪。金额必须包含 `amount` 和 `currency`；不得把 USD 与 RMB 直接相加。

## 5. 幂等

所有创建付款、运单、Invoice、安装任务等写操作必须接受：

```http
Idempotency-Key: unique-client-value
```

同一应用、接口和幂等键在有效期内只能产生一个业务结果。参数不一致时返回冲突错误。

## 6. 分页与过滤

使用游标或页码分页，默认 25，最大 100。批量导出使用异步任务，不能在单次请求中返回无限数据。

## 7. Webhook 管理

- `GET /api/v4/developer/webhooks`
- `POST /api/v4/developer/webhooks`
- `PATCH /api/v4/developer/webhooks/[id]`
- `POST /api/v4/developer/webhooks/[id]/rotate-secret`
- `POST /api/v4/developer/webhooks/[id]/test`
- `GET /api/v4/developer/webhooks/[id]/deliveries`
- `POST /api/v4/developer/webhook-deliveries/[deliveryId]/retry`

## 8. Webhook 格式

```json
{
  "id": "evt_...",
  "type": "payment.received",
  "apiVersion": "v4",
  "createdAt": "2026-08-04T00:00:00Z",
  "livemode": true,
  "data": {
    "object": {}
  }
}
```

请求头：

```http
Braun-Event-Id: evt_...
Braun-Timestamp: 1785800000
Braun-Signature: v1=...
```

## 9. 投递与重试

- 2xx 视为成功。
- 超时或非 2xx 进入指数退避重试。
- 达到最大次数后进入死信状态。
- Owner 可查看响应码、耗时和脱敏响应摘要并人工重放。
- 同一事件重放保持原事件 ID，并生成新的 delivery ID。

## 10. 插件 API

- `GET /api/v4/developer/plugins`
- `POST /api/v4/developer/plugins/install`
- `POST /api/v4/developer/plugins/[id]/enable`
- `POST /api/v4/developer/plugins/[id]/disable`
- `POST /api/v4/developer/plugins/[id]/uninstall`

启用前展示权限、外部域名、数据用途和新增 Scope。卸载只移除访问权与配置，不删除由插件创建的正式订单、付款或物流记录。

## 11. 版本与弃用

弃用接口必须：

- 在文档和响应头中标记
- 提供迁移说明
- 给出停止日期
- 在删除前监控仍在使用的应用并通知 Owner

## 12. OpenAPI

Codex 应维护机器可读 OpenAPI 文档，并由 CI 验证：

- 路径与实现一致
- Schema 无破坏性变化
- Scope 和错误码完整
- 示例不包含真实客户资料或密钥
