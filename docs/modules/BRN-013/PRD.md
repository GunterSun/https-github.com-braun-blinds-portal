# BRN-013 User / Role / Permission Center — 产品需求

## 1. 目标

建立 Braun Smart Portal 的统一账号、角色和权限中心。所有网页、API、AI 助理、AI Agent、Workflow、导入、财务、物流、工厂和安装功能必须使用同一权限服务，不允许各模块自行实现一套权限。

## 2. 固定角色

- Owner：公司最高管理权限，可管理用户、角色、审批、财务、发布和审计。
- Sales：仅管理被授权的客户、报价、订单、Invoice 和客户沟通。
- Factory：仅查看和更新分配给所属工厂的生产、采购、质检和发货任务。
- Installer：仅查看和更新分配给本人或所属团队的安装任务。
- Customer：仅查看明确共享给自己的 Quote、Invoice、付款入口、订单进度和 Tracking。

可增加受控自定义角色，但不能删除 Owner 的核心保护规则，也不能让自定义角色绕过数据范围。

## 3. 权限模型

权限由三部分共同决定：

1. `action`：view、create、edit、approve、send、export、delete、refund、manage。
2. `resource`：customer、order、quote、invoice、payment、expense、factory、shipment、installation、inventory、user、release、ai 等。
3. `scope`：all、assigned、team、factory、self、customer-owned、shared-only。

前端隐藏按钮不是权限控制。所有 API 和后台任务必须在服务器重新校验。

## 4. 账号生命周期

- 邀请：Owner 或被授权管理员发送一次性邀请。
- 激活：用户设置密码并完成必要的双重验证。
- 正常：按角色和数据范围访问。
- 暂停：立即禁止新登录并撤销活动会话。
- 离职/终止：禁用账号、转移未完成任务并保留历史审计。
- 删除：原则上软删除；涉及业务记录的用户不得物理删除。

## 5. 登录与安全

- Owner 和高风险权限用户必须支持双重验证。
- 支持会话过期、设备列表、远程退出和密码重置。
- 登录失败、异常地点、权限提升和密钥操作产生安全日志。
- 禁止多人共用一个账号。
- API Key、Webhook 和 Agent 使用服务身份，不冒充真实员工。

## 6. 数据范围

- Sales 默认只能访问分配给自己的客户和订单。
- Factory 只能访问所属工厂被分配的任务，不能查看客户售价、利润和其他工厂资料。
- Installer 只能访问分配任务所需的地址、电话、产品和安装说明，不能查看内部成本。
- Customer 不能查看批发价、工厂成本、利润、内部备注和其他客户资料。
- Owner 可配置临时授权，并设置到期时间。

## 7. 高风险操作

以下操作要求更严格权限，并记录原因：

- 修改角色和数据范围
- 导出客户或财务数据
- 删除或合并正式记录
- 退款、锁账调整和付款撤销
- 修改 Stripe、银行、部署、域名或 API 密钥
- 批量导入、批量修改和批量发送消息

## 8. 页面

- `/settings/users`：用户列表、邀请、状态和最近登录。
- `/settings/roles`：角色和权限矩阵。
- `/settings/access-reviews`：定期权限复核。
- `/settings/security`：双重验证、会话、设备和安全事件。
- `/audit/access`：权限变更与拒绝访问记录。

## 9. 完成标准

- 五级角色均通过服务器端权限测试。
- 所有核心模块使用同一权限服务。
- 禁用用户后现有会话立即失效。
- 权限提升、临时授权和导出均可审计。
- AI 和自动化不能绕过当前用户权限。
- Customer、Factory 和 Installer 无法读取内部财务或利润字段。
