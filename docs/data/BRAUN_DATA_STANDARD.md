# Braun Data Standard (BDS) v1

## 基本原则
- 每个业务对象有唯一 ID。
- 历史事实使用快照，不因主档修改而变化。
- 金额必须保存币种；USD 与 RMB 不直接相加。
- 尺寸必须保存原始单位和标准化值。
- 正式数据不可硬删除，只能停用、撤销或版本化。
- Excel、PDF 和图片导入必须保留来源文件、工作表、页码或行号。

## 核心层级
Customer → Project → Building/Floor（可选）→ Room → Window → Product Configuration

## BDS-001 Customer
`customer_id, customer_type, name, company, phone, email, billing_address_id, default_discount, payment_terms, tax_status, sales_owner_id, status`

## BDS-002 Project
`project_id, customer_id, project_type, project_name, project_address_id, status, start_date, target_date`

项目类型包括住宅、商业、酒店、公寓、Builder、Designer、Architect 和 Office。

## BDS-003 Room
`room_id, project_id, room_code, room_name_en, room_name_zh, floor, sort_order`

## BDS-004 Window
`window_id, room_id, window_code, name, width, height, depth, unit, mount_type, shape, status`

每个 Window 可关联多次测量、多张照片、多次安装、多次保修和历史产品配置。

## BDS-005 Product
产品类型：
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

字段：`product_id, category_id, sku, brand, series, model, name_en, name_zh, status, default_uom, warranty_rule_id`

## Shutters 标准属性
`material, panel_count, panel_layout, louver_size, frame_type, divider_rail, tilt_rod, hinge_side, color, special_shape`

## Blinds 标准属性
`blind_type, orientation, slat_or_vane_size, material, lift_control, tilt_control, valance, ladder_tape, color`

## BDS-006 Product Configuration
`configuration_id, window_id, product_id, variant_id, options_json, measurement_version_id, pricing_version_id, status`

## BDS-007 Pricing
`price_book_id, source, customer_tier, currency, version, effective_from, effective_to, status`

价格快照必须保存原价、折扣、附加费、安装费、税、最终价、规则版本和币种。

## BDS-008 Factory / Supplier
`party_id, party_type, name, contacts, currency, payment_terms, lead_time, product_scope, status`

## BDS-009 Inventory
标准单位：`yard, foot, inch, meter, piece, set, box, roll, panel`

库存必须区分：`on_hand, reserved, available, quarantined`。

## BDS-010 Shipment
Shipment → Package → Tracking Event

每个包裹保存长宽高、重量、单位、承运商、服务、Tracking、报价、购买金额、最终账单和附加费。

## BDS-011 Finance
每笔金额保存：`amount, currency, exchange_rate_id(optional), source, transaction_date, created_at, updated_at`。

## BDS-012 Audit
所有关键操作保存：`actor, role, action, resource_type, resource_id, before_json, after_json, timestamp, request_id`。

## 版本规则
- 已发布产品与价格不能原地覆盖。
- 已发送 Quote 和 Invoice 使用只读快照。
- 新规则只影响新计算，不改变历史记录。
- 数据模型破坏性变更必须有 migration、backup 和 rollback。