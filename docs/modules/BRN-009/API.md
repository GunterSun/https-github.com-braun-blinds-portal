# BRN-009 Braun AI 助理 — API 与工具规范

## 1. 对话接口

### `POST /api/v4/ai/chat`

请求：

```json
{
  "message": "68735 还有多少钱没付？",
  "conversationId": "optional",
  "context": {
    "orderId": "optional",
    "customerId": "optional"
  }
}
```

服务端必须从 Session 获取用户身份和角色，不接受客户端传入角色。

响应：

```json
{
  "answer": "Invoice 总额 $2,000，已付款 $1,200，余额 $800。",
  "conversationId": "...",
  "sources": [
    {"type":"order","id":"68735","href":"/orders/68735"},
    {"type":"invoice","id":"...","href":"/invoices/..."}
  ],
  "currencyBreakdown": [
    {"currency":"USD","amount":800}
  ],
  "actions": []
}
```

## 2. 只读业务工具

### `search_orders`

按订单号、客户、电话、Invoice、Tracking 搜索。结果必须经过订单分配和角色过滤。

### `get_order_summary`

返回一个订单的客户、状态、产品、Invoice、付款、工厂、物流、安装和分币种财务摘要。

### `search_customers`

按姓名、公司、电话、邮箱或地址查询。Customer 角色只能返回本人记录。

### `get_invoice_balance`

返回 Invoice 总额、已付款、退款、余额和状态。全部金额标明币种。

### `get_order_financials`

仅 Owner 或明确授权角色可用。分别返回：

- USD 收入
- USD 支出
- RMB 支出
- 未折算利润组成
- 使用指定汇率后的分析值（可选）

### `get_shipping_history`

按尺寸、重量、目的地、承运商和订单查询历史运输记录。

### `get_installation_schedule`

按日期、安装工或订单查询排期。安装工只能查询自己的任务。

## 3. 草稿工具

### `draft_quote`

只生成报价草稿，不保存为正式 Quote，除非用户确认。

### `draft_invoice`

基于已确认订单数据生成 Invoice 草稿；不得自行补充缺失税率、安装费或折扣。

### `draft_customer_message`

生成中英文邮件或短信草稿，不自动发送。

### `draft_shipping_request`

根据多箱尺寸和重量生成承运商询价草稿。

## 4. 受控写入工具

### `propose_order_status_update`

先返回修改预览，不执行。

### `confirm_order_status_update`

必须带有前一步生成的一次性确认 token，并校验操作人、对象和新值未改变。

### `propose_payment_record`

显示订单、Invoice、金额、币种、方式、日期和备注。

### `confirm_payment_record`

执行前重新检查余额、重复付款和幂等键。

### `propose_installation_task`

创建安装任务预览。

### `confirm_installation_task`

确认后写入并记录审计日志。

## 5. 通用 API 规则

- 所有接口要求有效 Session。
- 每次工具调用执行服务端权限检查。
- 写入接口必须支持幂等键。
- 列表工具默认最多 20 条，最大 100 条。
- 不返回密钥、密码哈希、Session token 或完整审计敏感内容。
- 错误信息不得包含数据库堆栈。
- AI 回答中的链接只能指向用户有权访问的门户页面。

## 6. 建议的返回元数据

```json
{
  "dataAsOf": "2026-08-03T22:00:00-07:00",
  "isComplete": true,
  "missingFields": [],
  "warnings": [],
  "permissionScope": "assigned_orders"
}
```

## 7. 流式响应

可使用流式文字提高体验，但业务工具结果必须在服务端完整校验后才能输出。涉及金额和状态的结论不得在工具返回前猜测。
