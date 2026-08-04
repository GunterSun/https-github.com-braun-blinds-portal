# 数据库设计

## 核心实体

- `app_users`、`app_sessions`：统一账号和登录会话
- `customers`：客户与联系人
- `quotes`：报价
- `customer_orders`：订单主表
- `order_items`：产品明细（计划）
- `invoices`、`payments`：发票与收款（逐步规范化）
- `factories`、`purchases`、`expenses`：工厂、采购与支出（计划）
- `shipments`、`packages`：物流和多箱（计划）
- `installations`：安装任务（计划）
- `order_assignments`：角色与订单授权
- `audit_logs`：操作日志
- `import_batches`、`import_rows`：Excel 导入批次与标准化明细

## 关系原则

客户拥有多个项目和订单；订单拥有多个产品、Invoice、付款、工厂费用、物流包裹、安装任务、图片和文件。所有业务记录保留订单号关联，同时使用内部主键保证稳定。

## 金额原则

每笔金额必须保存原币币种。不得只保存换算后的美元数；需要汇总利润时，另存汇率、汇率日期和换算值。

## 审计与删除

重要记录优先软删除或状态撤销。付款、正式 Invoice、已提交财务和已关联导入记录不得无日志硬删除。
