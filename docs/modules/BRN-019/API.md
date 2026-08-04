# BRN-019 — API 规范

所有接口仅允许授权内部用户访问，并在服务器端执行权限检查。

## Releases

- `GET /api/v4/releases`
- `POST /api/v4/releases`
- `GET /api/v4/releases/{releaseId}`
- `POST /api/v4/releases/{releaseId}/approve`
- `POST /api/v4/releases/{releaseId}/promote`

`promote` 必须指定目标环境，并验证上一环境已通过。

## Tests

- `POST /api/v4/releases/{releaseId}/test-runs`
- `GET /api/v4/test-runs/{runId}`
- `POST /api/v4/test-runs/{runId}/manual-results`

人工验收结果必须保存测试项、结果、测试人、时间、证据和备注。

## Deployments

- `POST /api/v4/releases/{releaseId}/deployments`
- `GET /api/v4/deployments/{deploymentId}`
- `POST /api/v4/deployments/{deploymentId}/verify`
- `POST /api/v4/deployments/{deploymentId}/cancel`

创建生产部署必须携带 Owner 审批编号。接口返回代码、构建、数据库、应用和域名的独立状态。

## Data health

- `POST /api/v4/data-quality/scans`
- `GET /api/v4/data-quality/scans/{scanId}`
- `GET /api/v4/data-quality/findings`
- `POST /api/v4/data-quality/findings/{findingId}/resolve-draft`
- `POST /api/v4/data-quality/findings/{findingId}/apply`

`apply` 必须包含预览版本、幂等键和 Owner 确认；默认禁止批量静默修改。

## Backup and rollback

- `POST /api/v4/backups`
- `GET /api/v4/backups/{backupId}`
- `POST /api/v4/releases/{releaseId}/rollback-preview`
- `POST /api/v4/releases/{releaseId}/rollback`

回滚接口必须验证备份可用、显示影响对象、要求二次确认，并保存执行日志。

## 通用要求

- 所有写入接受 `Idempotency-Key`。
- 状态冲突返回 `409`，权限不足返回 `403`。
- 任何失败不得返回成功状态。
- 响应包含 `environment`、`status`、`startedAt`、`finishedAt` 和 `auditId`。
- 敏感字段在响应和日志中脱敏。
