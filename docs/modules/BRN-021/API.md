# BRN-021 API Specification

Base path: `/api/v4/catalog`

## Catalog
- `GET /categories`
- `GET /products`
- `GET /products/{id}`
- `POST /products`
- `PATCH /products/{id}`
- `POST /products/{id}/deactivate`
- `GET /products/{id}/options`
- `POST /products/{id}/validate-configuration`

产品筛选必须支持 `product_type=shutter` 和 `product_type=blind`，并支持按材质、系列、方向和状态筛选。

## Shutters
- `GET /shutters/options`
- `POST /shutters/validate-configuration`

Shutters 配置输入至少包含：材质、宽高、IB/OB、Panel 配置、Louver 尺寸、Frame、Divider Rail、Tilt、Hinge、颜色和特殊形状/开孔。

## Blinds
- `GET /blinds/options`
- `POST /blinds/validate-configuration`

Blinds 配置输入至少包含：Blind 类型、材质、横向/竖向、宽高、IB/OB、Slat/Vane 尺寸、Lift、Tilt、Valance、梯带和颜色。

## Fabrics and media
- `GET /fabrics`
- `POST /fabrics`
- `PATCH /fabrics/{id}`
- `POST /products/{id}/media`
- `PATCH /media/{id}/visibility`

## Price books
- `GET /price-books`
- `POST /price-books`
- `POST /price-books/{id}/clone-version`
- `POST /price-books/{id}/submit-approval`
- `POST /price-books/{id}/approve`
- `POST /price-books/{id}/publish`
- `POST /price-books/{id}/retire`

## Pricing
- `POST /price/calculate`
- `POST /price/snapshot`
- `POST /price-overrides`
- `POST /price-overrides/{id}/approve`
- `POST /price-overrides/{id}/reject`

`POST /price/calculate` 必须返回：
- 产品与选项标准化结果
- 使用的价格表和版本
- 公式输入与计算步骤
- 原价、折扣、附加费、安装费、税前金额
- 币种和警告
- 配置兼容性结果
- Shutters 的 Panel、Louver、Frame、Divider Rail、Tilt 和特殊形状价格明细
- Blinds 的材质、Slat/Vane、控制方式、Valance 和其他选项价格明细

## Import
- `POST /imports/preview`
- `POST /imports/{id}/confirm`
- `POST /imports/{id}/rollback`

Excel 导入必须识别 Shutters 与 Blinds 的产品类型、规格字段、价格表版本和币种，无法识别的字段进入人工审核。

## 安全要求
- 所有写入进行服务器端权限校验。
- 发布、停用、批量导入和改价审批需要 Owner 权限。
- 写入接口支持 Idempotency-Key。
- API 不得返回当前角色无权查看的成本、利润或内部规则。
- 每次计算结果保存规则版本与审计标识。