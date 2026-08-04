# BRN-014 Business Intelligence — 架构与指标定义

## 1. 架构原则

经营分析只读取统一业务数据库和经过审核的正式记录。Excel 暂存区、失败导入、演示数据和已回滚记录不得进入正式 KPI。

```text
Orders / Quotes / Invoices / Payments
Factory Jobs / Expenses / Shipments / Installations
                    ↓
          Metric Definition Layer
                    ↓
      Aggregation / Cache / Data Quality
                    ↓
 Dashboard / Reports / AI Business Tools
```

## 2. 指标定义层

每个指标必须定义：

- 唯一代码
- 中文和英文名称
- 业务含义
- 数据来源表
- 过滤条件
- 计算公式
- 币种规则
- 时间字段
- 权限范围
- 更新时间
- 可下钻目标

禁止在不同页面重复编写不同口径的“销售额”“已付款”或“利润”公式。

## 3. 关键口径

### booked_sales

已确认订单的 `grand_total`，不包含草稿和取消订单。按订单确认日期统计。

### invoiced_amount

有效 Invoice 总额，不包含 void/cancelled；调整单和退款按正式记录计入。

### collected_amount

有效付款减有效退款。Stripe 状态以验证后的 webhook 和内部对账结果为准。

### accounts_receivable

有效 Invoice 总额减有效付款和退款后的余额。不得简单使用手工状态字段代替金额计算。

### usd_expense / rmb_expense

按原币分别汇总有效支出。void、rolled_back 和未审核导入不计入。

### gross_profit

默认分别展示：USD 收入、USD 成本、RMB 成本。只有在明确汇率存在时才生成折算利润，并保存汇率版本。

### on_time_factory_rate

在承诺日期前完成的工厂任务数 / 有明确承诺日期且已完成的任务数。

### installation_completion_rate

已完成且具备必需照片/签字的任务数 / 到期安装任务数。

## 4. 数据质量

仪表盘需要显示：

- 缺失币种记录数
- 缺失汇率记录数
- 未关联订单的付款或支出
- 重复 Invoice/Tracking 风险
- 待审核导入行数
- 最后成功聚合时间

数据不完整时必须在指标旁显示警告，不得用 0 掩盖缺失。

## 5. 聚合与缓存

- 实时业务详情查询使用事务数据库。
- 高频汇总可以使用物化视图或聚合表。
- 缓存必须带 `data_as_of` 和版本。
- 付款、退款、订单总额或支出变更后触发相关指标失效。
- 聚合失败时保留上次成功数据并显示“数据截止时间”，不得静默展示为最新。

## 6. 权限与字段裁剪

权限必须在服务端聚合前或查询层执行，不能只依赖前端隐藏。Sales、Factory、Installer 的汇总范围必须与其订单分配一致。

## 7. 审计与复算

指标定义变更需要版本号和变更记录。历史报表应保存当时使用的指标版本、筛选条件和汇率，以支持复算和审计。

## 8. 性能目标

- 驾驶舱首屏目标 3 秒内返回。
- 常用日期范围使用预聚合。
- 明细下钻必须分页，单次最大 100 条。
- 大型导出采用异步任务，并记录生成状态。

## 9. 安全

禁止通过 BI 接口返回密钥、完整支付卡信息、密码、Session、内部系统凭据或未授权客户数据。