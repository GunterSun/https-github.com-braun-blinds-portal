# BRN-011 Inventory / Warehouse Center — API 规范

## 1. 通用规则

- API 前缀：`/api/v4/inventory` 与 `/api/v4/warehouse`。
- 所有写入必须校验角色、业务范围和 `Idempotency-Key`。
- 数量字段必须同时包含 `quantity` 与 `unit`。
- 金额必须包含 `amount` 与 `currency`，币种仅允许明确值，不默认推断。
- 写入返回业务对象、库存变化和审计编号；失败不得返回虚假成功。

## 2. 查询接口

- `GET /api/v4/inventory/items`
  - 按 SKU、条码、名称、类别、品牌和供应商搜索。
- `GET /api/v4/inventory/items/{itemId}`
  - 返回物料、批次、序列号、余额、预留和最近流水。
- `GET /api/v4/inventory/availability`
  - 参数：`itemId`、`warehouseId`、`quantity`、`unit`。
  - 返回 `onHand`、`reserved`、`quarantine`、`available` 和缺口。
- `GET /api/v4/inventory/transactions`
  - 支持订单、采购单、工厂、仓库、日期和类型筛选。
- `GET /api/v4/warehouse/locations`
  - 返回仓库、库区、货架和库位。

## 3. 入库接口

- `POST /api/v4/warehouse/receipts`
  - 创建收货草稿。
- `POST /api/v4/warehouse/receipts/{receiptId}/lines`
  - 增加物料、批次、数量和损坏数量。
- `POST /api/v4/warehouse/receipts/{receiptId}/confirm`
  - 预览确认后生成入库流水。
- `POST /api/v4/warehouse/receipts/{receiptId}/cancel`
  - 仅未确认收货可取消。

## 4. 预留与出库

- `POST /api/v4/inventory/reservations/preview`
  - 检查可用库存、单位和批次建议。
- `POST /api/v4/inventory/reservations`
  - 为订单创建预留。
- `POST /api/v4/inventory/reservations/{id}/release`
  - 释放未消耗数量。
- `POST /api/v4/warehouse/issues`
  - 创建领料或出库草稿。
- `POST /api/v4/warehouse/issues/{issueId}/confirm`
  - 校验预留、实际数量、批次和序列号后生成出库流水。

## 5. 调拨、退货和报废

- `POST /api/v4/warehouse/transfers`
- `POST /api/v4/warehouse/transfers/{id}/ship`
- `POST /api/v4/warehouse/transfers/{id}/receive`
- `POST /api/v4/warehouse/returns`
- `POST /api/v4/warehouse/returns/{id}/disposition`
  - 处理结果：`RESTOCK`、`REWORK`、`RETURN_TO_VENDOR`、`SCRAP`。

报废和大额库存调整必须经过 Owner 或明确授权的审批人确认。

## 6. 盘点

- `POST /api/v4/warehouse/counts`
  - 创建盘点任务并记录范围与快照时间。
- `POST /api/v4/warehouse/counts/{id}/lines`
  - 提交实盘结果。
- `POST /api/v4/warehouse/counts/{id}/review`
  - 返回差异和建议处理。
- `POST /api/v4/warehouse/counts/{id}/approve`
  - 经审批后生成调整流水。

## 7. 条码与扫码

- `GET /api/v4/inventory/barcodes/{barcode}`
- `POST /api/v4/warehouse/scan`

扫码接口必须带操作上下文，例如收货、领料、盘点或调拨。重复扫描应提示并避免重复入账。

## 8. 错误码

- `INSUFFICIENT_AVAILABLE_STOCK`
- `UNIT_MISMATCH`
- `DUPLICATE_IDEMPOTENCY_KEY`
- `LOT_REQUIRED`
- `SERIAL_REQUIRED`
- `SERIAL_ALREADY_USED`
- `LOCATION_BLOCKED`
- `COUNT_ALREADY_APPROVED`
- `PERMISSION_DENIED`
- `CONCURRENT_STOCK_CHANGE`

## 9. AI 与自动化限制

AI 助理可以查询库存、生成补货或预留草稿，但不能自动批准报废、盘点差异、成本调整或大额出库。所有自动化仍必须调用相同 API、权限和审计层。