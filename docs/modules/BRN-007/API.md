# BRN-007 Installation Operations — API 规范

Base path: `/api/v4/installations`

## 主要接口
- `GET /`：按日期、状态、安装工、订单和地区筛选任务。
- `POST /`：创建安装任务草稿。
- `GET /{id}`：读取任务、分配、时间轴、照片、签字和异常。
- `PATCH /{id}`：修改允许字段；已开始任务的关键字段需更高权限。
- `POST /{id}/assignments`：分配安装工或团队。
- `POST /{id}/reschedule`：改期并记录原因。
- `POST /{id}/status`：受控状态变更。
- `POST /{id}/media`：上传前、中、后或异常照片。
- `POST /{id}/signature`：保存客户签字与确认信息。
- `POST /{id}/issues`：创建异常或返工事项。
- `POST /{id}/complete-preview`：预览完成条件、余额和缺失资料。
- `POST /{id}/complete`：人工确认后完成任务。

## 状态机
`draft → scheduled → assigned → en_route → arrived → in_progress → completed`

其他状态：`paused`、`rescheduled`、`cancelled`、`incomplete`、`follow_up_required`。

## API 原则
- 所有写接口支持 `Idempotency-Key`。
- 服务端执行角色和任务归属校验，不能只依靠前端隐藏按钮。
- 完成接口必须验证照片、签字或异常说明等配置条件。
- 地址、电话、欠款等敏感字段按角色裁剪返回。
- GPS 字段默认不采集；采集时必须附带用户授权和时间范围。
- 文件上传使用签名 URL、安全扫描、大小和类型限制。
- 所有状态、分配、改期、签字和完成操作写入审计日志。
