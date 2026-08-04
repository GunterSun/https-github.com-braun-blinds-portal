# BRN-021 Database Design

## 核心实体

### product_categories
`id, parent_id, code, name_en, name_zh, status, sort_order`

### products
`id, category_id, sku, product_type, name_en, name_zh, description_en, description_zh, status, default_uom, taxable, created_at, updated_at`

### product_variants
`id, product_id, variant_code, series, model, attributes_json, status`

### option_groups / option_values
保存款式、控制方式、内衬、安装方式、颜色和其他选项，并记录必选、互斥和兼容关系。

### fabrics
`id, supplier_id, brand, collection, pattern, color, width, repeat, uom, status`

### product_media
`id, product_id, file_id, media_type, language, visibility, sort_order`

### price_books
`id, code, name, source, customer_tier, currency, status, effective_from, effective_to, version, approved_by, published_at`

### price_rules
`id, price_book_id, product_id, variant_id, rule_type, formula_json, base_amount, minimum_amount, maximum_amount, priority`

### discount_rules
`id, customer_tier, product_scope_json, discount_type, discount_value, effective_from, effective_to, approval_required`

### product_compatibility_rules
记录产品、选项、尺寸、面料、电机、轨道和配件之间的允许或禁止组合。

### price_snapshots
Quote 或订单生成时保存完整快照：产品、选项、价格表版本、公式输入、币种、原价、折扣、税、安装费和最终金额。

### price_override_requests
`id, quote_id, requested_by, original_amount, requested_amount, reason, status, approved_by, approved_at`

### product_audit_events
保存创建、修改、审批、发布、停用、导入和改价记录。

## 数据约束
- SKU、价格表代码和版本组合唯一。
- 金额字段必须同时有 `currency`。
- 已发布版本不可直接覆盖，只能新建版本。
- 已被 Quote、Invoice、订单引用的产品和价格记录不得硬删除。
- 价格快照为只读历史事实。
- 兼容规则失败时禁止生成正式 Quote。