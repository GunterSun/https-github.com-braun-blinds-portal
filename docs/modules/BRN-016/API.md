# BRN-016 Workflow Engine — API 规范

## 1. 通用要求

- API 前缀：`/api/v4/workflows`。
- 所有接口要求有效 Session 和服务端权限检查。
- 所有写操作必须支持幂等键并写审计日志。
- 错误不得泄露 SQL、密钥或服务器堆栈。
- 流程接口不得直接接受客户端传入的角色或审批人身份。

## 2. 模板

### GET `/api/v4/workflows/definitions`

返回当前用户可查看的流程模板、版本和启停状态。

### POST `/api/v4/workflows/definitions`

仅 Owner 创建草稿模板。模板必须通过结构校验、动作白名单和权限检查。

### POST `/api/v4/workflows/definitions/[id]/activate`

仅 Owner 激活新版本。激活前返回影响预览，不修改已运行实例。

### POST `/api/v4/workflows/definitions/[id]/pause`

暂停新实例触发，不自动终止已运行实例。

## 3. 运行实例

### POST `/api/v4/workflows/runs`

人工启动一个允许的流程。

请求至少包含：

- `workflowCode`
- `entityType`
- `entityId`
- `idempotencyKey`

### GET `/api/v4/workflows/runs`

支持按订单号、状态、模板、日期和异常筛选，并按角色过滤。

### GET `/api/v4/workflows/runs/[runId]`

返回运行时间线、步骤、审批、重试和错误。敏感输入输出按角色裁剪。

### POST `/api/v4/workflows/runs/[runId]/pause`

Owner 或授权负责人暂停。

### POST `/api/v4/workflows/runs/[runId]/resume`

继续前必须重新检查对象状态、权限和前置条件。

### POST `/api/v4/workflows/runs/[runId]/cancel`

取消未完成步骤；已执行业务动作不得静默撤销，必须显示补偿要求。

## 4. 步骤与重试

### POST `/api/v4/workflows/runs/[runId]/steps/[stepId]/retry`

仅对可重试失败开放。重复调用不得产生重复 Invoice、付款、任务、运单或消息。

### POST `/api/v4/workflows/runs/[runId]/steps/[stepId]/skip`

仅 Owner，可跳过的步骤必须在模板中明确标记；财务、权限和必要合规步骤禁止跳过。

## 5. 审批

### GET `/api/v4/workflows/approvals`

返回当前用户有权处理的待审批事项。

### POST `/api/v4/workflows/approvals/[approvalId]/approve`

请求包含一次性确认 token。服务端重新计算预览并检查对象是否变化。

### POST `/api/v4/workflows/approvals/[approvalId]/reject`

必须保存拒绝理由。

审批预览应包含：

- 对象和订单号
- 动作
- 修改前后值
- 金额与币种
- 接收人（如发送消息）
- 影响范围
- 到期时间

## 6. 业务事件

### POST `/api/v4/workflows/events`

仅内部服务或验证过签名的集成调用。事件必须有唯一 `eventId`。

支持事件示例：

- `quote.accepted`
- `invoice.issued`
- `payment.received`
- `factory.completed`
- `shipment.in_transit`
- `shipment.delivered`
- `shipment.exception`
- `installation.completed`

外部 webhook 必须先由对应集成接口验证签名，再转换为内部事件。

## 7. 订单时间线

### GET `/api/v4/orders/[orderNumber]/workflow`

返回该订单相关流程、当前步骤、等待审批、异常和下一步建议。

## 8. 定时规则

### GET `/api/v4/workflows/schedules`

仅 Owner 查看全局；普通角色只查看与自己任务相关的计划。

### PATCH `/api/v4/workflows/schedules/[id]`

Owner 调整提醒时间、启停和负责人。不得通过此接口创建高于每小时频率的外部检查。

## 9. AI Agent 集成

AI Agent 只能调用：

- 查询运行状态
- 生成流程启动建议
- 生成步骤草稿
- 创建审批请求

AI 不得直接调用审批通过接口，也不得持有 Owner 确认 token。
