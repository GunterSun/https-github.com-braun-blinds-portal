# V5.0 统一订单数据库与模块关系审计

日期：2026-10-11。关联 BRN-002、004、008、010、016。

## 审计范围及证据边界

基线：PR #301 提交 `4e2b64925d9e3a74163c3aa931586cc4997b1842`，包含 PR #300。它不是 main，也不能据此推断当前线上数据已全部符合这些声明。本次没有合并、部署或修改生产数据库。

逐表核对源码声明，并把仓库 37 个 SQL 迁移重放到空的内存 SQLite：得到 78 张业务表，与 78 个 schema 声明对应，integrity_check=ok；这些表没有声明数据库外键。字段名中的 ID 是应用层关系，不能当作数据库已强制保证引用完整性的证据。详细列、类型及约束见 [JSON 清单](SCHEMA_INVENTORY.json)，逐表索引见 [表清单](TABLE_INVENTORY.md)。没有客户数据进入报告。

这是源码和接口关系审计，不是生产数据库逐表数据质量审计。之前备份仅覆盖工具可见的部分表；此次未重新获取生产记录，也未完成历史金额、孤儿记录、重复客户或跨客户引用核验。空库迁移成功不能证明带真实历史数据的升级安全。

## 主要结论

已有业务能力应保留，但目前存在两套订单、两套账单路径，以及以窗口为核心的第三条生产流。统一门户入口不等于统一订单数据。尤其 `invoice_versions.order_id` 与 `installation_jobs.order_id` 不能仅凭同名字段当成同一订单体系。

| 业务关系 | 当前实现和代码证据 | 分类及缺口 |
|---|---|---|
| 官网订单 → 客户 | `app/api/orders/route.ts`：客户 session，通过 email 筛选 `customer_orders`，明细在 items_json，订单号为 Z-日期-随机值 | 旧链路已联通；未写入统一 orders，无来源映射 |
| 后台订单 → 客户、明细 | `app/api/v4/orders/route.ts`、`[orderNumber]/route.ts`：orders.customer_id → customers.id；order_items.order_id → orders.id；五位订单号 | 已联通，客户访问检查已补齐；项目名称和地址仍是订单文本 |
| 客户 → 项目 → 房间、窗口 → 测量 | `db/schema.ts` measure_properties.customer_id、measure_rooms.property_id、measure_windows.property_id/room_id、measurement_versions.window_id | 模块内已关联；properties 和 order_items 没有共同订单/窗口绑定；同项目可多次下单，不能直接按项目猜订单 |
| 窗口 → Handoff → 报价 | `app/api/v4/workflow-handoff/route.ts:71` 写 handoff 和 artifact 快照；customer_quote_versions 关联 customer/property/handoff；Z 多行来源在快照及 handoff 集合内 | 有真实快照联通，但没有 orders.id；artifactType=order 只是流转记录，不等于已创建统一订单 |
| 三套报价 → 统一明细 | `lib/order-items.ts:4` 仅接受 Braun、Jin、manual；Z 正式接口写 customer_quote_versions | 来源名称已有字段，不代表引擎自动接入；Z 不在统一明细来源集合，缺版本、计算输入和覆盖价格的统一契约 |
| 正式报价 → 签名 → 账单 → 收款 | customer_quote_signatures.quote_version_id；customer_billing_invoices.quote_version_id；customer_billing_transactions.invoice_id；`customer-billing/route.ts` 只从 signed 报价签发账单 | 这条链路已联通，但没有统一 order_id；签账单后将 artifactType=order 的 externalRecordId 写成账单 ID，不能当 orders.id 使用 |
| 旧 Invoice → 旧订单 | `app/api/v4/invoices/route.ts:12` 查询 customer_orders；`app/api/invoices/[invoiceNumber]/route.ts` 同样读取旧订单；invoice_versions 保存旧发票快照 | URL 含 v4 不代表使用统一 orders；必须给引用明确命名空间 |
| 支付 → 订单状态 | `app/api/payments/webhook/route.ts` 更新 customerOrders；`lib/customer-billing.ts` 汇总另一套账单流水 | 未见统一 orders.amountPaid/paymentStatus 的跨链路自动投影；禁止直接复制多处余额当真值 |
| 测量 → 加工图 → 工厂分配 → 生产单 → 运费 | manufacturing_drawings.window_id/measurement_version_id；manufacturing_factory_assignments.drawing_id；factory_work_orders.assignment_id（唯一）；factory_work_order_freight.work_order_id | 链路已存在，可多工厂分配、多笔运费；缺统一 order_id 和供应商应付/付款关系 |
| 项目 → 发货、取货、包裹 | customer_fulfillments.property_id/customer_id；packages.fulfillment_id/window_ids_json；已有 pickup_appointment_at | 已有取货时间，不应重建字段；缺订单绑定，不能区分同一项目的多张订单 |
| 统一订单 → 安装 | `app/api/v4/installations/route.ts` 以订单号查 orders/customer，写 installation_jobs.order_id 并自动带入地址、联系人、余额快照 | 真实联通可复用；状态接口只更新安装任务及事件，未自动推进 orders；快照不会随地址修改自动变化 |
| Excel → 财务 → 订单 | `imports/[batchId]/commit/route.ts:26` 按规范化订单号查 orders，写 business_ledger_entries.order_id；匹配不到为 null | 部分联通；必须保留未匹配队列。账本要求 import_batch_id/import_row_id，不宜直接充当所有日常手工收支入口 |
| 统一入口 → 各页面 | `app/hub/page.tsx:89` 渲染 module.href；`lib/unified-modules.ts` 定义链接 | 仅导航；不能用模块显示 available 证明端到端订单联通 |

## 优先业务风险

### P1：生产门槛仍未实现

`app/api/v4/factory-work-orders/route.ts:5` 只要求工厂分配存在、加工图 approved，然后创建 queued 生产单；PATCH 的 status 分支只检查状态枚举。`app/api/v4/orders/[orderNumber]/route.ts:16` 允许销售 confirmed → in_production，Owner 可选任意合法状态，都未核实已确认报价与定金。

修复必须统一覆盖正式创建、草稿放行、状态修改及以后新增入口。门槛来源为用户确认的“已确认报价应收定金”；不能使用任意手输订单状态作为确认凭据。

`lib/customer-billing.ts` 的 paid 把 posted credit 与 payment 一起计入，因此不能直接用 paid 判断现金到账。必须分别计算应收抵扣与有效现金收款，扣除退款/冲正，并核对币种、报价版本；并发时原子校验与写入。

### P1：订单命名空间混淆与不可靠关联

同名 order_id、五位 invoiceNumber、五位 orderNumber、Z- 前缀订单号并不等价。禁止按客户名称、email、项目地址或截取编号自动合并历史记录。显式映射至少包含 source_system、source_entity、source_id、canonical_order_id，建立唯一约束并保留审核者和依据。

### P1：快照和版本已有基础，但不等于全链路不可变

已有测量版本、加工图版本/哈希、报价签名及 invoice 快照，应复用。`customer-quotes/route.ts` 的选项修改仍会更新报价内容和哈希；“已签发不可覆盖”需要区分客户选配事件与签发原件。签名接口分开写签名、报价状态和 artifact，尚需并发与故障注入验证。审计日志也通常在主写操作之后单独写，不能宣称具备原子、不可篡改的全链路历史。

### P2：明细、客户地址、费用仍可能重复录入

订单文本项目与 measure_properties 分离；order_items 无 window_id；工厂名称/代码是文本；安装保存地址快照；进口账本与工厂运费分别保存金额。这些是联通断点，不是应该删除的重复数据：应分别定义主数据、业务明细和不可变快照的职责。

## 建议的最小实施顺序（未执行迁移）

1. 固定 main、PR #300、#301 与线上源码的对照基线，保留恢复点；完整数据库、R2 和受保护配置恢复演练通过后才考虑 V5 上线。
2. 以现有 orders.id 为候选统一订单主键，保留旧订单编号和所有旧表。先引入显式来源映射及订单与项目/窗口明细的关系，支持一个项目多订单、一个窗口后续补单。不要简单给项目加唯一 order_id。
3. 新订单统一写入一次，Braun/Jin/Z 用独立适配器返回计算输入、价格规则版本、结果、人工改价及原因；持久化幂等键。旧数据无法明确匹配时保持未关联并进入审核队列。
4. 为报价版本、账单、生产单和履约记录建立明确订单关联；跨记录 customer/project/window 归属必须由服务端校验。确定订单级并发版本与跨模块事件的可靠写入方式，再接状态投影。
5. 在所有生产入口实现同一门槛服务：有效确认版本 + 有效到账 ≥ 应收定金。报价变化、退款及部分采购必须有明确处理规则与异常记录。
6. 建供应商费用/应付及付款明细，复用工厂分配、运费和导入凭据；分别算 CNY/USD，应计成本与实付现金不能重复算利润。明确汇率才允许合并利润。
7. 发货、取货、安装按明细数量聚合状态；已签发文件冻结，变更生成新版本及变更通知。最后统一页面入口，避免先移动页面却没有数据闭环。

迁移设计必须是增量、可回滚/可前向修复的方案；先做映射预览和孤儿/跨客户检查，再在完整历史副本演练。当前没有执行任何迁移、回填或历史数据删除。

## 完成程度及剩余验收

- 已完成：78 张源码表清单、列清单、空库迁移重放、核心读写接口链路检查、生产门槛断点及模块关系分类。
- 尚未完成：生产逐表数据审计、历史金额复核、真实订单跨链路一致性验证、并发/失败恢复测试、完整备份及恢复演练。
- 历史报价样例需覆盖 Braun/Jin/Z，特别是 Z 运费、包装重量、双层和特殊尺寸；未批准 Romalux 附加费不得进入正式价格规则。本审计没有验证或修改这些价格算法。
- 现有 12 项回归测试仅覆盖先前维护修复和 Z 正式报价，不能作为 V5 全业务验收证据。

后续实施必须满足 [一次录入优先级与验收要求](ORDER_ONCE_PRIORITY.md)。先完成关系设计与迁移演练，再修改业务接口，不将本报告视为上线许可。
