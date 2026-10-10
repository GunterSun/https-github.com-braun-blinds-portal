# Braun 价格引擎核对｜第一阶段 V1.4
日期：2026-10-09
状态：只读源码核对；待补全计算逻辑及权威价目表。

## 已验证
1. `app/calculators/page.tsx` 中 Braun 和 Jin 入口均指向 `/complete/index.html`，Z 系列指向 `/z-series-quote`。
2. `public/complete/index.html` 的 Roman Shade 和 Drapery 为两个产品类型输入区，含相应款式、操作方式及辅料选项。
3. `public/complete/app.js` 首行标注 `Jin Park (CWF) Pricing Engine & Order System (NO DISCOUNT VERSION)`，并包含 `COMPACT_MATERIALS_DB`。
4. `public/complete/README.txt` 说明 Excel/测量数据导入、Invoice 和加工图功能。
5. `public/z-roman/roman_db.js` 存在独立 Z 系列历史报价、包装、重量和运费算法，具体规则见 `Z_SERIES_PRICING_SHIPPING_AUDIT_2026-10-09.md`。

## 目前不能下结论的事项
- 仅凭 Complete 页面与文件标题，无法确认 Braun 独立价格引擎已存在或与 Jin 完全相同。
- 无法确认 Complete 的 Roman Shade 就是 Romalux 价格矩阵。
- 当前读取 `public/complete/app.js` 时，连接器返回的内容止于内嵌面料库中段，尚未获得后续完整价格计算函数；不得猜测 120/244 英寸高度规则、双层规则或折扣逻辑在当前代码中的实现。
- 缺少可在本轮完整核对的 Jin、Braun、Romalux 原始价格表与对应样例订单，尚不能做金额回归验算。

## 统一报价引擎接口草案（未开发）
输入：customerId、supplierId、productFamily、engineId、priceVersion、fabricCode、productCode、widthOriginal、heightOriginal、mountType、controlType、options、quantity。
输出：chargedWidth、chargedHeight、basePrice、optionCharges、customerDiscount、shippingEstimate、tax、installation、lineTotal、sourceTrace、warnings、approvalRequired。
必须保留原始尺寸与计价尺寸；每行对应唯一的价格引擎和来源版本；缺价/冲突时禁止自动签发。

## 下一步核验顺序
P0 完整取得 Complete 实际计算函数并定位矩阵；P0 定位 Romalux 独立价目表及 DR-01/DR-02 规则；P0 对照 Z 历史与新版报价/运费；P1 使用真实订单做金额回归；P1 设计混合订单正式签发和多供应商拆单。

不修改生产计算器、价格表、已签发报价或网站部署。
