export type UnifiedModule = {
  key: string;
  zh: string;
  en: string;
  descriptionZh: string;
  descriptionEn: string;
  href: string;
  roles: Array<"owner" | "sales" | "factory" | "installer" | "customer">;
  status: "available" | "migrating" | "planned";
};

export const UNIFIED_MODULES: UnifiedModule[] = [
  { key:"dashboard", zh:"老板工作台", en:"Owner Dashboard", descriptionZh:"订单、收款、应收、生产、物流和安装总览。", descriptionEn:"Orders, payments, receivables, production, shipping and installation overview.", href:"/portal", roles:["owner"], status:"migrating" },
  { key:"customers", zh:"客户与订单", en:"Customers & Orders", descriptionZh:"统一管理客户、项目、订单和沟通记录。", descriptionEn:"Manage customers, projects, orders and communications.", href:"/customers", roles:["owner","sales"], status:"available" },
  { key:"calculators", zh:"报价计算器", en:"Pricing Calculators", descriptionZh:"Braun 与 Jin 计算器统一入口。", descriptionEn:"Unified access to Braun and Jin calculators.", href:"/portal", roles:["owner","sales","customer"], status:"migrating" },
  { key:"invoice", zh:"Invoice 与收款", en:"Invoices & Payments", descriptionZh:"五位数 Invoice、付款状态和信用卡收款。", descriptionEn:"Five-digit invoices, payment status and card payments.", href:"/portal", roles:["owner","sales","customer"], status:"available" },
  { key:"data-import", zh:"真实数据导入中心", en:"Real Data Import Center", descriptionZh:"上传批发销售和 Jin 汇总 Excel，先预览币种、重复项和异常数据，再确认导入。", descriptionEn:"Upload Wholesale Sales and Jin Summary workbooks, then preview currencies, duplicates and anomalies before import.", href:"/data-import", roles:["owner"], status:"available" },
  { key:"factory", zh:"工厂与采购", en:"Factory & Purchasing", descriptionZh:"工厂订单、材料款、加工费和付款状态。", descriptionEn:"Factory orders, materials, processing fees and payment status.", href:"/portal", roles:["owner","sales","factory"], status:"migrating" },
  { key:"shipping", zh:"物流中心", en:"Shipping Center", descriptionZh:"多箱报价、运单、Tracking 和运输成本。", descriptionEn:"Multi-package rates, labels, tracking and shipping cost analysis.", href:"/portal", roles:["owner","sales"], status:"migrating" },
  { key:"installation", zh:"安装中心", en:"Installation Center", descriptionZh:"安装排期、导航、照片、签字和完工确认。", descriptionEn:"Scheduling, navigation, photos, signatures and completion.", href:"/portal", roles:["owner","sales","installer","customer"], status:"migrating" },
  { key:"finance", zh:"财务与利润", en:"Finance & Profit", descriptionZh:"美元/人民币、收支、订单成本和利润。", descriptionEn:"USD/CNY, cash flow, order costs and profit.", href:"/portal", roles:["owner"], status:"planned" },
  { key:"resources", zh:"产品与价格中心", en:"Product & Pricing Center", descriptionZh:"统一产品主档、Shutters、Blinds、价格表和安装资料。", descriptionEn:"Unified product records, shutters, blinds, price books and installation resources.", href:"/catalog", roles:["owner","sales","factory","installer","customer"], status:"available" },
];
