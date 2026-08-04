# BRN-013 — API 规范

基础路径：`/api/v4`

## 1. 用户

- `GET /users`
- `POST /users/invitations`
- `GET /users/{userId}`
- `PATCH /users/{userId}`
- `POST /users/{userId}/suspend`
- `POST /users/{userId}/restore`
- `POST /users/{userId}/disable`
- `POST /users/{userId}/sessions/revoke`

暂停、禁用和恢复必须包含原因。禁止禁用最后一个 active Owner。

## 2. 角色与权限

- `GET /roles`
- `POST /roles`
- `GET /roles/{roleId}`
- `PATCH /roles/{roleId}`
- `GET /permissions`
- `PUT /roles/{roleId}/permissions`
- `POST /users/{userId}/role-grants`
- `DELETE /users/{userId}/role-grants/{grantId}`

角色授权请求必须包含：

- `role_id`
- `scope_type`
- `scope_id`（按范围需要）
- `starts_at`
- `expires_at`（临时权限必填）
- `reason`

## 3. 权限判断

内部统一接口：

`POST /authz/check`

```json
{
  "action": "view",
  "resource": "order",
  "resource_id": "order-id",
  "context": {
    "assigned_user_id": "user-id",
    "factory_id": "factory-id"
  }
}
```

响应：

```json
{
  "allowed": true,
  "reason_code": "ROLE_AND_SCOPE_MATCH",
  "decision_id": "audit-decision-id"
}
```

业务 API 应通过共享中间件调用权限判断，不允许客户端自行声明权限成立。

## 4. 当前用户

- `GET /me`
- `GET /me/permissions`
- `GET /me/sessions`
- `DELETE /me/sessions/{sessionId}`
- `POST /me/mfa/setup`
- `POST /me/mfa/verify`
- `POST /me/mfa/recovery-codes/regenerate`

## 5. 访问复核

- `GET /access-reviews`
- `POST /access-reviews`
- `GET /access-reviews/{reviewId}`
- `POST /access-reviews/{reviewId}/decisions`
- `POST /access-reviews/{reviewId}/complete`

定期复核应列出长期未登录用户、即将到期授权、高风险角色和无负责人账号。

## 6. 审计

- `GET /audit/access`
- `GET /audit/permission-changes`
- `GET /security/events`

导出审计记录属于高风险操作，需要 Owner 权限并记录导出范围。

## 7. 服务身份

- `GET /service-identities`
- `POST /service-identities`
- `POST /service-identities/{id}/rotate-credential`
- `POST /service-identities/{id}/disable`

创建和轮换凭据时，密钥只显示一次。不得通过 API 返回已有明文密钥。

## 8. 通用规则

- 所有写入使用幂等键。
- 401 表示未认证，403 表示已认证但无权限。
- 拒绝访问也必须写审计日志。
- 列表接口必须先按数据范围过滤，再分页。
- 不得先取回全部数据后仅在前端隐藏。
- AI、Agent 和 Workflow 请求必须同时携带服务身份与触发用户/事件上下文。
