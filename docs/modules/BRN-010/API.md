# BRN-010 API 规范

## 1. 工厂与供应商

- `GET /api/v4/suppliers`
- `POST /api/v4/suppliers`
- `GET /api/v4/suppliers/:id`
- `PATCH /api/v4/suppliers/:id`

创建和修改供应商需要 Owner 或被授权员工权限。工厂用户只能读取自己的公开资料。

## 2. 工厂任务

- `GET /api/v4/factory-jobs`
- `POST /api/v4/orders/:orderNumber/factory-jobs`
- `GET /api/v4/factory-jobs/:id`
- `PATCH /api/v4/factory-jobs/:id`
- `POST /api/v4/factory-jobs/:id/status-transitions`
- `POST /api/v4/factory-jobs/:id/quality-issues`

状态修改必须验证允许的状态迁移，并记录旧状态、新状态、执行人和时间。

## 3. 采购单

- `GET /api/v4/purchase-orders`
- `POST /api/v4/purchase-orders`
- `GET /api/v4/purchase-orders/:id`
- `PATCH /api/v4/purchase-orders/:id`
- `POST /api/v4/purchase-orders/:id/approve`
- `POST /api/v4/purchase-orders/:id/send`
- `POST /api/v4/purchase-orders/:id/cancel`

审批与发送分开；发送前返回最终预览。重复请求使用 `Idempotency-Key`。

## 4. 工厂付款

- `GET /api/v4/supplier-payments`
- `POST /api/v4/supplier-payments/preview`
- `POST /api/v4/supplier-payments`
- `POST /api/v4/supplier-payments/:id/reverse`

付款写入前必须显示供应商、订单、采购单、金额、币种、付款方式和影响后的余额。RMB 与 USD 不得自动合并。

## 5. 权限与数据过滤

- Owner：全部。
- Sales：仅分配订单及经授权成本字段。
- Factory：仅自己的任务；隐藏客户售价、利润、其他工厂和内部备注。
- Installer：只读到货/可安装状态。
- Customer：无工厂中心 API 权限。

## 6. 错误与审计

统一错误码包括：`FORBIDDEN`、`INVALID_STATUS_TRANSITION`、`CURRENCY_REQUIRED`、`DUPLICATE_PAYMENT`、`OVER_ALLOCATED_QUANTITY`、`CONFIRMATION_REQUIRED`。

所有新增、审批、付款、撤销、状态改变和发送操作写入审计日志。