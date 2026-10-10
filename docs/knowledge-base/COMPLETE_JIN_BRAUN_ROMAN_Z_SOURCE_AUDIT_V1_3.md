# Braun 统一报价系统｜源码定位审核 V1.3
日期：2026-10-09
状态：源码静态核对记录；未修改报价代码，未发布新价格。

## 现有计算器入口
`app/calculators/page.tsx`：Braun 和 Jin 两个入口都指向 `/complete/index.html`，Z 系列入口指向 `/z-series-quote`。因此界面显示三个名称，不等于后台有三套互相独立的价格引擎。

## Complete v3.0 核对
- `public/complete/app.js` 文件开头标注 `Jin Park (CWF) Pricing Engine & Order System (NO DISCOUNT VERSION)`。
- `public/complete/index.html` 有 Roman Shade 与 Drapery 切换。
- 罗马帘选项包含 flat/hobbled/tdbu/twin/balloon、升降控制、帷幔、电机配件、内衬。
- 布艺窗帘选项包含挂法、分幅、内衬、轨道、褶皱升级、挂耳带、定型。
- `public/complete/README.txt` 描述 Excel 导入、长图 Invoice、加工图、IB 自动减宽 1/4 英寸、OB 不减宽、测量 JSON 导入。
- 当前证据不能证明 Romalux 独立矩阵或 Braun 独立价格引擎已经集成；需取得明确代码函数与权威价格表再判定。

## Z 系列
- 历史独立引擎：`public/z-roman/roman_db.js`、`public/z-roman/script.js`。
- 新报价目录和签发：`app/z-series-data.ts`、`data/z-series/catalog-source.ts`、`app/api/v4/z-series-quotes/route.ts`。
- 包装、计重、运费及历史价格冲突详见 `Z_SERIES_PRICING_SHIPPING_AUDIT_2026-10-09.md`。

## 融合设计决定（提案，待验收）
1. 统一 Quote/Order/QuoteLine；一行明确 `engine_id`、`price_version`、`supplier_id`、`customer_price_policy_id`、`original_dimensions`、`charged_dimensions`、`source_document_id`。
2. Complete 的 Roman 与 Drapery 功能分别识别为产品类型，**不**将 Jin Roman 直接等同 Romalux Roman。
3. DR-01、DR-02 是需要验证的独立罗马帘结构，不能由 Twin 或 TDBU 字段代替。
4. Z 系列运费作为独立、可审核的费用明细，防止成本倍数与逐箱运费重复收取。
5. 同一报价可跨产品/供应商；客户确认、款项清算审核后才按供应商释放生产单；每张报价锁定价格来源与规则版本。
6. 缺少权威表或冲突未审批时标记“需人工审核”，禁止自动签发。

## 下一轮具体核对
- 定位 Complete 中实际计算函数、数据表、尺寸取整、高度附加费及双层逻辑；用原始订单样例回归测试。
- 查找 Romalux 原始矩阵及 DR-01/DR-02 公式实际载体；无文件则记录缺失，不猜测。
- 对比 Z 历史程序、新版目录和正式签发接口的计算与运费数据链路。
- 输出每个产品的“输入→规则→价格→客户显示→供应商生产单”字段对照及测试样例。

本文件为审核记录，不声明已完成程序融合、上线或价格核准。
