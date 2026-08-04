# Invoice 客户签名功能要求

## 范围
BRN-004 Quote / Invoice / Payment Center 增加客户电子签名，用于确认 Invoice、项目范围、产品配置、金额和付款条件。

## 签名流程
1. Invoice 必须先生成不可变版本（invoice_version）。
2. 客户通过安全链接或 Customer Portal 打开待签 Invoice。
3. 客户签名前必须看到完整 Invoice、条款、金额、币种、订单号和版本号。
4. 支持手写签名板；移动端支持手指签名，电脑端支持鼠标或触控笔。
5. 客户填写签名姓名，并勾选“我已阅读并同意此 Invoice 和条款”。
6. 签署后保存签名图片、签名姓名、签署时间、时区、Invoice 版本、文档 SHA-256、IP 哈希、用户代理和认证方式。
7. 已签署版本不得覆盖或修改；任何金额、产品、地址或条款变更必须新建 Invoice 版本并重新签署。
8. PDF 中显示客户签名、打印姓名、签署日期、Invoice 版本和验证编号。
9. 支持客户拒签并填写原因；拒签不会删除原 Invoice。
10. Owner 可作废签署流程，但不能删除已完成的签名记录。

## 数据模型
新增：
- `invoice_signature_requests`: id, invoice_id, invoice_version_id, signer_customer_id, signer_email, token_hash, status, expires_at, sent_at, viewed_at, signed_at, declined_at
- `invoice_signatures`: id, request_id, invoice_version_id, signer_name, signature_file_id, consent_text_version, signed_at, timezone, document_sha256, verification_code, auth_method, ip_hash, user_agent_hash
- `invoice_signature_events`: request_id, event_type, occurred_at, actor_type, metadata_json

## API
- `POST /api/v4/invoices/{id}/signature-requests`
- `GET /api/v4/invoice-signatures/{token}`
- `POST /api/v4/invoice-signatures/{token}/sign`
- `POST /api/v4/invoice-signatures/{token}/decline`
- `POST /api/v4/invoice-signatures/{request_id}/void`
- `GET /api/v4/invoices/{id}/signature-status`

## 安全和权限
- 签名链接使用一次性随机令牌，数据库只保存哈希，并设置有效期。
- 签名前再次核对客户身份；高金额或敏感订单可要求登录或邮箱验证码。
- 签名文件为私有文件，Customer 只能访问自己的 Invoice。
- 所有查看、签署、拒签、作废和下载操作写入审计日志。
- AI、Workflow 和员工不能代替客户生成签名。

## 验收测试
- iPhone、Android、iPad、Mac 和 Windows 可完成签名。
- 签名后修改 Invoice 必须生成新版本，旧签名保持可验证。
- 重复点击签署不会产生多条有效签名。
- 过期、作废或已使用令牌不能再次签署。
- PDF 签名页内容完整且非空白。
- Customer A 无法访问 Customer B 的签名链接或 Invoice。
