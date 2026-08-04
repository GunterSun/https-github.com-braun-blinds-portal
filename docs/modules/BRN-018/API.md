# BRN-018 Computer Use Agent API 规范

## 1. 创建任务
### `POST /api/v4/computer-agent/tasks`
请求包含任务模板、订单号、目标网站和允许的目标。服务端从 Session 获取用户身份和角色。

返回：任务 ID、风险等级、允许动作和初始状态。

## 2. 获取任务
### `GET /api/v4/computer-agent/tasks/[taskId]`
返回当前步骤、已完成动作、下一步、等待确认内容、错误和审计摘要。响应按角色裁剪敏感字段。

## 3. 启动与暂停
- `POST /api/v4/computer-agent/tasks/[taskId]/start`
- `POST /api/v4/computer-agent/tasks/[taskId]/pause`
- `POST /api/v4/computer-agent/tasks/[taskId]/resume`
- `POST /api/v4/computer-agent/tasks/[taskId]/cancel`
- `POST /api/v4/computer-agent/emergency-stop`

紧急停止仅 Owner 可全局执行；任务发起人可停止自己的任务。

## 4. 生成确认预览
### `POST /api/v4/computer-agent/tasks/[taskId]/prepare-action`
返回：
- 目标网站与账户标识
- 动作类型
- 订单和业务对象
- 表单字段摘要
- 金额和币种
- 风险提示
- 页面关键内容哈希
- 一次性确认令牌
- 令牌过期时间

此接口不得执行外部提交。

## 5. 确认执行
### `POST /api/v4/computer-agent/tasks/[taskId]/confirm-action`
请求携带一次性确认令牌和幂等键。服务端重新验证用户、权限、页面状态、字段、金额和令牌有效期后才可执行。

## 6. 上传和下载
- `POST /api/v4/computer-agent/tasks/[taskId]/files`
- `GET /api/v4/computer-agent/tasks/[taskId]/downloads`

文件必须经过类型、大小和安全检查。下载的运单标签应保存文件哈希并关联订单、Shipment 和 Tracking。

## 7. 结果回写
### `POST /api/v4/computer-agent/tasks/[taskId]/commit-result`
将已验证的外部结果通过门户业务 API 写入，例如承运商、服务、报价、最终费用、Tracking、标签文件和预计到货日期。

禁止把网页任意字段直接写入财务表。

## 8. 站点和模板管理
Owner 专用：
- `GET/POST /api/v4/computer-agent/sites`
- `PATCH /api/v4/computer-agent/sites/[siteId]`
- `GET/POST /api/v4/computer-agent/templates`
- `PATCH /api/v4/computer-agent/templates/[templateId]`

模板定义允许域名、页面、输入字段、动作顺序、风险等级、审批角色和禁止动作。

## 9. 审计
### `GET /api/v4/computer-agent/tasks/[taskId]/audit`
仅返回用户有权查看的审计信息。密码、Cookie、Token、CVV 和完整支付资料永不返回。

## 10. 通用要求
- 所有写操作支持幂等键。
- 所有接口执行服务端权限校验。
- 不接受客户端传入角色或绕过风险等级。
- 错误响应不得泄露凭据、浏览器内部状态或服务器堆栈。
- 外部操作结果不确定时返回 `unknown`，不能返回 `success`。