# BRN-003 Customer 360 / CRM — API 规范

## 1. 通用规则

- API 前缀：`/api/v4`。
- 服务端从 Session 获取用户和角色，不接受客户端自报权限。
- 列表接口分页，默认 25，最大 100。
- 所有写操作执行输入校验、权限检查和审计。
- 错误响应不得泄露 SQL、密钥或服务器堆栈。

## 2. 客户接口

### `GET /api/v4/customers`

参数：`q`、`status`、`type`、`salesOwnerId`、`tag`、`hasBalanceDue`、`page`、`pageSize`。

搜索覆盖姓名、公司、电话、邮箱、地址、订单号和 Invoice。返回结果按角色过滤。

### `POST /api/v4/customers`

创建客户。服务端先返回潜在重复候选；调用方必须明确选择继续创建或关联已有客户。

### `GET /api/v4/customers/[customerId]`

返回 Customer 360 摘要，字段按角色裁剪。客户角色不得收到内部成本、利润、工厂款或内部备注。

### `PATCH /api/v4/customers/[customerId]`

字段白名单更新。默认折扣、税务状态和付款条款的修改需要更高权限并写审计。

### `POST /api/v4/customers/[customerId]/archive`

归档客户。有关联活动订单或欠款时返回警告并要求明确确认。

## 3. 联系人与地址

- `POST /api/v4/customers/[customerId]/contacts`
- `PATCH /api/v4/customer-contacts/[contactId]`
- `POST /api/v4/customers/[customerId]/addresses`
- `PATCH /api/v4/customer-addresses/[addressId]`

主联系人和默认地址变更必须保证每类最多一个默认值。

## 4. 客户的客户

- `GET /api/v4/customers/[customerId]/end-customers`
- `POST /api/v4/customers/[customerId]/end-customers`
- `PATCH /api/v4/end-customers/[endCustomerId]`

生成终端客户 Quote 或 Invoice 时调用专门的公开视图，不返回批发价和内部字段。

## 5. 联系记录

- `GET /api/v4/customers/[customerId]/interactions`
- `POST /api/v4/customers/[customerId]/interactions`
- `POST /api/v4/customer-interactions/[interactionId]/send-preview`
- `POST /api/v4/customer-interactions/[interactionId]/confirm-send`

草稿与已发送状态分开。发送确认使用一次性 token 和幂等键。

## 6. 财务与历史

- `GET /api/v4/customers/[customerId]/orders`
- `GET /api/v4/customers/[customerId]/quotes`
- `GET /api/v4/customers/[customerId]/invoices`
- `GET /api/v4/customers/[customerId]/payments`
- `GET /api/v4/customers/[customerId]/balances`

`balances` 分别返回 USD 与 RMB；缺少汇率时不提供伪造的统一总额。

## 7. 重复与合并

### `GET /api/v4/customers/[customerId]/duplicate-candidates`

返回原因、相似度和证据，不自动合并。

### `POST /api/v4/customers/merge-preview`

返回主客户、被合并客户、字段冲突、将迁移的订单/文件/联系记录和风险警告，不写入。

### `POST /api/v4/customers/merge`

仅 Owner 或授权管理员可调用。需要确认 token、幂等键和事务。完成后返回 merge event ID。

## 8. 文件与审计

- `GET /api/v4/customers/[customerId]/files`
- `POST /api/v4/customers/[customerId]/files`
- `GET /api/v4/customers/[customerId]/audit`

客户下载文件前必须检查 `customer_visible` 和关联范围。