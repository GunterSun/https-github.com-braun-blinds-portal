# 数据字段字典

| 字段 | 含义 | 规则 |
|---|---|---|
| order_number | 订单号 | 五位数或标准化 `CWF 12345`，不可随意改写 |
| quote_number | 报价单号 | 独立顺序编号 |
| invoice_number | Invoice 号 | 五位数、唯一 |
| customer | 客户/公司 | 与联系人分开保存 |
| project | 项目或客户的客户 | 可为空，但不得与客户名称混淆 |
| amount | 原币金额 | 空值保持为空 |
| currency | 币种 | `USD` 或 `RMB/CNY`，不得凭金额猜测 |
| payment_status | 付款状态 | `unpaid`、`partial`、`paid` |
| order_status | 订单状态 | 草稿、确认、生产、发货、安装、完成、取消 |
| tracking_number | 物流单号 | 关联承运商和包裹 |
| source_file | 来源文件 | Excel 导入必须保存 |
| source_sheet | 来源工作表 | Excel 导入必须保存 |
| source_row | 来源行号 | Excel 导入必须保存 |
| warnings | 数据警告 | JSON 数组，审核后仍保留历史 |

新模块增加字段时，应先更新本字典，避免相同概念出现多个名称。
