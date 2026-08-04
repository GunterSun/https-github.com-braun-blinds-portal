# BRN-010 Braun AI Agent — API 规范

## 1. Agent 管理

- `GET /api/v4/agents`
- `GET /api/v4/agents/[agentId]`
- `PATCH /api/v4/agents/[agentId]`
- `POST /api/v4/agents/[agentId]/enable`
- `POST /api/v4/agents/[agentId]/disable`

仅 Owner 可修改 Agent 配置。修改工具白名单、操作等级、计划频率或通知渠道必须写入审计日志。

## 2. 手动运行

### `POST /api/v4/agents/[agentId]/runs`

请求示例：

```json
{
  "context": {"orderNumber":"68735"},
  "mode":"preview",
  "idempotencyKey":"..."
}
```

返回运行 ID。默认 `preview`，不得直接执行 Level 2 写入。

### `GET /api/v4/agent-runs/[runId]`

返回状态、数据时间、调用工具、结果摘要、警告、草稿和待确认操作。

## 3. 确认操作

- `POST /api/v4/agent-runs/[runId]/actions/[actionId]/confirm`
- `POST /api/v4/agent-runs/[runId]/actions/[actionId]/reject`

确认请求必须包含一次性 token 和幂等键。服务端重新校验用户、权限、数据版本、金额和目标对象。

## 4. 计划任务

- `GET /api/v4/agent-schedules`
- `POST /api/v4/agent-schedules`
- `PATCH /api/v4/agent-schedules/[scheduleId]`
- `POST /api/v4/agent-schedules/[scheduleId]/pause`
- `POST /api/v4/agent-schedules/[scheduleId]/resume`

计划任务必须保存时区、频率、创建者、授权范围和最大运行量。财务和批量计划仅 Owner 可创建。

## 5. 建议工具

### Sales Agent

- `analyze_order_for_quote`
- `draft_quote_from_confirmed_items`
- `draft_invoice_from_approved_quote`

### Customer Service Agent

- `get_customer_visible_order_status`
- `draft_payment_reminder`
- `draft_shipping_update`

### Finance Agent

- `list_overdue_invoices`
- `get_unsettled_expenses_by_currency`
- `build_profit_warning_report`

### Factory Agent

- `list_factory_jobs_at_risk`
- `draft_factory_followup`

### Logistics Agent

- `compare_shipping_history`
- `validate_package_dimensions`
- `draft_carrier_quote_request`

### Installation Agent

- `get_today_installations`
- `validate_installation_readiness`
- `draft_installer_brief`

### Owner Agent

- `build_daily_business_brief`
- `list_priority_exceptions`

### Project Manager Agent

- `inspect_pull_request_against_docs`
- `check_required_tests_and_release_notes`

## 6. 返回格式

```json
{
  "runId":"...",
  "status":"completed_with_actions",
  "summary":"...",
  "dataAsOf":"...",
  "sources":[],
  "warnings":[],
  "drafts":[],
  "actions":[
    {
      "id":"...",
      "level":2,
      "title":"记录付款",
      "before":{},
      "after":{},
      "confirmationRequired":true,
      "expiresAt":"..."
    }
  ]
}
```

## 7. 通用要求

- 服务端从 Session 获取身份，不接受客户端传入角色。
- 所有列表分页，所有批量操作有上限。
- 金额必须返回币种；USD 与 RMB 不得直接相加。
- 所有 API 错误不得泄露密钥、SQL 或服务器堆栈。
- 写入工具必须幂等，并保留完整审计。