# Sprint 1 — Order Lifecycle Code Implementation Plan

## 目标
交付第一条可以用真实订单验收的业务闭环：Customer → Project → Room → Window → Measurement → Quote → Invoice → Signature → Payment。

## 锁定标准
- 全部页面支持 English / 中文。
- 所有英寸尺寸使用“整数英寸 + 可选 1–15/16”；0/16 不显示。
- 数据库尺寸以整数 sixteenths 保存，禁止浮点数作为真实值。
- Quote、Invoice、签名文档必须版本化且可追溯。
- 同一客户、项目、窗位和订单只保存一份主数据。
- 页面不得使用演示数据或静态 KPI 冒充真实数据。

## 实施顺序

### S1-01 数据库迁移
建立或确认：
- customers
- customer_contacts
- projects
- project_addresses
- rooms
- windows
- measurements
- measurement_values
- quotes / quote_versions / quote_lines
- invoices / invoice_versions / invoice_lines
- signature_requests / signatures / signature_events
- payments / payment_allocations
- audit_events

关键约束：
- Window 必须属于 Room，Room 必须属于 Project。
- measurement_values 保存 `whole_inches`、`fraction_sixteenths` 与标准化 `total_sixteenths`。
- `fraction_sixteenths=0` 在 UI/PDF 中为空白。
- 已发送 Quote 和已签 Invoice 版本不可原地覆盖。

### S1-02 共用尺寸组件
开发一个全系统复用的 DimensionInput：
- 整数输入框。
- 分数下拉为空白、1–15，右侧固定显示 `/16`。
- 空白分数表示 0/16。
- 支持键盘 Tab、Enter 和手机触控。
- 支持解析历史小数、`72-5/16`、`72 5/16` 和厘米。
- 统一格式化为 `72"` 或 `72 5/16"`。

必须复用于：测量、Quote、Invoice、订单、工厂单和安装单。

### S1-03 Customer / Project / Room / Window
- 客户搜索、新建、编辑和重复检查。
- 项目类型、地址快照和多联系人。
- 房间排序和自定义名称。
- 窗位编号 W01、W02……，支持照片和备注。
- 中英文切换不复制记录、不改变 ID。

### S1-04 Measurement
- Inside / Outside Mount。
- Width、Height、Depth。
- 左/中/右及上/中/下多点测量。
- 原始尺寸、规则调整、成品尺寸分开保存。
- 每次修改生成测量版本和审计事件。
- 缺少必要尺寸时禁止完成。

### S1-05 Quote
- 从 Window 产品配置生成 Quote。
- Quote 有生效日期、失效日期和版本号。
- 产品图片、面料、颜色、控制方式、尺寸和安装方式可显示给客户确认。
- Braun/Jin/KT 价格必须调用统一 Calculation Engine 接口，不在页面重复计算。
- 客户版本隐藏内部成本和利润。

### S1-06 Invoice
- 五位数 Invoice 编号。
- 一页式优先，内容过多时允许多页。
- Deposit、Progress Payment、Balance Due。
- PDF 生成后必须验证非空、金额一致和尺寸格式正确。
- 支持英文、中文和中英双语 PDF。

### S1-07 Customer Signature
- 生成一次性签名链接和有效期。
- 支持手机手指、鼠标和触控笔。
- 保存签名姓名、时间、时区、Invoice 版本、文档 SHA-256 和验证编号。
- 已签版本修改后必须新建版本并重新签署。
- 员工、AI 和 Workflow 不得代替客户签名。

### S1-08 Payment
- Stripe、Zelle、Check、Cash、ACH、Wire。
- 定金、部分付款、多笔付款、退款和撤销。
- 付款分配必须更新 Invoice balance，但不得覆盖原付款记录。
- Stripe webhook 验签、幂等和重复事件拦截。

### S1-09 Bilingual
- 所有文字来自语言资源，不得硬编码。
- 用户保存默认语言。
- 页面切换语言不丢失草稿。
- PDF、邮件、签名邀请和收据按收件人语言生成。
- Shutters 固定为“百叶窗”；Blinds 固定为“百叶帘”。

### S1-10 权限与审计
- Owner：全部。
- Sales：分配范围内客户、项目、Quote 和 Invoice。
- Customer：只查看明确共享的 Quote、Invoice、签名和付款状态。
- 所有写入在服务器端校验权限。
- 创建、修改、发送、签署、付款、退款和语言切换关键事件写入审计。

## 端到端验收订单
使用一张真实订单完成：
1. 建立客户和项目。
2. 建立两个房间与多个 Window。
3. 输入含整英寸和分数的尺寸，例如 `72"`、`72 5/16"`。
4. 生成中英文 Quote。
5. 生成 Invoice 并发送签名链接。
6. 客户在手机签名。
7. 录入定金和尾款。
8. 验证余额、PDF、审计、权限和语言切换。

## 发布闸门
以下任一失败不得发布：
- 尺寸跨模块不一致。
- 出现 `0/16`、长小数或浮点误差。
- 已签 Invoice 可被直接修改。
- 中文或英文缺失。
- Customer 能看到内部成本或利润。
- PDF 空白或金额与数据库不一致。
- 重复 webhook 产生重复付款。
