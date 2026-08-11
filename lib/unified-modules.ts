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
  { key:"search", zh:"全局搜索", en:"Global Search", descriptionZh:"按订单号、客户、电话、邮箱、Invoice 和地址查找真实记录。", descriptionEn:"Find authorized records by order, customer, phone, email, invoice or address.", href:"/search", roles:["owner","sales","factory","installer","customer"], status:"available" },
  { key:"dashboard", zh:"老板工作台", en:"Owner Dashboard", descriptionZh:"订单、收款、应收、生产、物流和安装总览。", descriptionEn:"Orders, payments, receivables, production, shipping and installation overview.", href:"/portal", roles:["owner"], status:"migrating" },
  { key:"customers", zh:"客户与订单", en:"Customers & Orders", descriptionZh:"统一管理客户、项目、订单和沟通记录。", descriptionEn:"Manage customers, projects, orders and communications.", href:"/customers", roles:["owner","sales"], status:"available" },
  { key:"smart-measure", zh:"智能测量中心", en:"Smart Measure", descriptionZh:"按项目、房间和永久 Window 编号录入三点尺寸，并保留每次测量版本。", descriptionEn:"Capture three-point dimensions by property, room and permanent Window ID with immutable version history.", href:"/measure", roles:["owner","sales"], status:"available" },
  { key:"room-sketch", zh:"房间草图", en:"Room Sketch", descriptionZh:"在触控画布放置墙体、门、家具和真实 Window，并保留草图版本。", descriptionEn:"Place walls, doors, furniture and real Window records on a touch canvas with version history.", href:"/room-sketch", roles:["owner","sales","installer"], status:"available" },
  { key:"wall-elevation", zh:"墙面立面", en:"Wall Elevation", descriptionZh:"根据已批准测量生成多窗墙面立面与安装规划。", descriptionEn:"Generate multi-window elevations and installation plans from approved measurements.", href:"/wall-elevation", roles:["owner","sales","installer"], status:"available" },
  { key:"fabric-library", zh:"面料库", en:"Fabric Library", descriptionZh:"统一面料 SKU、技术参数、价格版本与库存批次身份。", descriptionEn:"Authoritative fabric SKUs, technical attributes, versioned pricing and lot identity.", href:"/fabrics", roles:["owner","sales","factory"], status:"available" },
  { key:"hardware-library", zh:"五金库", en:"Hardware Library", descriptionZh:"统一轨道、杆、电机、遥控器、支架、配件 SKU 与兼容规则。", descriptionEn:"Authoritative track, rod, motor, remote, bracket and accessory SKUs with compatibility rules.", href:"/hardware", roles:["owner","sales","factory","installer"], status:"available" },
  { key:"design-studio", zh:"设计中心", en:"Design Studio", descriptionZh:"按真实 Window 组合批准测量、面料版本与兼容五金，并保存设计版本。", descriptionEn:"Combine approved measurements, fabric versions and compatible hardware per real Window.", href:"/design-studio", roles:["owner","sales"], status:"available" },
  { key:"calculators", zh:"报价计算器", en:"Pricing Calculators", descriptionZh:"Braun 与 Jin 计算器统一入口。", descriptionEn:"Unified access to Braun and Jin calculators.", href:"/portal", roles:["owner","sales","customer"], status:"migrating" },
  { key:"invoice", zh:"Invoice 与收款", en:"Invoices & Payments", descriptionZh:"五位数 Invoice、付款状态和信用卡收款。", descriptionEn:"Five-digit invoices, payment status and card payments.", href:"/portal", roles:["owner","sales","customer"], status:"available" },
  { key:"invoice-signatures", zh:"Invoice 客户签名", en:"Invoice Signatures", descriptionZh:"老板发起客户签名、复制安全链接并跟踪签名状态。", descriptionEn:"Create customer signature requests, copy secure links and track status.", href:"/invoices", roles:["owner"], status:"available" },
  { key:"data-import", zh:"真实数据导入中心", en:"Real Data Import Center", descriptionZh:"上传批发销售和 Jin 汇总 Excel，先预览币种、重复项和异常数据，再确认导入。", descriptionEn:"Upload Wholesale Sales and Jin Summary workbooks, then preview currencies, duplicates and anomalies before import.", href:"/data-import", roles:["owner"], status:"available" },
  { key:"factory", zh:"工厂与采购", en:"Factory & Purchasing", descriptionZh:"工厂订单、材料款、加工费和付款状态。", descriptionEn:"Factory orders, materials, processing fees and payment status.", href:"/portal", roles:["owner","sales","factory"], status:"migrating" },
  { key:"shipping", zh:"物流中心", en:"Shipping Center", descriptionZh:"多箱报价、运单、Tracking 和运输成本。", descriptionEn:"Multi-package rates, labels, tracking and shipping cost analysis.", href:"/portal", roles:["owner","sales"], status:"migrating" },
  { key:"installation", zh:"安装中心", en:"Installation Center", descriptionZh:"双语安装任务、排期、导航和受控状态更新。", descriptionEn:"Bilingual tasks, scheduling, navigation and controlled status updates.", href:"/installations", roles:["owner","sales","installer"], status:"available" },
  { key:"finance", zh:"财务与利润", en:"Finance & Profit", descriptionZh:"美元/人民币、收支、订单成本和利润。", descriptionEn:"USD/CNY, cash flow, order costs and profit.", href:"/portal", roles:["owner"], status:"planned" },
  { key:"resources", zh:"产品与价格中心", en:"Product & Pricing Center", descriptionZh:"统一产品主档、Shutters、Blinds、价格表和安装资料。", descriptionEn:"Unified product records, shutters, blinds, price books and installation resources.", href:"/catalog", roles:["owner","sales","factory","installer","customer"], status:"available" },
];
