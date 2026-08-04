# BRN-011 Inventory / Warehouse Center — 数据模型

## 1. 核心实体

### Warehouse
- `id`
- `name`
- `code`
- `address`
- `timezone`
- `active`

### WarehouseLocation
- `id`
- `warehouse_id`
- `zone`
- `aisle`
- `rack`
- `bin`
- `barcode`
- `status`

### InventoryItem
- `id`
- `sku`
- `name_zh`
- `name_en`
- `category`
- `brand`
- `model`
- `base_unit`
- `barcode`
- `track_lot`
- `track_serial`
- `track_length`
- `active`

### InventoryLot
用于面料卷、批次、颜色批号和有保质/追溯要求的物料。
- `id`
- `inventory_item_id`
- `lot_number`
- `supplier_id`
- `received_at`
- `color_lot`
- `original_quantity`
- `remaining_quantity`
- `unit`
- `status`

### InventorySerial
用于电机、Hub 和需保修追踪的设备。
- `id`
- `inventory_item_id`
- `serial_number`
- `lot_id`
- `warranty_start`
- `warranty_end`
- `status`

### InventoryBalance
按 SKU、仓库、库位、批次汇总的读取模型，不作为原始事实来源。
- `inventory_item_id`
- `warehouse_id`
- `location_id`
- `lot_id`
- `on_hand_quantity`
- `reserved_quantity`
- `quarantine_quantity`
- `available_quantity`
- `updated_at`

### InventoryTransaction
不可变库存流水。
- `id`
- `transaction_type`
- `inventory_item_id`
- `warehouse_id`
- `location_id`
- `lot_id`
- `serial_id`
- `quantity_delta`
- `unit`
- `order_id`
- `purchase_order_id`
- `factory_task_id`
- `shipment_id`
- `reference_type`
- `reference_id`
- `idempotency_key`
- `reason`
- `created_by`
- `created_at`

### InventoryReservation
- `id`
- `order_id`
- `order_item_id`
- `inventory_item_id`
- `warehouse_id`
- `lot_id`
- `quantity`
- `unit`
- `status`
- `expires_at`
- `created_by`

### StockReceipt / StockReceiptLine
记录采购、工厂退回和客户退货的收货过程、预计数量、实收数量、损坏数量和库位。

### StockIssue / StockIssueLine
记录订单领料、发货、工厂发料、安装工领用和报废出库。

### StockTransfer / StockTransferLine
记录仓库间和库位间调拨，支持在途状态。

### StockCount / StockCountLine
记录盘点范围、冻结时间、账面数量、实盘数量、差异和审批。

### InventoryCostLayer
- `inventory_item_id`
- `lot_id`
- `currency`
- `unit_cost`
- `quantity`
- `source_document`
- `effective_at`

用于 FIFO 或指定批次成本；USD 与 RMB 不得混在同一成本层。

## 2. 约束

- `sku` 全局唯一。
- `barcode` 在有效物料中唯一；允许一个 SKU 维护多个包装条码时使用独立 BarcodeAlias 表。
- `serial_number` 全局唯一。
- `quantity_delta` 不得为零。
- 流水创建后禁止直接修改或删除；纠错使用反向流水。
- 同一 `idempotency_key` 只能生成一次业务结果。
- 余额不得成为手工编辑字段，必须由流水重建。
- 单位转换必须使用明确的 `UnitConversion` 规则并保留原始输入。

## 3. 并发与事务

库存预留、释放、出库和盘点调整必须在数据库事务中锁定相关余额或使用乐观版本号，防止两个订单同时占用同一库存。

## 4. 审计

保存创建人、批准人、设备、时间、来源文件、Excel 工作表和行号。库存调整、报废、盘点差异和成本修改必须记录修改前后及原因。