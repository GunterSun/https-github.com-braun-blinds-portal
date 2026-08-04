# Codex Sprint 1 Execution Checklist

## 执行原则
Codex 必须按顺序实施，不得先制作孤立页面或使用假数据填充功能。

## Phase A — Foundation
- [ ] 读取现有数据库和迁移目录，避免重复实体。
- [ ] 建立 Customer → Project → Room → Window 外键链。
- [ ] 建立统一 `total_sixteenths` 尺寸类型和转换工具。
- [ ] 建立 English / 中文语言资源加载机制。
- [ ] 建立服务器端权限中间件和审计写入工具。
- [ ] 添加数据库迁移回滚脚本。

## Phase B — Shared Components
- [ ] DimensionInput：整数 + 空白/1–15 + `/16`。
- [ ] DimensionDisplay：整英寸不显示 0/16。
- [ ] LanguageSwitcher：保持当前页面和未保存草稿。
- [ ] AddressSnapshot。
- [ ] VersionBadge 与历史版本查看器。
- [ ] SignaturePad 响应式组件。
- [ ] CurrencyAmount：金额必须绑定币种。

## Phase C — Core Screens
- [ ] Customer 列表、搜索、详情和重复检查。
- [ ] Project 详情与地址快照。
- [ ] Room / Window 管理。
- [ ] Measurement 手机页面。
- [ ] Quote 编辑、预览、发送和版本历史。
- [ ] Invoice 编辑、PDF、发送和余额。
- [ ] 客户签名页面。
- [ ] Payment 录入和分配页面。

## Phase D — APIs
- [ ] Customer / Project / Room / Window CRUD。
- [ ] Measurement save、complete、version history。
- [ ] Quote calculate、snapshot、send、expire。
- [ ] Invoice generate、render、send、new-version。
- [ ] Signature request、view、sign、decline、revoke。
- [ ] Payment create、allocate、refund、void。
- [ ] 所有写接口支持幂等键或等价防重机制。

## Phase E — Documents and Notifications
- [ ] Quote 英文 PDF。
- [ ] Quote 中文 PDF。
- [ ] Quote 中英双语 PDF。
- [ ] Invoice 英文 PDF。
- [ ] Invoice 中文 PDF。
- [ ] Invoice 中英双语 PDF。
- [ ] 签名邀请、签署完成、付款收据模板。
- [ ] PDF 中尺寸只显示 `72"` 或 `72 5/16"`。

## Phase F — Automated Tests
- [ ] `72 + blank` → `72"`。
- [ ] `72 + 5` → `72 5/16"`。
- [ ] `72.3125` → `72 5/16"`。
- [ ] `72-5/16` → `72 5/16"`。
- [ ] Quote、Invoice、工厂/安装输出使用相同尺寸值。
- [ ] 已签 Invoice 修改时产生新版本。
- [ ] 重复签名提交不产生第二个有效签名。
- [ ] 重复 Stripe webhook 不产生第二笔付款。
- [ ] 中文和英文页面使用相同记录 ID。
- [ ] Customer 无法读取成本、利润或内部备注。

## Phase G — Manual Acceptance
- [ ] iPhone/Safari。
- [ ] Android/Chrome。
- [ ] iPad。
- [ ] Desktop Safari/Chrome。
- [ ] 中文模式完整操作真实订单。
- [ ] 英文模式完整操作同一真实订单。
- [ ] 客户从短信或邮件打开签名链接并完成签署。
- [ ] PDF 非空、字体清晰、金额和签名完整。

## 完成定义
只有当代码、迁移、测试、真实订单验收和 staging 部署均完成时，才可以把 Sprint 1 标记为完成。PR 合并本身不等于部署上线。
