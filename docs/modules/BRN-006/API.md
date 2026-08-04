# BRN-006 Logistics / Shipping Center — API 规范

## 主要接口

- `POST /api/v4/shipments/draft`：从订单创建物流草稿。
- `POST /api/v4/shipments/{id}/packages`：增加或修改箱规。
- `POST /api/v4/shipments/{id}/rates`：请求多承运商报价。
- `POST /api/v4/shipments/{id}/purchase-preview`：生成购买前预览。
- `POST /api/v4/shipments/{id}/purchase`：确认购买运单。
- `POST /api/v4/shipments/{id}/cancel-preview`：生成取消预览。
- `POST /api/v4/shipments/{id}/cancel`：确认取消。
- `GET /api/v4/shipments/{id}`：读取物流、包裹、费用和事件。
- `GET /api/v4/orders/{orderNumber}/shipments`：读取订单全部物流。
- `POST /api/v4/webhooks/shipping/{provider}`：接收 Tracking 和账单事件。
- `GET /api/v4/logistics/history/similar`：查询相似历史运输。

## 购买规则

购买接口必须接收：报价 ID、地址与箱规版本、确认人、幂等键。服务器必须重新检查权限、报价有效期和地址完整性。返回值明确区分 purchased、failed、pending 和 unknown。

## Webhook

- 校验签名或平台认证。
- 保存原始事件摘要。
- 重复事件只处理一次。
- 外部状态映射到统一状态，同时保留原始值。
- 事件顺序异常时不得把 delivered 回退为 in_transit，除非人工审核。

## 权限

权限必须在服务器执行。Customer 不得读取购买价格、最终账单或内部异常备注。Factory 只能更新分配任务的包装和发货资料。

## 错误与审计

外部请求必须使用超时、有限重试和可追踪 request ID。购买、取消、退款、地址变更、Tracking 人工修改和费用调整全部写入 AuditLog。