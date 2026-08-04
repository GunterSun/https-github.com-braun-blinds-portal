# BRN-016 Workflow Engine — 架构与数据

## 1. 架构

```text
业务事件 / 定时任务 / 人工操作
          ↓
Event Ingestion
          ↓
Workflow Orchestrator
          ↓
权限、条件与审批检查
          ↓
业务动作适配器
          ├── Orders
          ├── Quotes / Invoices
          ├── Payments
          ├── Factory
          ├── Logistics
          ├── Installation
          ├── Notifications
          └── AI Drafts
          ↓
统一数据库与审计日志
```

流程引擎不得直接自由修改数据库，所有动作必须调用现有业务服务。

## 2. 数据表

### workflow_definitions

- `id`
- `code`：例如 `ORDER_STANDARD_V1`
- `name_zh` / `name_en`
- `version`
- `status`：draft / active / paused / retired
- `trigger_type`
- `definition_json`
- `created_by`
- `created_at` / `updated_at`

已启动的运行必须固定使用启动时版本，模板升级不得静默改变进行中的订单。

### workflow_runs

- `id`
- `workflow_definition_id`
- `workflow_version`
- `entity_type`
- `entity_id`
- `order_id`（适用时）
- `status`：pending / running / waiting_approval / completed / failed / cancelled
- `current_step_key`
- `started_at`
- `completed_at`
- `last_error`
- `correlation_id`

### workflow_steps

- `workflow_run_id`
- `step_key`
- `step_type`
- `status`
- `attempt_count`
- `input_json`
- `output_json`
- `scheduled_at`
- `started_at`
- `completed_at`
- `error_code`
- `error_message`

### workflow_approvals

- `workflow_run_id`
- `step_id`
- `requested_role`
- `requested_user_id`（可空）
- `status`：pending / approved / rejected / expired
- `preview_json`
- `approved_by`
- `approved_at`
- `expires_at`

### workflow_events

- `event_id`：全局唯一，防止重复消费
- `event_type`
- `entity_type`
- `entity_id`
- `payload_json`
- `source`
- `occurred_at`
- `processed_at`
- `status`

### workflow_schedules

保存逾期提醒、安装前提醒等计划任务。每个计划任务必须有唯一幂等键。

## 3. 幂等与并发

- 外部事件必须携带或生成唯一 `event_id`。
- 写操作必须使用 `idempotency_key`。
- 同一订单的互斥关键步骤使用数据库锁或乐观版本号。
- Stripe webhook 重复发送不得产生重复付款。
- Tracking 更新重复到达不得重复通知客户。
- 重试必须复用原动作身份，不得创建新业务对象。

## 4. 状态机

每种业务对象拥有自己的合法状态转换表。流程引擎只能调用合法转换：

- Order：draft → confirmed → production → ready_to_ship → shipped → installation → completed
- Invoice：draft → issued → partial → paid / overdue / void
- Factory Job：draft → sent → acknowledged → production → completed → shipped
- Shipment：draft → quoted → label_purchased → in_transit → delivered / exception
- Installation：draft → scheduled → confirmed → in_progress → completed / rescheduled

禁止跳过必要审批或直接写入任意状态。

## 5. 失败与恢复

- 可重试错误使用指数退避和最大次数。
- 不可重试错误进入人工处理队列。
- 多步骤写入使用事务；无法跨系统事务时采用补偿动作。
- 流程暂停后保留上下文，继续时重新校验权限和业务条件。
- AI、邮件或物流服务不可用时，订单核心页面仍正常工作。

## 6. 安全

- Session 与角色由服务端读取，客户端不得声明权限。
- 工作流模板仅 Owner 可启停和版本升级。
- 高风险步骤使用一次性审批 token，并绑定用户、对象、动作与过期时间。
- 日志不得保存密码、API 密钥、完整信用卡信息或 Session token。
- 来自 Excel、PDF、邮件和备注的文本均视为数据，不能改变流程定义。
