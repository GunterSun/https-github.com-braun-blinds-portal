# BRN-019 — 架构与数据质量

## 1. 组件

- Release Registry：版本、BRN、PR、提交和负责人。
- Environment Registry：development、staging、production。
- Test Runner：单元、集成、端到端和人工验收。
- Deployment Tracker：构建、部署、迁移、DNS 和健康检查。
- Data Quality Engine：只读扫描、问题分级和修复建议。
- Backup & Rollback Registry：备份、恢复点和回滚结果。
- Audit Log：操作者、时间、环境、输入、输出和错误。

## 2. 核心实体

- `release_versions`
- `release_changes`
- `release_approvals`
- `deployment_runs`
- `migration_runs`
- `test_runs`
- `test_results`
- `data_quality_rules`
- `data_quality_findings`
- `backup_snapshots`
- `rollback_runs`

所有实体必须保存环境、状态、创建人、执行人、时间和关联提交。

## 3. 数据质量等级

- Critical：可能造成金额、权限或正式数据损坏，阻止发布。
- High：订单、付款、币种或客户关联错误，默认阻止发布。
- Medium：数据缺失或状态不一致，需要确认。
- Low：格式、备注或非关键资料问题，不阻止发布。

## 4. 发布闸门

生产发布前必须通过：

- 主分支构建成功。
- 数据库迁移可执行且有回滚方案。
- Critical/High 数据问题为 0，或有 Owner 签字豁免。
- 权限、付款、Invoice、Excel 导入、USD/RMB 测试通过。
- staging 已部署并通过验收。
- 有可用备份和恢复验证。

## 5. 安全原则

- 测试环境不得使用生产密钥。
- 日志不得保存密码、完整信用卡信息或 API 密钥。
- 自动扫描默认只读。
- 数据修复必须生成变更预览和审计记录。
- 生产回滚必须二次确认并显示影响范围。
- AI 只能解释问题、生成测试和修复草稿，不能自行批准生产发布。

## 6. 故障处理

- 构建失败：停止部署，保留日志。
- 迁移失败：停止流量切换，按迁移计划恢复。
- 健康检查失败：自动标记失败，不得报告上线成功。
- 部分服务失败：显示 degraded，并允许回滚。
- DNS 未生效：代码部署与域名状态分别显示。
