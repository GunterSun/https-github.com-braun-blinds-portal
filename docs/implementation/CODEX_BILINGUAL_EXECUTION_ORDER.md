# Codex 执行顺序 — V1 中英文落地

## Sprint A：基础语言框架
1. 建立 `en`、`zh-CN` 语言资源和统一翻译函数。
2. 增加用户默认语言字段、设置页面和登录前语言选择。
3. 建立禁止硬编码文字的 lint / CI 检查。
4. 建立缺失翻译、重复键和未使用键报告。
5. 完成日期、金额、数字和尺寸的统一格式化服务。

## Sprint B：订单闭环双语
依次完成并测试：
1. Customer / Project / Room / Window
2. Measurement（整数英寸 + 可选 1–15/16，0/16 不显示）
3. Product Configurator
4. Quote
5. Invoice
6. Customer Signature
7. Payment / Receipt

每完成一页，都要在填写中途切换语言并确认数据不丢失。

## Sprint C：运营端双语
1. Factory Work Order
2. Inventory / Picking
3. Shipping / Tracking
4. Installer App
5. Warranty / After-sales

要求 Factory 和 Installer 只看到各自权限范围；语言切换不能扩大数据范围。

## Sprint D：文档与通知
1. Quote、Invoice、Receipt 三种 PDF 模式。
2. PO、工厂单、装箱单、安装单和保修卡三种 PDF 模式。
3. Email、SMS、门户通知和签名邀请的中英文模板版本管理。
4. 发送前预览、语言选择和发送日志。

## Sprint E：AI 与搜索
1. 中文、英文和混合语言意图识别。
2. 产品与业务术语别名映射。
3. AI 回答语言跟随用户设置。
4. Enterprise Search 在两种语言下返回相同记录。
5. 权限与审计回归测试。

## 必测真实流程
使用一张真实订单完成：
- 中文 Owner 创建客户与项目。
- 英文 Sales 测量并生成 Quote。
- 客户使用英文签署 Invoice。
- 中文 Factory 查看生产单。
- 英文 Installer 完成安装并取得客户完工签名。
- Owner 切回中文查看付款、物流、安装和审计时间轴。

## Definition of Done
每项任务只有同时满足以下条件才算完成：
- English 和中文页面均可操作。
- 移动端、平板、桌面均通过。
- 无硬编码界面文字。
- 无缺失翻译。
- 权限完全一致。
- 真实数据、金额、尺寸、版本和签名在两种语言下完全一致。
- 自动测试和人工验收均通过。
