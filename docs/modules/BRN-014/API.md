# BRN-014 Business Intelligence — API 规范

## 1. 通用规则

- API 前缀：`/api/v4/analytics`。
- 所有请求从 Session 获取身份和权限。
- 日期使用 ISO 8601；数据库 UTC，界面按用户时区显示。
- 所有金额返回 `amount` 与 `currency`。
- 不允许跨币种隐式相加。
- 响应必须包含 `dataAsOf`、`isComplete`、`warnings` 和 `metricVersion`。

## 2. 驾驶舱

### GET `/api/v4/analytics/dashboard`

参数：`dateFrom`、`dateTo`、`timezone`、`salesUserId`、`customerId`。

返回销售、应收、收款、USD 支出、RMB 支出、工厂、物流、安装和异常摘要。

## 3. 销售分析

### GET `/api/v4/analytics/sales`

支持按客户、销售、产品类型、地区和时间分组。返回订单数、确认销售额、平均订单金额、Quote 转化率和同比/环比。

### GET `/api/v4/analytics/sales/drilldown`

返回构成某项指标的订单列表，必须分页并继承原筛选条件。

## 4. 财务分析

### GET `/api/v4/analytics/receivables`

返回 Invoice、已收、余额、逾期区间和付款方式。

### GET `/api/v4/analytics/costs`

分别返回 USD 与 RMB 支出，支持订单、工厂、供应商、类型和月份分组。

### GET `/api/v4/analytics/profit`

默认返回原币组成。可选参数 `exchangeRateSetId` 生成折算结果；响应必须附汇率、日期和来源。

## 5. 运营分析

- `GET /api/v4/analytics/factory`
- `GET /api/v4/analytics/logistics`
- `GET /api/v4/analytics/installations`
- `GET /api/v4/analytics/data-quality`

物流接口需区分报价、实际购买费用和向客户收取的运费。

## 6. 指标元数据

### GET `/api/v4/analytics/metrics`

返回用户有权查看的指标定义、版本、公式说明和更新时间。

### GET `/api/v4/analytics/metrics/[metricCode]/drilldown`

需要日期、筛选条件和分页参数；返回来源实体链接。

## 7. 报告与导出

### POST `/api/v4/analytics/exports`

创建异步导出任务。请求包含报告类型、格式、筛选条件和语言。

### GET `/api/v4/analytics/exports/[exportId]`

返回 queued、running、completed 或 failed 状态。下载链接必须短期有效并经过权限验证。

## 8. AI 工具

- `get_business_summary`
- `get_receivables_summary`
- `get_profit_breakdown`
- `get_factory_exceptions`
- `get_shipping_cost_anomalies`
- `get_installation_schedule_summary`

AI 工具必须调用指标层，不得自行重新定义计算公式。

## 9. 缓存与一致性

响应可包含 `cacheStatus`。涉及付款、退款、订单金额和支出变更时，应在合理时间内失效相关缓存。用户可在 Owner 权限下请求安全刷新，但不得造成重复业务写入。

## 10. 错误响应

不得泄露 SQL、服务器堆栈、密钥或未授权实体。数据不完整使用结构化 warnings 返回，不得伪造完整结果。