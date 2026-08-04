# BRN-013 — 数据模型

## 1. 核心实体

### `users`

- `id`
- `email`（唯一、规范化）
- `display_name`
- `phone`
- `status`：invited / active / suspended / disabled
- `locale`：zh-CN / en-US
- `mfa_required`
- `last_login_at`
- `created_at` / `updated_at`

### `roles`

- `id`
- `code`：owner / sales / factory / installer / customer / custom
- `name`
- `is_system`
- `status`

### `permissions`

- `id`
- `resource`
- `action`
- `description`
- 唯一键：`resource + action`

### `role_permissions`

- `role_id`
- `permission_id`
- `effect`：allow / deny
- 唯一键：`role_id + permission_id`

### `user_roles`

- `user_id`
- `role_id`
- `scope_type`：all / assigned / team / factory / self / customer-owned / shared-only
- `scope_id`（可空）
- `starts_at` / `expires_at`
- `granted_by`
- `reason`

### `resource_assignments`

用于将用户或团队分配给客户、订单、工厂任务、物流或安装任务。

- `resource_type`
- `resource_id`
- `principal_type`：user / team / factory / customer_account
- `principal_id`
- `assignment_role`
- `starts_at` / `ends_at`

### `sessions`

- `id`
- `user_id`
- `device_name`
- `ip_hash`
- `user_agent`
- `created_at`
- `last_seen_at`
- `expires_at`
- `revoked_at`

### `mfa_methods`

- `user_id`
- `type`：totp / security_key / recovery_code
- `status`
- `verified_at`
- 加密后的必要密钥材料

### `service_identities`

用于 AI、Workflow、Webhook、导入和后台任务。

- `id`
- `name`
- `service_type`
- `status`
- `allowed_scopes`
- `credential_version`
- `last_used_at`

服务身份必须记录触发用户或触发事件，不能无来源操作业务数据。

### `access_audit_logs`

- `actor_type`：user / service
- `actor_id`
- `action`
- `resource_type`
- `resource_id`
- `decision`：allowed / denied
- `reason_code`
- `request_id`
- `ip_hash`
- `created_at`

### `permission_change_logs`

- 修改前权限快照
- 修改后权限快照
- 操作人
- 审批人（如适用）
- 原因
- 时间

## 2. 约束

- 至少保留一个 active Owner，系统不得禁用最后一个 Owner。
- 同一用户的有效角色授权不得产生冲突的重复记录。
- 临时权限必须包含 `expires_at`。
- `deny` 优先于 `allow`。
- 用户被 suspended 或 disabled 后，所有未撤销会话立即失效。
- 业务记录引用的用户不得物理删除。

## 3. 索引

- `users(normalized_email)` 唯一索引
- `user_roles(user_id, role_id, expires_at)`
- `resource_assignments(resource_type, resource_id)`
- `resource_assignments(principal_type, principal_id)`
- `access_audit_logs(actor_id, created_at)`
- `access_audit_logs(resource_type, resource_id, created_at)`

## 4. 数据保留

- 权限和安全日志按照公司政策长期保留。
- 密码、MFA 密钥和令牌不得明文保存。
- 日志不得保存完整密码、Stripe 密钥、银行信息或原始会话令牌。
