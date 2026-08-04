# BRN-004 Quote / Invoice / Payment Center — API 规范

## 1. 通用规则

- API 前缀：`/api/v4`。
- 身份和角色只从服务端 Session 获取。
- 所有写操作要求权限检查、输入校验、幂等和审计。
- 金额均返回 `amount` 与 `currency`。
- 错误响应不得泄露密钥、SQL 或服务器堆栈。

## 2. Quote

- `GET /api/v4/quotes`
- `POST /api/v4/quotes`
- `GET /api/v4/quotes/[quoteNumber]`
- `POST /api/v4/quotes/[quoteNumber]/versions`
- `POST /api/v4/quotes/[quoteNumber]/preview-pdf`
- `POST /api/v4/quotes/[quoteNumber]/send-preview`
- `POST /api/v4/quotes/[quoteNumber]/send`
- `POST /api/v4/quotes/[quoteNumber]/accept`
- `POST /api/v4/quotes/[quoteNumber]/decline`

`accept` 必须幂等；重复调用不得创建重复订单。

## 3. Invoice

- `GET /api/v4/invoices`
- `POST /api/v4/orders/[orderNumber]/invoices`
- `GET /api/v4/invoices/[invoiceNumber]`
- `POST /api/v4/invoices/[invoiceNumber]/versions`
- `POST /api/v4/invoices/[invoiceNumber]/preview-pdf`
- `POST /api/v4/invoices/[invoiceNumber]/issue`
- `POST /api/v4/invoices/[invoiceNumber]/send-preview`
- `POST /api/v4/invoices/[invoiceNumber]/send`
- `POST /api/v4/invoices/[invoiceNumber]/void-preview`
- `POST /api/v4/invoices/[invoiceNumber]/void`

创建 Invoice 必须使用幂等键。PDF 生成接口返回文件大小、页数、校验状态和下载引用；空白或金额不一致时不得标记成功。

## 4. Payment

- `GET /api/v4/payments`
- `POST /api/v4/payments/manual-preview`
- `POST /api/v4/payments/manual`
- `POST /api/v4/payments/[paymentId]/allocate-preview`
- `POST /api/v4/payments/[paymentId]/allocate`
- `POST /api/v4/payments/[paymentId]/refund-preview`
- `POST /api/v4/payments/[paymentId]/refund`
- `POST /api/v4/payments/[paymentId]/void-preview`
- `POST /api/v4/payments/[paymentId]/void`

手工付款确认请求必须包含前一步生成的一次性确认 token，并重新校验 Invoice 余额、币种和重复参考号。

## 5. Stripe

- `POST /api/v4/invoices/[invoiceNumber]/stripe-checkout-preview`
- `POST /api/v4/invoices/[invoiceNumber]/stripe-checkout`
- `POST /api/v4/webhooks/stripe`

要求：

- Checkout 金额由服务端 Invoice 余额生成。
- webhook 必须验证签名。
- Stripe event ID 唯一并幂等处理。
- 前端 success URL 不能作为 Paid 的权威来源。
- 手续费与净收款可保存为独立财务字段，不修改 Invoice 原总额。

## 6. Receipt 与交付

- `GET /api/v4/payments/[paymentId]/receipt`
- `POST /api/v4/payments/[paymentId]/receipt-pdf`
- `POST /api/v4/payments/[paymentId]/send-receipt-preview`
- `POST /api/v4/payments/[paymentId]/send-receipt`
- `GET /api/v4/documents/[type]/[id]/deliveries`

## 7. 计算预览

- `POST /api/v4/quotes/calculate`
- `POST /api/v4/invoices/calculate`

请求可包含产品明细、折扣、税、安装费和运费；服务端返回逐项计算结果和警告。客户端不得自行决定最终总额。

## 8. 权限与字段裁剪

- Owner 可访问全部。
- Sales 仅访问分配范围，并按配置执行付款操作。
- Customer 仅访问自己的公开版本和付款链接。
- Factory/Installer 无权调用价格和付款接口。
- API 返回前必须进行字段级裁剪，不能只在页面隐藏。

## 9. 审计动作

至少记录：

- Quote 创建、版本、发送、接受
- Invoice 创建、签发、发送、作废
- 手工付款、Stripe 付款、分配、退款、撤销
- PDF 生成失败
- 权限拒绝和重复事件拦截