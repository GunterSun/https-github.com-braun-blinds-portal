# Braun Smart Portal V1 Implementation Plan

## 目标
把项目从规划阶段转入可运行、可测试、可部署的 V1，实现真实客户、真实产品、真实价格和真实订单的完整闭环。

## V1 必须上线的 10 个模块
1. Customer / CRM
2. Project / Room / Window
3. Product & Pricing
4. Mobile Measurement
5. Quote
6. Invoice & Payment
7. Factory / Purchasing
8. Logistics
9. Installation
10. AI Assistant

## 核心业务链路
Customer → Project → Room → Window → Product Configuration → Quote → Invoice → Payment → Factory → Shipment → Installation → Warranty

## 开发比例
- 80%：实现、数据迁移、真实业务测试、修复和部署。
- 20%：新规划和高级 AI 能力。

## 第一阶段：数据库与权限
- 建立统一数据库。
- 建立 Owner、Sales、Factory、Installer、Customer 五级权限。
- 建立 Customer、Project、Room、Window、Product、Quote、Invoice、Payment、Factory、Shipment、Installation 核心实体。
- 禁止演示数据进入 production。

## 第二阶段：真实产品与价格
优先导入：
- Drapery
- Roman Shade
- Roller Shade
- Zebra Shade
- Honeycomb Shade
- Shutters
- Blinds
- Curtain Rod
- Motorized Track
- Hardware

价格来源：
- Braun Retail
- Braun Wholesale
- Jin
- KT
- Dealer A/B/C
- Project / Builder / Hotel

所有价格必须带版本、有效期、币种和来源。

## 第三阶段：真实业务流程
- 现场测量按 Room / Window 保存。
- Quote 锁定产品、选项、尺寸和价格规则版本。
- Invoice 支持 Deposit、Partial Paid、Paid、Refund。
- 一个订单可关联多个工厂、多个付款、多个包裹和多次安装。
- USD 与 RMB 分开保存和汇总。

## 第四阶段：测试环境
必须使用真实匿名样本测试：
- 一个普通住宅订单。
- 一个含多房间、多窗位的订单。
- 一个 Shutters 订单。
- 一个 Blinds 订单。
- 一个双层 Roman Shade 订单。
- 一个多工厂、多币种订单。
- 一个多箱超长物流订单。
- 一个部分付款后安装的订单。

## 第五阶段：上线闸门
上线前必须满足：
- 关键计算与原 Excel 对照一致。
- Quote / Invoice PDF 非空且金额正确。
- 权限无法通过 URL 或 API 绕过。
- Stripe、物流和通知失败时不显示成功。
- 数据迁移可回滚。
- staging 通过后才允许 production。
- 正式域名实际登录和核心流程验证完成。

## 非 V1 必需
以下能力保留为后续阶段，不阻塞 V1：
- AI Design Studio
- Computer Use Agent 全自动操作
- Dealer Marketplace
- 高级知识图谱
- 工厂数字孪生
- 自动物流购买

## 完成定义
V1 完成不等于代码合并。必须同时满足：代码合并、数据库迁移、staging 验收、production 部署、正式域名验证和真实订单测试。