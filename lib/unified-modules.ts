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
  { key:"customer-portal", zh:"我的房产", en:"My Properties", descriptionZh:"查看明确授权的房产、房间、Window 和客户可见状态。", descriptionEn:"View explicitly authorized properties, rooms, Windows and customer-visible statuses.", href:"/customer-portal", roles:["customer"], status:"available" },
  { key:"customer-access", zh:"客户门户授权", en:"Customer Access", descriptionZh:"邀请家庭联系人并授予或撤销指定 Property 权限。", descriptionEn:"Invite household contacts and grant or revoke property-specific access.", href:"/customer-access", roles:["owner"], status:"available" },
  { key:"customer-quotes", zh:"我的报价与签署", en:"My Quotes & Signature", descriptionZh:"按 Room/Window 查看准确尺寸、效果图、报价选项并电子签署。", descriptionEn:"Review exact Room/Window measurements, renderings and options, then e-sign.", href:"/customer-quotes", roles:["customer"], status:"available" },
  { key:"quote-issuance", zh:"签发客户 Quote", en:"Issue Customer Quote", descriptionZh:"从权威 Handoff 签发客户可见且可追踪的 Quote 版本。", descriptionEn:"Issue a traceable customer-visible Quote version from an authoritative handoff.", href:"/quote-issuance", roles:["owner"], status:"available" },
  { key:"customer-billing", zh:"Invoice、付款与收据", en:"Invoices, Payments & Receipts", descriptionZh:"查看 Deposit、已入账交易、余额和权威收据。", descriptionEn:"Review deposits, posted transactions, balances and authoritative receipts.", href:"/customer-billing", roles:["customer"], status:"available" },
  { key:"billing-admin", zh:"客户账单管理", en:"Customer Billing Admin", descriptionZh:"从已签 Quote 签发 Invoice，并记录有凭证的 Credit、Refund 或 Reversal。", descriptionEn:"Issue Invoices from signed Quotes and record referenced credits, refunds or reversals.", href:"/billing-admin", roles:["owner"], status:"available" },
  { key:"customer-fulfillment", zh:"物流追踪与自提", en:"Delivery & Pickup", descriptionZh:"查看确认的包裹、Tracking、剩余物品并签署仓库自提交接。", descriptionEn:"View confirmed packages, tracking and remaining items, then sign warehouse pickup handoff.", href:"/customer-fulfillment", roles:["customer"], status:"available" },
  { key:"fulfillment-admin", zh:"客户物流管理", en:"Customer Fulfillment Admin", descriptionZh:"建立按 Window 分箱的运输、配送或自提权威记录。", descriptionEn:"Create authoritative Window-level shipment, delivery or pickup records.", href:"/fulfillment-admin", roles:["owner"], status:"available" },
  { key:"search", zh:"全局搜索", en:"Global Search", descriptionZh:"按订单号、客户、电话、邮箱、Invoice 和地址查找真实记录。", descriptionEn:"Find authorized records by order, customer, phone, email, invoice or address.", href:"/search", roles:["owner","sales","factory","installer","customer"], status:"available" },
  { key:"dashboard", zh:"老板工作台", en:"Owner Dashboard", descriptionZh:"订单、收款、应收、生产、物流和安装总览。", descriptionEn:"Orders, payments, receivables, production, shipping and installation overview.", href:"/portal", roles:["owner"], status:"migrating" },
  { key:"customers", zh:"客户与订单", en:"Customers & Orders", descriptionZh:"统一管理客户、项目、订单和沟通记录。", descriptionEn:"Manage customers, projects, orders and communications.", href:"/customers", roles:["owner","sales"], status:"available" },
  { key:"smart-measure", zh:"智能测量中心", en:"Smart Measure", descriptionZh:"按项目、房间和永久 Window 编号录入三点尺寸，并保留每次测量版本。", descriptionEn:"Capture three-point dimensions by property, room and permanent Window ID with immutable version history.", href:"/measure", roles:["owner","sales"], status:"available" },
  { key:"room-sketch", zh:"房间草图", en:"Room Sketch", descriptionZh:"在触控画布放置墙体、门、家具和真实 Window，并保留草图版本。", descriptionEn:"Place walls, doors, furniture and real Window records on a touch canvas with version history.", href:"/room-sketch", roles:["owner","sales","installer"], status:"available" },
  { key:"wall-elevation", zh:"墙面立面", en:"Wall Elevation", descriptionZh:"根据已批准测量生成多窗墙面立面与安装规划。", descriptionEn:"Generate multi-window elevations and installation plans from approved measurements.", href:"/wall-elevation", roles:["owner","sales","installer"], status:"available" },
  { key:"fabric-library", zh:"面料库", en:"Fabric Library", descriptionZh:"统一面料 SKU、技术参数、价格版本与库存批次身份。", descriptionEn:"Authoritative fabric SKUs, technical attributes, versioned pricing and lot identity.", href:"/fabrics", roles:["owner","sales","factory"], status:"available" },
  { key:"hardware-library", zh:"五金库", en:"Hardware Library", descriptionZh:"统一轨道、杆、电机、遥控器、支架、配件 SKU 与兼容规则。", descriptionEn:"Authoritative track, rod, motor, remote, bracket and accessory SKUs with compatibility rules.", href:"/hardware", roles:["owner","sales","factory","installer"], status:"available" },
  { key:"design-studio", zh:"设计中心", en:"Design Studio", descriptionZh:"按真实 Window 组合批准测量、面料版本与兼容五金，并保存设计版本。", descriptionEn:"Combine approved measurements, fabric versions and compatible hardware per real Window.", href:"/design-studio", roles:["owner","sales"], status:"available" },
  { key:"measure-qa", zh:"测量 QA", en:"Measure QA", descriptionZh:"离开现场前检查缺失尺寸、三点差异、安装间隙、电机电源与人工复核。", descriptionEn:"Catch missing dimensions, tolerance, clearance, motor power and review issues before leaving site.", href:"/measure-qa", roles:["owner","sales"], status:"available" },
  { key:"workflow-handoff", zh:"一键业务流转", en:"One-click Handoff", descriptionZh:"把批准测量、设计、面料版本与五金 SKU 锁定为同一快照，流转到效果图、报价、签字、订单和加工图。", descriptionEn:"Lock approved measure, design, fabric versions and hardware SKUs into one snapshot for visualization, quote, approval, order and production drawing.", href:"/workflow-handoff", roles:["owner","sales"], status:"available" },
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
