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

## Import
- `POST /imports/preview`
- `POST /imports/{id}/confirm`
- `POST /imports/{id}/rollback`

## 安全要求
- 所有写入进行服务器端权限校验。
- 发布、停用、批量导入和改价审批需要 Owner 权限。
- 写入接口支持 Idempotency-Key。
- API 不得返回当前角色无权查看的成本、利润或内部规则。
- 每次计算结果保存规则版本与审计标识。