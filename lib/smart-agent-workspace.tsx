"use client";

import { useEffect, useMemo, useState } from "react";
import { extractInquiryLines } from "./ai/extract-lines";

// ==========================================
// 1. 数据类型定义（批发、零售、日常记账、提醒）
// ==========================================

export type WholesaleStage =
  | "待报价标注"
  | "已报价待付款"
  | "已付款待下厂"
  | "已下单工厂生产中"
  | "已到货待通知取货"
  | "已到货待我去安装"
  | "已完成";

export type WholesaleItem = {
  id: string;
  customer: string;
  phone: string;
  rawSpec: string; // 客户发来的型号与尺寸原文
  parsedSummary: string; // 识别出的型号与尺寸汇总
  detailNotes: string; // 报价与工艺细节标注（如：内装减1/4、左控、加帷幔等）
  quoteUsd: number;
  paidUsd: number;
  paymentMethod: string;
  factoryName: string;
  factoryOrderNo: string;
  factoryCostCurrency: "USD" | "RMB";
  factoryCost: number;
  deliveryMode: "客户自提" | "我去安装";
  installAddress: string;
  stage: WholesaleStage;
  createdAt: string;
  updatedAt: string;
};

export type RetailStage =
  | "已预约待测量"
  | "已测量待选品报价"
  | "已报价待确定收款"
  | "已收款待下单工厂"
  | "工厂生产中"
  | "已到货待上门安装"
  | "已安装完工结清";

export type RetailItem = {
  id: string;
  customer: string;
  phone: string;
  address: string;
  measureTime: string; // 预约测量时间
  measureNotes: string; // 测量尺寸与房间窗位记录
  selectedProducts: string; // 选定的产品、面料、轨道/电机
  quoteUsd: number;
  depositUsd: number; // 已收定金/全款
  totalPaidUsd: number; // 累计已收金额
  paymentMethod: string;
  factoryName: string;
  factoryOrderNo: string;
  factoryCostCurrency: "USD" | "RMB";
  factoryCost: number;
  installTime: string; // 预约安装时间
  stage: RetailStage;
  createdAt: string;
  updatedAt: string;
};

export type LedgerEntry = {
  id: string;
  date: string;
  direction: "收入" | "支出";
  category:
    | "批发订单收款"
    | "零售定制收款"
    | "支付工厂货款"
    | "国际/本地运费"
    | "安装工费"
    | "公司房租与仓库"
    | "车辆加油与保养"
    | "水电网络办公"
    | "工具与配件采购"
    | "员工工资"
    | "其他日常收支";
  currency: "USD" | "RMB";
  amount: number;
  method: string; // Zelle / 支票 / 信用卡 / 现金 / 微信支付宝 / 银行转账
  relatedOrderId: string;
  counterparty: string; // 客户或供应商/商户
  note: string;
  createdAt: string;
};

export type SmartReminder = {
  id: string;
  dueTime: string;
  category: "预约测量" | "到货取货通知" | "上门安装" | "催收尾款" | "下单工厂" | "日常待办";
  title: string;
  detail: string;
  relatedId: string;
  priority: "紧急" | "普通";
  done: boolean;
};

export const STORAGE_KEYS = {
  wholesale: "braun-wholesale-workflow-v1",
  retail: "braun-retail-workflow-v1",
  ledger: "braun-company-ledger-v1",
  reminders: "braun-smart-reminders-v1",
  aiConfig: "braun-ai-agent-config-v1",
};

const DEFAULT_WHOLESALE_SEED: WholesaleItem[] = [
  {
    id: "WS-IGNACIO-01",
    customer: "Ignacio（经销商批发单）",
    phone: "",
    rawSpec:
      "Ignacio的订单。客户信息：Gunther, use this invoice of ours to make an order. We will pay for it as soon as I get my customer's deposit.\n1. Blackout 1% Charcoal - Motorized Roller Shade (x3)\n2. J1200 Beige - Motorized Roller Shade (x3)\n3. Smart Hub - Automation Control (x1)\n4. Handheld Remotes - 3 pcs",
    parsedSummary:
      "6樘电动卷帘 (3× Blackout 1% Charcoal + 3× J1200 Beige Motorized Roller Shade) + 1× Smart Hub 智能网关 + 3× 手持遥控器",
    detailNotes:
      "来自 Gemini《Ignacio 窗帘订单详情处理》：按 Ignacio 提供的客户 Invoice 排单；等待 Ignacio 收到终端客户定金后付款即下厂生产。",
    quoteUsd: 1680,
    paidUsd: 0,
    paymentMethod: "Zelle",
    factoryName: "国内电动卷帘主力工厂",
    factoryOrderNo: "",
    factoryCostCurrency: "RMB",
    factoryCost: 4200,
    deliveryMode: "客户自提",
    installAddress: "",
    stage: "已报价待付款",
    createdAt: "2026-11-14 08:30",
    updatedAt: "2026-11-14 08:30",
  },
  {
    id: "WS-JZ01-16WIN",
    customer: "批发客户（16樘按宽度 $/英寸 报价单）",
    phone: "",
    rawSpec:
      "来自 Gemini《窗帘报价明细表》：共16樘窗帘（LN #1-#15 款式 JZ01-5 按 $2.20/英寸计算；LN #16 款式 JZ03-2 按 $2.50/英寸计算）。\n同时客户咨询《窗帘面料衬里价格调整咨询》：对比 Blackout Liner（全遮光衬里）换成 Light Filtering Liner（透光衬里）或 No Liner（无衬里）的降价方案。",
    parsedSummary:
      "16樘定制窗帘（前15樘 JZ01-5 @ $2.20/英寸宽；最后1樘 JZ03-2 @ $2.50/英寸宽）",
    detailNotes:
      "计价公式：单窗金额 = 宽度(Width in) × 单价($2.20 或 $2.50/英寸) × 数量；备选降价方案：改透光衬里(Light Filtering Liner)或无衬里(No Liner)。",
    quoteUsd: 1945,
    paidUsd: 0,
    paymentMethod: "Zelle",
    factoryName: "国内主力工厂",
    factoryOrderNo: "",
    factoryCostCurrency: "RMB",
    factoryCost: 4600,
    deliveryMode: "客户自提",
    installAddress: "",
    stage: "已报价待付款",
    createdAt: "2026-11-14 08:35",
    updatedAt: "2026-11-14 08:35",
  },
  {
    id: "WS-20008-01",
    customer: "李度恒02（20008全屋42窗 · 加工单拆单与供应商分单）",
    phone: "",
    rawSpec:
      "来自本地实单《李度恒02加工.xlsx》+《李度恒20008预算.xlsx》+《李度恒20008 窗帘.pdf》：全屋共 42 樘（大量瓷砖口内安装），拆分为：\n1) 纱帘 16樘：纱SSY06（供应商：臻品，需要双层杆，加工高度 = 原始高度 - 2\"，总宽 1218.5\" = 3094.99cm）\n2) 布帘 16樘：公共区域 12樘 透光布 UK001-2（供应商：鑫亚纶）+ 卧室 4樘 遮光布 3002-2（供应商：泰纶），加工高度 = 原始高度 - 2\"\n3) 罗马帘 9樘：UK001-2（鑫亚纶）/ 3003-3（书房·泰纶）/ 3008-1（主卧·泰纶）/ 3002-2（其他卧室·泰纶），全部口内安装，总宽 357.5\" = 908.05cm\n4) 卷帘 17樘：15樘 透光卷帘 JL3601 + 2樘 遮光卷帘 JL2801",
    parsedSummary:
      "42樘全案拆单：16樘纱帘(SSY06·臻品) + 16樘布帘(UK001-2鑫亚纶 / 3002-2泰纶) + 9樘罗马帘 + 17樘卷帘(JL3601/JL2801)",
    detailNotes:
      "待核实项：① K1(66*46)、K2(35*46.25) 按照李先生的尺寸未测量；② 家庭厅 FR1sd-FR4 电影院是否需要遮光；③ 书房1-4 是否遮光；④ 2卧2-2sd / 2卧3-1sd 遮光卷帘 JL2801 预算表标【口外】、加工表标【口内】需确认。",
    quoteUsd: 15383,
    paidUsd: 0,
    paymentMethod: "银行转账",
    factoryName: "臻品(纱SSY06) + 鑫亚纶(UK001-2) + 泰纶(3003-3/3008-1/3002-2)",
    factoryOrderNo: "FAC-LDH02-20008",
    factoryCostCurrency: "RMB",
    factoryCost: 26800,
    deliveryMode: "我去安装",
    installAddress: "Project #20008（大量瓷砖口内安装）",
    stage: "待报价标注",
    createdAt: "2026-11-14 08:40",
    updatedAt: "2026-11-14 08:40",
  },
];

const DEFAULT_RETAIL_SEED: RetailItem[] = [
  {
    id: "RT-LIDUHENG-02",
    customer: "李度恒（02项目 · 20008全屋42窗）",
    phone: "",
    address: "Project 20008（HC HWOWW CONCEPT 53页设计方案 + 现场复尺42窗）",
    measureTime: "已完成全屋 42 窗复尺（K1/K2按李先生尺寸未测）",
    measureNotes:
      "同步自本地《李度恒20008预算.xlsx》&《李度恒02加工.xlsx》：大量瓷砖口内安装。16樘布+纱（@ $8/in 宽）+ 9樘罗马帘（@ $11/sqft）+ 17樘卷帘（@ $7/sqft）+ 测量$200 + 安装$1200。手动税前 $14,145.29（含8.75%税后 $15,383.00）；电动升级包 +$3,476（电机54×$60 + 遥控17×$8 + Hub $100），电动税后 $19,163.15。",
    selectedProducts:
      "公共区透光布 UK001-2(鑫亚纶) + 卧室遮光布 3002-2(泰纶) + 书房 3003-3(泰纶) + 主卧 3008-1(泰纶) + 白纱 SSY06(臻品) + 卷帘 JL3601/JL2801",
    quoteUsd: 15383,
    depositUsd: 5000,
    totalPaidUsd: 5000,
    paymentMethod: "Zelle",
    factoryName: "臻品 + 鑫亚纶 + 泰纶（三厂分单）",
    factoryOrderNo: "FAC-LDH-20008",
    factoryCostCurrency: "RMB",
    factoryCost: 26800,
    installTime: "到货后安排全屋安装（安装费预算 $1,200）",
    stage: "已收款待下单工厂",
    createdAt: "2026-11-14 08:30",
    updatedAt: "2026-11-14 08:30",
  },
  {
    id: "RT-IRVINE106-01",
    customer: "尔湾106号客户 (Irvine #106)",
    phone: "",
    address: "Irvine, CA (#106)",
    measureTime: "已完成现场拍照测量（照片黄字标注尺寸）",
    measureNotes:
      "来自 Gemini《尔湾106号窗帘测量下单表生成》：现场实拍多房间窗户照片并在图上黄字手写标注尺寸（如二楼次卧 70.5*59.5、客厅推拉门高93.5、主卧、卫生间等），已生成标准 Excel 测量下单表",
    selectedProducts: "全屋卷帘 / 斑马帘 + 客厅推拉门白纱与布帘 + 二楼次卧/主卧定制窗帘",
    quoteUsd: 3180,
    depositUsd: 1500,
    totalPaidUsd: 1500,
    paymentMethod: "Zelle",
    factoryName: "国内主力工厂",
    factoryOrderNo: "FAC-IRV106",
    factoryCostCurrency: "RMB",
    factoryCost: 7200,
    installTime: "预计到货后预约周末上门安装",
    stage: "工厂生产中",
    createdAt: "2026-11-14 08:38",
    updatedAt: "2026-11-14 08:38",
  },
];

const DEFAULT_REMINDERS_SEED: SmartReminder[] = [
  {
    id: "REM-IGNACIO-01",
    dueTime: "今天",
    category: "催收尾款",
    title: "跟进 Ignacio 批发单定金到账并下单工厂 (WS-IGNACIO-01)",
    detail: "Ignacio 留言：收到他客户的 Deposit 后立即付款（6樘电动卷帘 + Smart Hub + 3个遥控器）",
    relatedId: "WS-IGNACIO-01",
    priority: "紧急",
    done: false,
  },
  {
    id: "REM-LIDUHENG-01",
    dueTime: "今天",
    category: "下单工厂",
    title: "李度恒挑高窗帘与罗马帘核对尺寸后发工厂排产 (RT-LIDUHENG-01)",
    detail: "核对挑高窗成品高度与窗帘尺寸款式明细表，确认无误后发国内工厂生产",
    relatedId: "RT-LIDUHENG-01",
    priority: "紧急",
    done: false,
  },
];

export function loadLocalList<T>(key: string, fallback: T[] = []): T[] {
  const seedFallback =
    fallback.length > 0
      ? fallback
      : key === STORAGE_KEYS.wholesale
      ? (DEFAULT_WHOLESALE_SEED as unknown as T[])
      : key === STORAGE_KEYS.retail
      ? (DEFAULT_RETAIL_SEED as unknown as T[])
      : key === STORAGE_KEYS.reminders
      ? (DEFAULT_REMINDERS_SEED as unknown as T[])
      : fallback;
  if (typeof window === "undefined") return seedFallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return seedFallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seedFallback;
  } catch {
    return seedFallback;
  }
}

export function saveLocalList<T>(key: string, list: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(list));
}

const fmtMoney = (amount: number, currency: "USD" | "RMB" = "USD") => {
  const symbol = currency === "RMB" ? "¥" : "$";
  return `${symbol}${(Number(amount) || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// ==========================================
// 2. 智能体自然语言解析器（支持批发、零售、记账、提醒）
// ==========================================

type ParsedAgentAction =
  | {
      kind: "wholesale";
      summary: string;
      customer: string;
      phone: string;
      rawSpec: string;
      parsedSummary: string;
      detailNotes: string;
      quoteUsd: number;
      deliveryMode: "客户自提" | "我去安装";
    }
  | {
      kind: "retail";
      summary: string;
      customer: string;
      phone: string;
      address: string;
      measureTime: string;
      selectedProducts: string;
      quoteUsd: number;
    }
  | {
      kind: "ledger";
      summary: string;
      direction: "收入" | "支出";
      category: LedgerEntry["category"];
      currency: "USD" | "RMB";
      amount: number;
      method: string;
      counterparty: string;
      note: string;
    }
  | {
      kind: "reminder";
      summary: string;
      dueTime: string;
      category: SmartReminder["category"];
      title: string;
      detail: string;
    };

function parseSmartInput(text: string): ParsedAgentAction {
  const clean = text.trim();
  const phoneMatch = clean.match(/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b1[3-9]\d{9}\b/);
  const phone = phoneMatch ? phoneMatch[0] : "";

  // 1) 判断是否为记账指令
  const isLedger =
    /^(?:记账|记一笔|账本|收入|支出|花了|付款|付了|收到|收款|加油|房租|水电|工资|买工具)/.test(clean) ||
    (/(?:花了|付了|收到|报销|开销|支出|入账)/.test(clean) && !/(?:尺寸|宽|高|测量|x|×)/i.test(clean));

  if (isLedger) {
    const isIncome = /收到|收款|收入|定金|尾款|入账/.test(clean) && !/付给|支出|花了/.test(clean);
    const isRmb = /人民币|RMB|CNY|¥|元|块/.test(clean) && !/\$|美元|USD|刀/.test(clean);
    const amountMatch = clean.match(/(?:[$¥]|USD|RMB|CNY)?\s*(\d+(?:\.\d{1,2})?)\s*(?:美元|刀|元|块|RMB|USD)?/i);
    const amount = amountMatch ? Number(amountMatch[1]) : 0;

    let category: LedgerEntry["category"] = isIncome ? "零售定制收款" : "其他日常收支";
    if (/批发/.test(clean) && isIncome) category = "批发订单收款";
    else if (/工厂|货款|大货|加工费/.test(clean)) category = "支付工厂货款";
    else if (/运费|物流|快递|海运|空运|UPS|FedEx/i.test(clean)) category = "国际/本地运费";
    else if (/安装费|安装工/.test(clean)) category = "安装工费";
    else if (/房租|租金|仓库/.test(clean)) category = "公司房租与仓库";
    else if (/加油|油费|洗车|保养|停车|过路费/.test(clean)) category = "车辆加油与保养";
    else if (/水电|电费|水费|网费|电话费|办公/.test(clean)) category = "水电网络办公";
    else if (/工具|螺丝|钻头|轨道配件|耗材|Home\s*Depot/i.test(clean)) category = "工具与配件采购";
    else if (/工资|薪水|人工/.test(clean)) category = "员工工资";

    let method = "Zelle";
    if (/支票|Check/i.test(clean)) method = "支票";
    else if (/现金|Cash/i.test(clean)) method = "现金";
    else if (/信用卡|刷卡|Card|Stripe/i.test(clean)) method = "信用卡";
    else if (/微信|支付宝/.test(clean)) method = "微信/支付宝";
    else if (/转账|ACH|Wire/i.test(clean)) method = "银行转账";

    return {
      kind: "ledger",
      summary: `${isIncome ? "收入" : "支出"} · ${category} · ${fmtMoney(amount, isRmb ? "RMB" : "USD")}`,
      direction: isIncome ? "收入" : "支出",
      category,
      currency: isRmb ? "RMB" : "USD",
      amount,
      method,
      counterparty: "",
      note: clean,
    };
  }

  // 2) 判断是否为零售预约测量
  const isRetail =
    /^(?:零售|预约测量|上门测量|量窗帘|约测量)/.test(clean) ||
    (/(?:预约|约了|去量|上门测量|量尺寸|量窗帘)/.test(clean) && !/批发/.test(clean));

  if (isRetail) {
    const customerMatch = clean.match(/(?:客户|联系人|业主|找我)?[:：]?\s*([\u4e00-\u9fa5A-Za-z]{2,12}?)(?:女士|先生|姐|哥|总|家|预约|约|电话|地址)/);
    const customer = customerMatch ? customerMatch[1] : "新零售客户";
    const addrMatch = clean.match(/(?:地址|位置|去|在)[:：]?\s*([^\n，,。；;]{4,40})/);
    const timeMatch = clean.match(/(?:时间|预约|约在|明天|后天|周[一二三四五六日天]|\d{4}-\d{1,2}-\d{1,2}|\d{1,2}月\d{1,2}日)[^\n，,。；;]{0,16}/);
    return {
      kind: "retail",
      summary: `零售预约测量 · ${customer} · ${timeMatch ? timeMatch[0] : "待确认时间"}`,
      customer,
      phone,
      address: addrMatch ? addrMatch[1].trim() : "",
      measureTime: timeMatch ? timeMatch[0].trim() : "明天 14:00",
      selectedProducts: clean,
      quoteUsd: 0,
    };
  }

  // 3) 判断是否为单纯提醒
  if (/^(?:提醒|待办|别忘了|闹钟)/.test(clean)) {
    return {
      kind: "reminder",
      summary: `新增待办提醒 · ${clean.slice(0, 24)}`,
      dueTime: "今天 16:00",
      category: /取货|到货/.test(clean)
        ? "到货取货通知"
        : /安装/.test(clean)
        ? "上门安装"
        : /测量/.test(clean)
        ? "预约测量"
        : /收款|尾款/.test(clean)
        ? "催收尾款"
        : "日常待办",
      title: clean.replace(/^(?:提醒|待办|别忘了)[:：]?\s*/, "").slice(0, 36),
      detail: clean,
    };
  }

  // 4) 默认作为「批发客户发型号与尺寸询价」调用 extractInquiryLines 解析
  const extracted = extractInquiryLines(clean);
  const parsedLines = extracted.lines.map((line, idx) => {
    const d = line.draft;
    const size =
      d.widthInches && d.heightInches
        ? `${d.widthInches}" × ${d.heightInches}"`
        : "尺寸待核对";
    const opts = d.options.length ? ` [${d.options.join("/")}]` : "";
    return `第${idx + 1}窗: 型号 ${d.productCode || "待确认"} | 尺寸 ${size} | 数量 ${d.quantity || 1}${opts}`;
  });

  const customerMatch = clean.match(/(?:客户|经销商|Dealer)[:：]?\s*([^\n，,。；;]{2,20})/i);
  const priceMatch = clean.match(/(?:报价|总价|价格|金额)[:：]?\s*\$?\s*(\d+(?:\.\d{1,2})?)/);
  const notesMatch = clean.match(/(?:标注|细节|备注|说明|要求)[:：]\s*([^\n]+)/);

  return {
    kind: "wholesale",
    summary: `批发询价解析 · 共识别 ${extracted.lines.length} 个窗位`,
    customer: customerMatch ? customerMatch[1].trim() : "批发客户",
    phone,
    rawSpec: clean,
    parsedSummary: parsedLines.join("；"),
    detailNotes: notesMatch ? notesMatch[1].trim() : "请核对安装方式（内装/外装）、控制方向及配件要求",
    quoteUsd: priceMatch ? Number(priceMatch[1]) : 0,
    deliveryMode: /我去安装|上门安装|代安装/.test(clean) ? "我去安装" : "客户自提",
  };
}

// ==========================================
// 3. 模块一：智能体工作台（AI 业务总助手）
// ==========================================

export function SmartAgentWorkbench({
  go,
  notify,
}: {
  go: (moduleName: string) => void;
  notify: (msg: string) => void;
}) {
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState<ParsedAgentAction | null>(null);
  const [botProvider, setBotProvider] = useState<"local" | "gemini" | "grok" | "openai">("local");
  const [apiKey, setApiKey] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const [activeTool, setActiveTool] = useState<"highWindow" | "perInchQuote" | "translator" | "usdInvoice" | "specTable">("highWindow");

  // 1) 挑高窗户尺寸核算状态（含左右外扩与高度上移规则，来自 Gemini《窗帘效果图制作》&《挑高窗户尺寸核算与确认》）
  const [hwCalc, setHwCalc] = useState({
    room: "挑高拱形窗客厅（双窗）",
    rawWidthIn: "72",
    rawHeightIn: "96",
    extendEachSideIn: "10",
    extendTopIn: "10",
    fullness: "2.2",
    fabricWidthIn: "126",
    floorDeductionIn: "1",
    trackDeductionIn: "1.5",
    rodOrTrack: "黑色罗马杆 (Black Rod)",
    headerStyle: "韩褶/美式打褶布艺帘 (Pinch Pleat)",
    fabricCode: "标牌实拍面料 (Width: 320cm / 126\", 310g/m²)",
  });

  // 1.5) 按宽度 $/英寸 批量报价状态（来自 Gemini《窗帘报价明细表》：“2.2/英寸，最后一个2.5/英寸” & 《窗帘面料衬里价格调整咨询》）
  const [defaultRatePerIn, setDefaultRatePerIn] = useState("2.20");
  const [lastRatePerIn, setLastRatePerIn] = useState("2.50");
  const [perInchLinesText, setPerInchLinesText] = useState(
    [
      "1 | 1 | DN | 80 | 95 | JZ01-5 | 2.20",
      "2 | 1 | LR 1 | 63 | 95 | JZ01-5 | 2.20",
      "3 | 1 | LR 2 | 47 | 95 | JZ01-5 | 2.20",
      "4 | 1 | LR 3 | 47 | 95 | JZ01-5 | 2.20",
      "5 | 1 | BKF 1 | 43 | 95 | JZ01-5 | 2.20",
      "6 | 1 | BKF 2 | 85 | 95 | JZ01-5 | 2.20",
      "7 | 1 | BKF 3 | 41.875 | 95 | JZ01-5 | 2.20",
      "8 | 1 | BR1-1 | 75 | 95 | JZ01-5 | 2.20",
      "9 | 1 | BR1-2 | 75 | 95 | JZ01-5 | 2.20",
      "10 | 1 | G | 34 | 58 | JZ01-5 (not floor) | 2.20",
      "11 | 1 | LOFT | 75 | 95 | JZ01-5 | 2.20",
      "12 | 1 | OFF | 68 | 95 | JZ01-5 | 2.20",
      "13 | 1 | MstrBR 1 | 35 | 95 | JZ01-5 | 2.20",
      "14 | 1 | MstrBR 2 | 78 | 95 | JZ01-5 | 2.20",
      "15 | 1 | MstrBR 3 | 35 | 95 | JZ01-5 | 2.20",
      "16 | 1 | MB | 35 | 55 | JZ03-2 | 2.50",
    ].join("\n")
  );

  const parsedPerInchRows = useMemo(() => {
    const rawLines = perInchLinesText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    return rawLines.map((line, idx) => {
      const parts = line.split("|").map((p) => p.trim());
      const ln = parts[0] || String(idx + 1);
      const qty = Number(parts[1]) || 1;
      const room = parts[2] || `Room ${idx + 1}`;
      const widthIn = Number(parts[3]) || 0;
      const lengthIn = parts[4] || "95";
      const style = parts[5] || "JZ01-5";
      const fallbackRate = idx === rawLines.length - 1 ? Number(lastRatePerIn) || 2.5 : Number(defaultRatePerIn) || 2.2;
      const rate = parts[6] !== undefined && parts[6] !== "" ? Number(parts[6]) : fallbackRate;
      const lineTotal = Math.round(widthIn * rate * qty * 100) / 100;
      return { ln, qty, room, widthIn, lengthIn, style, rate, lineTotal };
    });
  }, [perInchLinesText, defaultRatePerIn, lastRatePerIn]);

  const perInchGrandTotal = useMemo(
    () => parsedPerInchRows.reduce((s, r) => s + r.lineTotal, 0),
    [parsedPerInchRows]
  );

  // 2) 客户沟通中英翻译与话术状态（新增 linerPriceConsult 对应《窗帘面料衬里价格调整咨询》）
  const [transScene, setTransScene] = useState<
    "measureThanks" | "sizeConfirm" | "linerPriceConsult" | "quoteFollow" | "installNotice"
  >("measureThanks");
  const [transClient, setTransClient] = useState("Ignacio");
  const [transCustomZh, setTransCustomZh] = useState("");

  // 3) 美金商业发票 (USD Commercial Invoice) 状态
  const [invForm, setInvForm] = useState({
    invoiceNo: `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-01`,
    clientName: "Ignacio / 李度恒",
    clientAddress: "Los Angeles, CA",
    itemsText: "1. Living Room High Window Drapery | 144\" W x 196\" H | Qty 1 | $1,480.00\n2. Motorized Track System | 144\" | Qty 1 | $360.00\n3. Master Bedroom Roman Shade | 48\" W x 64\" H | Qty 2 | $520.00",
    shippingUsd: "0",
    depositPaidUsd: "1000",
  });

  // 4) 李度恒02 (20008全屋42窗) 实单预算表 & 加工拆单表状态（同步自《李度恒02加工.xlsx》/《李度恒20008预算.xlsx》/《李度恒20008 窗帘.pdf》）
  const LIDUHENG_20008_42_ROWS = [
    "客厅1 | #01 (PDF P.07 壁炉左窗) | 79 | 88 | 对开 | 透光布+纱 UK001-2 + ssy06 | 鑫亚纶+臻品 (双层杆/加工高86\") | $8/in = $632.00",
    "客厅2 | #02 (PDF P.06 壁炉右窗) | 78 | 88 | 对开 | 透光布+纱 UK001-2 + ssy06 | 鑫亚纶+臻品 (双层杆/加工高86\") | $8/in = $624.00",
    "客厅3 | #03 (PDF P.08 折面左窄窗) | 37 | 88 | 对开 | 透光布+纱 UK001-2 + ssy06 | 鑫亚纶+臻品 (双层杆/加工高86\") | $8/in = $296.00",
    "客厅4 | #04 (PDF P.10 W4正面左中窗) | 52 | 88 | 单开 | 透光布+纱 UK001-2 + ssy06 | 鑫亚纶+臻品 (双层杆/加工高86\") | $8/in = $416.00",
    "客厅5 | #05 (PDF P.10 W5正面右中窗) | 52 | 88 | 单开 | 透光布+纱 UK001-2 + ssy06 | 鑫亚纶+臻品 (双层杆/加工高86\") | $8/in = $416.00",
    "客厅6 | #06 (PDF P.09 W6折面右窄窗) | 36 | 88 | 对开 | 透光布+纱 UK001-2 + ssy06 | 鑫亚纶+臻品 (双层杆/加工高86\") | $8/in = $288.00",
    "客厅7 | #07 (PDF P.09 W7最右大窗) | 76 | 88 | 对开 | 透光布+纱 UK001-2 + ssy06 | 鑫亚纶+臻品 (双层杆/加工高86\") | $8/in = $608.00",
    "餐厅 | #08 (PDF P.12 餐厅12'9\"大窗) | 164 | 92 | 对开 | 透光布+纱 UK001-2 + ssy06 | 鑫亚纶+臻品 (双层杆/加工高90\") | $8/in = $1,312.00",
    "K1 (厨房1) | #09 (PDF P.16 冰箱左侧窗) | 66 | 46 | 口内 | 透光卷帘 JL3601 | 21.08 sqft @ $7/sqft = $147.58 | ⚠️ 按照李先生的尺寸未测量",
    "K2 (厨房2) | #10 (PDF P.18 水槽窗) | 35 | 46.25 | 口内 | 透光卷帘 JL3601 | 11.24 sqft @ $7/sqft = $78.69 | ⚠️ 按照李先生的尺寸未测量",
    "小楼梯边 | #11 (PDF P.14 早餐区推拉门D1) | 88 | 88.5 | 对开 | 透光布+纱 UK001-2 + ssy06 | 鑫亚纶+臻品 (双层杆/加工高86.5\") | $8/in = $704.00",
    "1卫1 | #12 (一楼卫生间1) | 35.5 | 41 | 口内 | 透光卷帘 JL3601 | 10.11 sqft @ $7/sqft = $70.75 | 大量瓷砖口内安装",
    "FR1sd | #13 (PDF P.20 家庭厅双扇门左) | 26 | 85 | 口外 | 透光卷帘 JL3601 | 15.35 sqft @ $7/sqft = $107.43 | ❓ 电影院是否需要遮光",
    "FR2sd | #14 (PDF P.20 家庭厅双扇门右) | 26 | 85 | 口外 | 透光卷帘 JL3601 | 15.35 sqft @ $7/sqft = $107.43 | ❓ 电影院是否需要遮光",
    "FR3 | #15 (PDF P.20 家庭厅W1中间横窗) | 87.5 | 100.5 | 对开 | 透光布+纱 UK001-2 + ssy06 | 鑫亚纶+臻品 (加工高98.5\") = $704.00 | ❓ 电影院是否需要遮光",
    "FR4 | #16 (PDF P.22 家庭厅W2屏幕右窄窗) | 17.875 | 59 | 口内 | 透光罗马 UK001-2 | 鑫亚纶 (10 sqft起 @ $11 = $110.00) | ❓ 电影院是否需要遮光",
    "1卫2 | #17 (PDF P.26 一楼客卫高窗W2) | 27.625 | 22 | 口内 | 透光卷帘 JL3601 | 10 sqft起 @ $7/sqft = $70.00 | 瓷砖口内安装",
    "1卧 | #18 (PDF P.24 一楼客卧窗W1) | 104 | 101 | 对开 | 遮光布+纱 3002-2 + ssy06 | 泰纶+臻品 (双层杆/加工高99\") | $8/in = $832.00",
    "书房1 | #19 (PDF P.05 书房W1左窄窗) | 22.875 | 59 | 口内 | 透光罗马 3003-3 | 泰纶 (10 sqft起 @ $11 = $110.00) | ❓ 是否遮光",
    "书房2 | #20 (PDF P.05 书房W2中间双扇窗) | 66 | 101 | 对开 | 透光布+纱 3003-3/UK001-2 + ssy06 | 双层杆 (加工高99\") = $528.00 | ❓ 是否遮光",
    "书房3 | #21 (PDF P.03 书房玻璃门卷帘) | 30 | 85 | 口内 | 透光卷帘 JL3601 | 17.71 sqft @ $7/sqft = $123.96 | ❓ 是否遮光",
    "书房4 | #22 (PDF P.03 书房5'5\"主窗) | 79 | 101 | 对开 | 透光布+纱 3003-3/UK001-2 + ssy06 | 双层杆 (加工高99\") = $632.00 | ❓ 是否遮光",
    "2主卧1 | #23 (PDF P.28 主卧双扇玻璃门D1) | 98 | 100 | 对开 | 遮光布+纱 3008-1/3002-2 + ssy06 | 泰纶+臻品 (加工高98\") | $8/in = $784.00",
    "2主卧2 | #24 (PDF P.29 主卧右窗W1) | 34.75 | 59 | 口内 | 遮光罗马 3008-1 | 泰纶 (14.24 sqft @ $11 = $156.62) | 主卧罗马帘",
    "2主卧卫1 | #25 (PDF P.34 主卫马桶间窗W5) | 47 | 34.625 | 口内 | 透光卷帘 JL3601 | 11.30 sqft @ $7/sqft = $79.11 | 瓷砖口内安装",
    "2主卧卫2 | #26 (PDF P.31 主卫左高窗W2) | 33.625 | 22.25 | 口内 | 透光卷帘 JL3601 | 5.20 sqft @ $7/sqft = $36.37 | 淋浴房高窗",
    "2主卧卫3 | #27 (PDF P.32 主卫浴缸中窗W3) | 69.375 | 52.25 | 口内 | 透光卷帘 JL3601 | 25.17 sqft @ $7/sqft = $176.21 | 浴缸上方大窗",
    "2主卧卫4 | #28 (PDF P.32 主卫右窗W4) | 33.875 | 52.75 | 口内 | 透光卷帘 JL3601 | 12.41 sqft @ $7/sqft = $86.86 | 瓷砖口内安装",
    "2主卧衣帽 | #29 (PDF P.36 主卧衣帽间W6) | 47 | 34.75 | 口内 | 透光罗马 3008-1 | 泰纶 (11.34 sqft @ $11 = $124.76) | 衣帽间罗马帘",
    "2卧1-1 | #30 (PDF P.38 弟弟房间W1左窗) | 63 | 100 | 对开 | 遮光布+纱 3002-2 + ssy06 | 泰纶+臻品 (加工高98\") | $8/in = $504.00",
    "2卧1-2 | #31 (PDF P.38 弟弟房间W2右窗) | 59 | 100 | 对开 | 遮光布+纱 3002-2 + ssy06 | 泰纶+臻品 (加工高98\") | $8/in = $472.00",
    "2卧2-1 | #32 (PDF P.40 哥哥房间W1主窗) | 59.125 | 59 | 口内 | 遮光罗马 3002-2 | 泰纶 (24.22 sqft @ $11 = $266.47) | 口内安装",
    "2卧2-2sd | #33 (PDF P.40 哥哥房D1玻璃门) | 30 | 69 | 口内/口外 | 遮光卷帘 JL2801 | 14.38 sqft @ $7/sqft = $100.63 | ⚠️ 预算表标口外/加工表标口内",
    "2卫 | #34 (PDF P.42 哥哥房浴室窗W2) | 46.25 | 33.5 | 口内 | 透光卷帘 JL3601 | 10.76 sqft @ $7/sqft = $75.32 | 瓷砖口内安装",
    "2卧3-1sd | #35 (PDF P.46 姐姐房D1玻璃门) | 30 | 70 | 口内/口外 | 遮光卷帘 JL2801 | 14.58 sqft @ $7/sqft = $102.08 | ⚠️ 预算表标口外/加工表标口内",
    "2卧3-2 | #36 (PDF P.46 姐姐房W1中间大窗) | 59 | 59.25 | 口内 | 遮光罗马 3002-2 | 泰纶 (24.28 sqft @ $11 = $267.04) | 口内安装",
    "2卧3-3 | #37 (PDF P.47 姐姐房W2小窗) | 47 | 35.25 | 口内 | 遮光罗马 3002-2 | 泰纶 (11.51 sqft @ $11 = $126.56) | 口内安装",
    "2卧3-4 | #38 (PDF P.47 姐姐房W3右窗) | 47 | 35 | 口内 | 遮光罗马 3002-2 | 泰纶 (11.42 sqft @ $11 = $125.66) | 口内安装",
    "2卧卫 | #39 (PDF P.49 姐姐房浴室窗W4) | 46.125 | 33.5 | 口内 | 透光卷帘 JL3601 | 10.73 sqft @ $7/sqft = $75.11 | 瓷砖口内安装",
    "车库1 | #40 (PDF P.51 车库入口窄窗W1) | 22.875 | 59 | 口内 | 透光罗马 UK001-2 | 鑫亚纶 (10 sqft起 @ $11 = $110.00) | 口内安装",
    "车库2 | #41 (PDF P.53 车库左窗W2) | 47 | 34.75 | 口内 | 透光卷帘 JL3601 | 11.34 sqft @ $7/sqft = $79.39 | 口内安装",
    "车库3 | #42 (PDF P.53 车库右窗W3) | 46.75 | 34.875 | 口内 | 透光卷帘 JL3601 | 11.32 sqft @ $7/sqft = $79.26 | 口内安装",
  ];

  const [rawExcelProject, setRawExcelProject] = useState("李度恒02-20008全屋42窗预算与加工总表");
  const [rawExcelRowsText, setRawExcelRowsText] = useState(LIDUHENG_20008_42_ROWS.join("\n"));
  const [factorySplitTab, setFactorySplitTab] = useState<"all42" | "sheer16" | "drapery16" | "roman9" | "roller17">("all42");

  const parsedRawExcelRows = useMemo(() => {
    return rawExcelRowsText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((line, idx) => {
        const parts = line.split("|").map((p) => p.trim());
        return {
          seq: idx + 1,
          floorRoom: parts[0] || `窗位 ${idx + 1}`,
          winCode: parts[1] || `W-${String(idx + 1).padStart(2, "0")}`,
          rawWidth: parts[2] || "",
          rawHeight: parts[3] || "",
          mountType: parts[4] || "IB",
          productStyle: parts[5] || "",
          controlHardware: parts[6] || "",
          rawNote: parts[7] || "",
        };
      });
  }, [rawExcelRowsText]);

  const exportStrictExcelCsv = () => {
    const header = "序号,楼层/房间(户型图定位),窗号,原始测量宽(严格原值),原始测量高(严格原值),安装方式(IB/OB),产品款式与面料型号,五金杆轨/控制方式,手写单原始备注";
    const rows = parsedRawExcelRows.map((r) =>
      [r.seq, r.floorRoom, r.winCode, r.rawWidth, r.rawHeight, r.mountType, r.productStyle, r.controlHardware, r.rawNote]
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const blob = new Blob(["\ufeff" + [header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${rawExcelProject}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    notify("已严格按原始数据导出 Excel (CSV) 表格！");
  };

  const highWindowResult = useMemo(() => {
    const rawW = Number(hwCalc.rawWidthIn) || 0;
    const rawH = Number(hwCalc.rawHeightIn) || 0;
    const extSide = Number(hwCalc.extendEachSideIn) || 0;
    const extTop = Number(hwCalc.extendTopIn) || 0;
    const w = rawW + extSide * 2; // 宽度比窗两侧各增加 N 英寸
    const h = rawH + extTop; // 高度增加 N 英寸
    const fullness = Number(hwCalc.fullness) || 2;
    const fabW = Number(hwCalc.fabricWidthIn) || 126;
    const deductFloor = Number(hwCalc.floorDeductionIn) || 0;
    const deductTrack = Number(hwCalc.trackDeductionIn) || 0;
    const finishedH = Math.max(0, h - deductFloor - deductTrack);
    const totalFabricWidthNeeded = w * fullness + 12; // 含两侧折边
    const panelsCount = Math.max(2, Math.ceil(totalFabricWidthNeeded / fabW));
    const cutHeightEachPanel = finishedH + 16; // 含底边与帘头折边
    const totalYards = Math.ceil(((panelsCount * cutHeightEachPanel) / 36) * 10) / 10;
    const isOver120 = finishedH > 120;
    const isOver244 = finishedH > 244;
    const heightWarning = isOver244
      ? "⚠️ 挑高超过 244 英寸（双倍超高规则区间），请务必确认面料定宽竖拼与脚手架安装费！"
      : isOver120
      ? "⚠️ 挑高超过 120 英寸（超高窗区间），320cm(126\")定高面料需改定宽竖拼，需计入超高加工附加费与高空安装费。"
      : "✓ 高度在 320cm (126\") 宽幅面料常规加工范围内，可定高无缝制作。";
    const renderPromptZh = `给前面两个窗添加布艺窗帘，布料型号是最后一张图片（${hwCalc.fabricCode}），宽度比窗两侧各增加 ${extSide} 英寸（总成品宽 ${w}"），高度增加 ${extTop} 英寸（安装总高 ${h}"，扣减后成品净高 ${Math.round(finishedH * 100) / 100}"），配 ${hwCalc.rodOrTrack}，款式为 ${hwCalc.headerStyle}，制作真实室内光影效果图。`;
    return {
      rawW,
      rawH,
      extSide,
      extTop,
      rodWidth: w,
      finishedW: w,
      finishedH: Math.round(finishedH * 100) / 100,
      panelsCount,
      totalYards,
      heightWarning,
      renderPromptZh,
    };
  }, [hwCalc]);

  const bilingualTemplates: Record<typeof transScene, { title: string; zh: string; en: string }> = {
    measureThanks: {
      title: "感谢上门测量尺寸（中英双语）",
      zh: `${transClient} 您好！非常感谢今天让我上门为您测量窗户尺寸。我已经把所有房间的精确尺寸和窗户细节整理完毕，正在为您核算最优的窗帘款式与报价方案，稍后发给您确认！${transCustomZh ? `\n补充说明：${transCustomZh}` : ""}`,
      en: `Hi ${transClient}, thank you so much for having me over today to measure your windows! I have recorded all the exact dimensions and window details. I'm currently preparing your customized curtain options and quote, and will send them over shortly for your review.${transCustomZh ? `\nNote: ${transCustomZh}` : ""}`,
    },
    sizeConfirm: {
      title: "挑高窗/定制尺寸与款式确认",
      zh: `${transClient} 您好！这是为您核算好的【窗帘尺寸与款式明细表】。特别是挑高窗户的成品高度、离地间隙与开合方式，请您过目确认。确认无误并支付定金后，我将立即为您下单给工厂排产。`,
      en: `Hi ${transClient}, please find attached your Window Dimension & Style Specification Sheet. Please kindly review and confirm the finished widths, heights (especially for the high-ceiling windows), and opening styles. Once confirmed and the deposit is received, I will place the production order with our factory right away.`,
    },
    linerPriceConsult: {
      title: "窗帘面料衬里价格调整咨询（Blackout vs Light Filtering Liner vs No Liner）",
      zh: `【经销商原话翻译】：\n“Gunther，如果我们换成透光面料（Light Filtering），最低能做到多少钱？这个客户在价格上非常难缠/咬得很紧，所以我想了解一下：如果把遮光衬里（Blackout Liner）换成透光衬里（Light Filtering Liner），价格能便宜多少？或者干脆完全不做衬里（No Liner）？这样价格是不是会更划算？”\n\n【给客户的中文回复参考】：\n${transClient} 您好！为了帮您拿下这个对价格敏感的客户，我为您核算了三种衬里方案的对比报价：\n1. 原方案（加全遮光衬里 Blackout Liner）：遮光隔热效果最好；\n2. 降价方案A（改用透光衬里 Light Filtering Liner）：既有垂感又能降低单价；\n3. 极致性价比方案B（不加衬里 Unlined / No Liner）：价格最低，最具价格优势。${transCustomZh ? `\n补充说明：${transCustomZh}` : ""}`,
      en: `Hi ${transClient}, to help you close this price-sensitive customer, I ran the numbers for all three lining options so you can give them flexible choices:\n\n1. With Blackout Liner (Original): Best light control and thermal insulation.\n2. With Light Filtering Liner: Still keeps great body/drape while bringing the cost down.\n3. Unlined (No Liner at all): Lowest possible price point — great if budget is their #1 priority.\n\nLet me know which option works best for your customer and I'll lock in the order for you!${transCustomZh ? `\nNote: ${transCustomZh}` : ""}`,
    },
    quoteFollow: {
      title: "报价发送与付款下单确认",
      zh: `${transClient} 您好！您的窗帘报价单与美金发票（Invoice）已整理好，包含了产品明细、五金轨道及安装费用。如果您对方案满意，可通过 Zelle 或支票支付定金，收到后我马上安排工厂制作。`,
      en: `Hi ${transClient}, your customized curtain quote and USD Invoice are ready (including fabric, hardware/tracks, and installation). Once you approve and send the deposit via Zelle or check, we will immediately start factory production for you.`,
    },
    installNotice: {
      title: "工厂到货通知（取货 / 预约上门安装）",
      zh: `${transClient} 您好！好消息，您定制的窗帘已经从工厂顺利到货并完成检查！请问您这周哪天方便？我们可以约个时间上门为您安装（或您随时来仓库取货）。`,
      en: `Hi ${transClient}, great news! Your custom curtains/shades have arrived from the factory and passed inspection. What day works best for you this week for installation (or warehouse pickup)? Looking forward to hearing from you!`,
    },
  };

  const parsedInvoiceLines = useMemo(() => {
    return invForm.itemsText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((line, i) => {
        const parts = line.split("|").map((p) => p.trim());
        const priceStr = parts[parts.length - 1] || "$0";
        const amount = Number(priceStr.replace(/[^0-9.]/g, "")) || 0;
        return {
          index: i + 1,
          desc: parts[0] || line,
          size: parts.length > 2 ? parts[1] : "Custom",
          qty: parts.length > 3 ? parts[2] : "1",
          amount,
        };
      });
  }, [invForm.itemsText]);

  const invSubtotal = parsedInvoiceLines.reduce((s, r) => s + r.amount, 0);
  const invShipping = Number(invForm.shippingUsd) || 0;
  const invTotal = invSubtotal + invShipping;
  const invDeposit = Number(invForm.depositPaidUsd) || 0;
  const invBalance = Math.max(0, invTotal - invDeposit);

  const wholesaleList = useMemo(() => loadLocalList<WholesaleItem>(STORAGE_KEYS.wholesale), []);
  const retailList = useMemo(() => loadLocalList<RetailItem>(STORAGE_KEYS.retail), []);
  const ledgerList = useMemo(() => loadLocalList<LedgerEntry>(STORAGE_KEYS.ledger), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.aiConfig) || "{}");
      if (saved.provider) setBotProvider(saved.provider);
      if (saved.apiKey) setApiKey(saved.apiKey);
    } catch {
      // ignore
    }
  }, []);

  const saveConfig = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.aiConfig, JSON.stringify({ provider: botProvider, apiKey }));
    }
    setShowConfig(false);
    notify("智能体模型配置已保存在本机");
  };

  const handleAnalyze = () => {
    if (!input.trim()) {
      notify("请先输入或粘贴客户消息、预约测量或记账内容");
      return;
    }
    setPreview(parseSmartInput(input));
  };

  const confirmAction = () => {
    if (!preview) return;
    const now = new Date().toLocaleString("zh-CN", { hour12: false });

    if (preview.kind === "wholesale") {
      const list = loadLocalList<WholesaleItem>(STORAGE_KEYS.wholesale);
      const newItem: WholesaleItem = {
        id: `WS-${Date.now().toString().slice(-6)}`,
        customer: preview.customer,
        phone: preview.phone,
        rawSpec: preview.rawSpec,
        parsedSummary: preview.parsedSummary,
        detailNotes: preview.detailNotes,
        quoteUsd: preview.quoteUsd,
        paidUsd: 0,
        paymentMethod: "Zelle",
        factoryName: "",
        factoryOrderNo: "",
        factoryCostCurrency: "RMB",
        factoryCost: 0,
        deliveryMode: preview.deliveryMode,
        installAddress: "",
        stage: preview.quoteUsd > 0 ? "已报价待付款" : "待报价标注",
        createdAt: now,
        updatedAt: now,
      };
      saveLocalList(STORAGE_KEYS.wholesale, [newItem, ...list]);
      notify(`已为您建立批发单 ${newItem.id}（${newItem.customer}）`);
      setInput("");
      setPreview(null);
      go("批发业务管理");
      return;
    }

    if (preview.kind === "retail") {
      const list = loadLocalList<RetailItem>(STORAGE_KEYS.retail);
      const newItem: RetailItem = {
        id: `RT-${Date.now().toString().slice(-6)}`,
        customer: preview.customer,
        phone: preview.phone,
        address: preview.address,
        measureTime: preview.measureTime,
        measureNotes: "",
        selectedProducts: preview.selectedProducts,
        quoteUsd: preview.quoteUsd,
        depositUsd: 0,
        totalPaidUsd: 0,
        paymentMethod: "Zelle",
        factoryName: "",
        factoryOrderNo: "",
        factoryCostCurrency: "RMB",
        factoryCost: 0,
        installTime: "待定",
        stage: "已预约待测量",
        createdAt: now,
        updatedAt: now,
      };
      saveLocalList(STORAGE_KEYS.retail, [newItem, ...list]);

      // 同步写入提醒
      const reminders = loadLocalList<SmartReminder>(STORAGE_KEYS.reminders);
      reminders.unshift({
        id: `REM-${Date.now().toString().slice(-6)}`,
        dueTime: preview.measureTime,
        category: "预约测量",
        title: `上门测量：${preview.customer}`,
        detail: `地址：${preview.address || "待补充"} · 电话：${preview.phone || "待补充"} · 需求：${preview.selectedProducts}`,
        relatedId: newItem.id,
        priority: "紧急",
        done: false,
      });
      saveLocalList(STORAGE_KEYS.reminders, reminders);

      notify(`已为您创建零售预约单 ${newItem.id} 并加入测量提醒`);
      setInput("");
      setPreview(null);
      go("零售定制管理");
      return;
    }

    if (preview.kind === "ledger") {
      const list = loadLocalList<LedgerEntry>(STORAGE_KEYS.ledger);
      const entry: LedgerEntry = {
        id: `ACC-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().slice(0, 10),
        direction: preview.direction,
        category: preview.category,
        currency: preview.currency,
        amount: preview.amount,
        method: preview.method,
        relatedOrderId: "",
        counterparty: preview.counterparty,
        note: preview.note,
        createdAt: now,
      };
      saveLocalList(STORAGE_KEYS.ledger, [entry, ...list]);
      notify(`已记入账本：${entry.direction} ${fmtMoney(entry.amount, entry.currency)}（${entry.category}）`);
      setInput("");
      setPreview(null);
      go("公司日常记账");
      return;
    }

    if (preview.kind === "reminder") {
      const reminders = loadLocalList<SmartReminder>(STORAGE_KEYS.reminders);
      reminders.unshift({
        id: `REM-${Date.now().toString().slice(-6)}`,
        dueTime: preview.dueTime,
        category: preview.category,
        title: preview.title,
        detail: preview.detail,
        relatedId: "",
        priority: "紧急",
        done: false,
      });
      saveLocalList(STORAGE_KEYS.reminders, reminders);
      notify("已加入待办与提醒");
      setInput("");
      setPreview(null);
      go("待办与提醒");
    }
  };

  return (
    <>
      <div className="module-head">
        <div>
          <span className="eyebrow">智能业务助理 · 批发 / 零售 / 提醒 / 记账</span>
          <h1>AI 智能体工作台</h1>
          <p>
            直接把客户的微信/短信发到这里，或用一句话交代工作：自动识别【批发询价】、【零售约测量】、【公司日常记账】与【待办提醒】。
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="secondary" onClick={() => setShowConfig((v) => !v)}>
            ⚙ 智能体接口设置（{botProvider === "local" ? "内置引擎" : botProvider.toUpperCase()}）
          </button>
          <a className="secondary" href="/ai" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
            打开深度窗位拆单审核台 →
          </a>
        </div>
      </div>

      {showConfig && (
        <section className="panel" style={{ marginBottom: 16 }}>
          <h2>智能体模型选择（支持 Gemini / Grok / OpenAI）</h2>
          <p style={{ fontSize: 12, color: "#5b655f", marginBottom: 12 }}>
            系统默认启用<strong>内置窗帘业务规则引擎</strong>（无需联网、秒级解析分数英寸与账目）。如需接入 Grok 或 Gemini 云端大模型，可在下方选择并填入密钥：
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
              选择智能体大脑
              <select
                value={botProvider}
                onChange={(e) => setBotProvider(e.target.value as typeof botProvider)}
                style={{ padding: 8, borderRadius: 8, border: "1px solid #d5ddd8" }}
              >
                <option value="local">内置窗帘业务引擎（推荐 · 零延迟且精确）</option>
                <option value="gemini">Google Gemini 智能体</option>
                <option value="grok">xAI Grok Bot 接口</option>
                <option value="openai">OpenAI ChatGPT 接口</option>
              </select>
            </label>
            {botProvider !== "local" && (
              <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
                API 密钥（仅保存在您当前电脑浏览器中）
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`输入 ${botProvider.toUpperCase()} API Key`}
                  style={{ padding: 8, borderRadius: 8, border: "1px solid #d5ddd8" }}
                />
              </label>
            )}
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="primary" onClick={saveConfig}>
              保存智能体配置
            </button>
          </div>
        </section>
      )}

      <section className="kpi-grid">
        <article className="kpi" onClick={() => go("批发业务管理")} style={{ cursor: "pointer" }}>
          <span>批发业务进行中</span>
          <strong>{wholesaleList.filter((x) => x.stage !== "已完成").length}</strong>
          <small>点击进入批发全流程看板 →</small>
        </article>
        <article className="kpi" onClick={() => go("零售定制管理")} style={{ cursor: "pointer" }}>
          <span>零售定制进行中</span>
          <strong>{retailList.filter((x) => x.stage !== "已安装完工结清").length}</strong>
          <small>点击进入零售测量与安装看板 →</small>
        </article>
        <article className="kpi" onClick={() => go("公司日常记账")} style={{ cursor: "pointer" }}>
          <span>已记账笔数</span>
          <strong>{ledgerList.length}</strong>
          <small>含订单收支与公司日常记账 →</small>
        </article>
        <article className="kpi" onClick={() => go("待办与提醒")} style={{ cursor: "pointer" }}>
          <span>智能提醒中心</span>
          <strong>查看今日待办</strong>
          <small>测量 / 到货通知 / 安装 / 收款 →</small>
        </article>
      </section>

      <section className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-head">
          <div>
            <span className="eyebrow">把工作交给智能体</span>
            <h2>一句话指令 / 粘贴客户微信消息</h2>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button
              className="secondary"
              onClick={() =>
                setInput(
                  "客户：Ignacio\nGunther, use this invoice of ours to make an order. We will pay for it as soon as I get my customer's deposit.\n1. Blackout 1% Charcoal 48 x 72 qty 3 motorized\n2. J1200 Beige 60 x 84 qty 3 motorized\n报价：$1680\n标注：含 1个 Smart Hub 智能网关 + 3个手持遥控器 (Handheld Remotes)，收到客户定金后立即下单工厂"
                )
              }
            >
              ★ Gemini 同步：Ignacio 窗帘订单详情处理
            </button>
            <button
              className="secondary"
              onClick={() =>
                setInput(
                  "客户：金总装饰 电话：626-555-0188\n1. JL3601 White LF WH 39 5/8 x 40 5/8 qty 2 motorized\n2. ML-1801 48 x 72 qty 1 cordless\n报价：$680\n标注：全部内装减1/4寸，1号窗右拉带遥控"
                )
              }
            >
              示例1：批发客户发型号尺寸
            </button>
            <button
              className="secondary"
              onClick={() =>
                setInput("零售：陈女士预约明天下午2点上门测量，电话 626-888-1234，地址 850 S Baldwin Ave Arcadia，客厅做双层布艺窗帘+主卧罗马帘")
              }
            >
              示例2：零售客户约测量
            </button>
            <button
              className="secondary"
              onClick={() => setInput("记账：今天货车加油花了 $78.50 信用卡")}
            >
              示例3：公司日常开销记账
            </button>
            <button
              className="secondary"
              onClick={() => setInput("记账：付给国内工厂这批罗马帘货款 ¥8600 微信转账")}
            >
              示例4：付工厂人民币货款
            </button>
          </div>
        </div>

        <textarea
          rows={5}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setPreview(null);
          }}
          placeholder="直接粘贴客户发来的型号和尺寸，或输入：&#10;• 零售：张姐约周四上午10点测量，地址xxx，电话xxx&#10;• 记账：今天交仓库房租 $2200 / 货车加油 $75 / 收到王先生定金 $600&#10;• 提醒：明天通知刘总来仓库取货"
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 10,
            border: "1px solid #cbd5cf",
            fontSize: 13,
            lineHeight: 1.6,
          }}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button className="primary" onClick={handleAnalyze}>
            ✦ 让智能体识别并生成待办/单据
          </button>
          {input && (
            <button
              className="secondary"
              onClick={() => {
                setInput("");
                setPreview(null);
              }}
            >
              清空内容
            </button>
          )}
        </div>

        {preview && (
          <div
            style={{
              marginTop: 16,
              padding: 16,
              borderRadius: 12,
              background: "#f2f7f4",
              border: "1px solid #bdd5c8",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <span className="status green">智能体已识别</span>
                <strong style={{ marginLeft: 10, fontSize: 15 }}>{preview.summary}</strong>
              </div>
              <button className="primary" onClick={confirmAction}>
                ✓ 确认无误，立即写入系统
              </button>
            </div>

            {preview.kind === "wholesale" && (
              <div style={{ marginTop: 12, fontSize: 12, lineHeight: 1.8 }}>
                <div><b>客户名称：</b>{preview.customer}　<b>联系电话：</b>{preview.phone || "未提供"}</div>
                <div><b>解析窗位与尺寸：</b>{preview.parsedSummary}</div>
                <div><b>报价金额：</b>{preview.quoteUsd ? fmtMoney(preview.quoteUsd, "USD") : "待报价"}　<b>交付方式：</b>{preview.deliveryMode}</div>
                <div><b>工艺细节标注：</b>{preview.detailNotes}</div>
              </div>
            )}

            {preview.kind === "retail" && (
              <div style={{ marginTop: 12, fontSize: 12, lineHeight: 1.8 }}>
                <div><b>客户姓名：</b>{preview.customer}　<b>联系电话：</b>{preview.phone || "待补充"}</div>
                <div><b>预约测量时间：</b>{preview.measureTime}　<b>上门地址：</b>{preview.address || "待补充"}</div>
                <div><b>客户需求说明：</b>{preview.selectedProducts}</div>
              </div>
            )}

            {preview.kind === "ledger" && (
              <div style={{ marginTop: 12, fontSize: 12, lineHeight: 1.8 }}>
                <div>
                  <b>收支方向：</b>{preview.direction}　<b>账目分类：</b>{preview.category}　<b>币种金额：</b>
                  {fmtMoney(preview.amount, preview.currency)}　<b>方式：</b>{preview.method}
                </div>
                <div><b>原始备注：</b>{preview.note}</div>
              </div>
            )}

            {preview.kind === "reminder" && (
              <div style={{ marginTop: 12, fontSize: 12, lineHeight: 1.8 }}>
                <div><b>提醒分类：</b>{preview.category}　<b>时间：</b>{preview.dueTime}</div>
                <div><b>事项标题：</b>{preview.title}</div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 根据您 Gemini 历史对话定制的 4 大高频专项工具 */}
      <section className="panel">
        <div className="panel-head">
          <div>
            <span className="eyebrow">源自您的 Gemini 高频沟通场景（李度恒 / Ignacio / 挑高窗 / 美金发票 / 测量感谢翻译）</span>
            <h2>窗帘业务专项智能工具箱</h2>
          </div>
        </div>

        <div className="task-filters" style={{ marginBottom: 16 }}>
          <button
            className={activeTool === "highWindow" ? "active" : ""}
            onClick={() => setActiveTool("highWindow")}
          >
            📐 挑高窗户尺寸核算与确认
          </button>
          <button
            className={activeTool === "perInchQuote" ? "active" : ""}
            onClick={() => setActiveTool("perInchQuote")}
          >
            🧮 窗帘报价明细表 ($2.20 / $2.50 每英寸)
          </button>
          <button
            className={activeTool === "translator" ? "active" : ""}
            onClick={() => setActiveTool("translator")}
          >
            🌐 感谢上门测量 & 衬里差价中英翻译
          </button>
          <button
            className={activeTool === "usdInvoice" ? "active" : ""}
            onClick={() => setActiveTool("usdInvoice")}
          >
            💵 制作美金商业发票 (USD Invoice)
          </button>
          <button
            className={activeTool === "specTable" ? "active" : ""}
            onClick={() => setActiveTool("specTable")}
          >
            📋 李度恒 / 尔湾106号 / 20008测量表核对
          </button>
        </div>

        {activeTool === "perInchQuote" && (
          <div style={{ background: "#f8faf9", padding: 16, borderRadius: 12, border: "1px solid #d5ddd8" }}>
            <h3 style={{ marginTop: 0 }}>按宽度 $/英寸 批量报价明细表（同步自您的 Gemini《窗帘报价明细表》 & 《窗帘面料衬里价格调整咨询》）</h3>
            <p style={{ fontSize: 12, color: "#5b655f", lineHeight: 1.7 }}>
              对应您在 Gemini《窗帘报价明细表》中的计价规则：「<strong>按照表格中各窗位的宽度（Width）计算，前 15 樘单价为 $2.20/英寸，最后 1 樘单价为 $2.50/英寸</strong>」，并同步支持对比<strong>全遮光衬里 (Blackout Liner) / 透光衬里 (Light Filtering Liner) / 无衬里 (No Liner)</strong> 的总价梯度。
            </p>
            <div className="form-grid" style={{ marginTop: 12 }}>
              <label>
                常规窗位单价 ($ / 英寸宽)
                <input
                  type="number"
                  step="0.05"
                  value={defaultRatePerIn}
                  onChange={(e) => setDefaultRatePerIn(e.target.value)}
                />
              </label>
              <label>
                特殊/最后窗位单价 ($ / 英寸宽)
                <input
                  type="number"
                  step="0.05"
                  value={lastRatePerIn}
                  onChange={(e) => setLastRatePerIn(e.target.value)}
                />
              </label>
              <label className="full">
                窗位明细（每行格式：LN# | 数量 | 房间(Room) | 宽度(Width in) | 高度(Length in) | 款式(Style) | 单价($/in)）
                <textarea
                  rows={7}
                  value={perInchLinesText}
                  onChange={(e) => setPerInchLinesText(e.target.value)}
                  style={{ fontFamily: "monospace", fontSize: 12 }}
                />
              </label>
            </div>

            <div className="table-wrap" style={{ marginTop: 12, background: "#fff", borderRadius: 10, border: "1px solid #cbd5cf" }}>
              <table>
                <thead>
                  <tr>
                    <th>LN #</th>
                    <th>数量</th>
                    <th>房间 (Room)</th>
                    <th>宽度 (in)</th>
                    <th>高度 (in)</th>
                    <th>款式 (Style)</th>
                    <th>单价 ($/英寸)</th>
                    <th>金额 (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedPerInchRows.map((r, i) => (
                    <tr key={i}>
                      <td><b>{r.ln}</b></td>
                      <td>{r.qty}</td>
                      <td><b>{r.room}</b></td>
                      <td>{r.widthIn}&quot;</td>
                      <td>{r.lengthIn}&quot;</td>
                      <td><code>{r.style}</code></td>
                      <td>{fmtMoney(r.rate, "USD")}/in</td>
                      <td><strong style={{ color: "#173f35" }}>{fmtMoney(r.lineTotal, "USD")}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 12, padding: 14, background: "#fff", borderRadius: 10, border: "1px solid #cbd5cf", fontSize: 13, lineHeight: 1.9 }}>
              <div>
                <b>📊 当前方案合计（共 {parsedPerInchRows.length} 樘）：</b>
                <strong style={{ fontSize: 16, color: "#173f35", marginLeft: 6 }}>{fmtMoney(perInchGrandTotal, "USD")}</strong>
              </div>
              <div style={{ fontSize: 12, color: "#5b655f" }}>
                <b>💡 衬里降价对比参考（对应《窗帘面料衬里价格调整咨询》）：</b>
                全遮光衬里 (Blackout Liner)：<b>{fmtMoney(perInchGrandTotal, "USD")}</b> ｜ 改透光衬里 (Light Filtering Liner, 约省 10%)：<b>{fmtMoney(perInchGrandTotal * 0.9, "USD")}</b> ｜ 不做衬里 (No Liner, 约省 18%)：<b>{fmtMoney(perInchGrandTotal * 0.82, "USD")}</b>
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  className="primary"
                  onClick={async () => {
                    const text = [
                      "LN #\t数量\t房间 (Room)\t宽度 (in)\t高度 (in)\t款式 (Style)\t单价 ($/in)\t金额 (USD)",
                      ...parsedPerInchRows.map(
                        (r) => `${r.ln}\t${r.qty}\t${r.room}\t${r.widthIn}\t${r.lengthIn}\t${r.style}\t$${r.rate.toFixed(2)}/in\t$${r.lineTotal.toFixed(2)}`
                      ),
                      `\n总计 (Total USD): ${fmtMoney(perInchGrandTotal, "USD")}`,
                    ].join("\n");
                    await navigator.clipboard.writeText(text);
                    notify("窗帘按英寸报价明细表已复制！");
                  }}
                >
                  📋 复制窗帘报价明细表
                </button>
                <button
                  className="secondary"
                  onClick={() => {
                    setTransScene("linerPriceConsult");
                    setActiveTool("translator");
                  }}
                >
                  🌐 生成「透光衬里 vs 全遮光衬里 vs 无衬里」英文回复 →
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTool === "highWindow" && (
          <div style={{ background: "#f8faf9", padding: 16, borderRadius: 12, border: "1px solid #d5ddd8" }}>
            <h3 style={{ marginTop: 0 }}>挑高/拱形窗尺寸核算、两侧外扩与效果图指令生成器</h3>
            <p style={{ fontSize: 12, color: "#5b655f" }}>
              同步自您的 Gemini《窗帘效果图制作》与《挑高窗户尺寸核算与确认》：支持设置<strong>宽度比窗两侧各增加 N 英寸（默认各 +10&quot;）</strong>、<strong>高度增加 N 英寸（默认 +10&quot;）</strong>、<strong>320cm (126&quot;) 门幅布料标牌</strong>与<strong>黑色罗马杆 / 轨道</strong>，自动核算成品尺寸、用料码数与效果图制作指令。
            </p>
            <div className="form-grid" style={{ marginTop: 12 }}>
              <label>
                房间与窗位名称
                <input
                  value={hwCalc.room}
                  onChange={(e) => setHwCalc({ ...hwCalc, room: e.target.value })}
                />
              </label>
              <label>
                窗户净宽 (英寸 in)
                <input
                  type="number"
                  step="0.125"
                  value={hwCalc.rawWidthIn}
                  onChange={(e) => setHwCalc({ ...hwCalc, rawWidthIn: e.target.value })}
                />
              </label>
              <label>
                窗户净高 (英寸 in)
                <input
                  type="number"
                  step="0.125"
                  value={hwCalc.rawHeightIn}
                  onChange={(e) => setHwCalc({ ...hwCalc, rawHeightIn: e.target.value })}
                />
              </label>
              <label>
                两侧各增加宽度 (英寸/每侧)
                <input
                  type="number"
                  step="0.5"
                  value={hwCalc.extendEachSideIn}
                  onChange={(e) => setHwCalc({ ...hwCalc, extendEachSideIn: e.target.value })}
                  placeholder="例如：两侧各加 10 英寸"
                />
              </label>
              <label>
                高度增加 (英寸)
                <input
                  type="number"
                  step="0.5"
                  value={hwCalc.extendTopIn}
                  onChange={(e) => setHwCalc({ ...hwCalc, extendTopIn: e.target.value })}
                  placeholder="例如：高度增加 10 英寸"
                />
              </label>
              <label>
                窗帘杆 / 轨道颜色款式
                <select
                  value={hwCalc.rodOrTrack}
                  onChange={(e) => setHwCalc({ ...hwCalc, rodOrTrack: e.target.value })}
                >
                  <option value="黑色罗马杆 (Black Rod)">黑色罗马杆 (Black Rod)</option>
                  <option value="金色/黄铜罗马杆 (Brass Rod)">金色/黄铜罗马杆 (Brass Rod)</option>
                  <option value="静音白色滑轨 (White Track)">静音白色滑轨 (White Track)</option>
                  <option value="重型电动开合轨 (Motorized Track)">重型电动开合轨 (Motorized Track)</option>
                </select>
              </label>
              <label>
                褶皱倍数 (Fullness)
                <select
                  value={hwCalc.fullness}
                  onChange={(e) => setHwCalc({ ...hwCalc, fullness: e.target.value })}
                >
                  <option value="2.0">2.0 倍褶</option>
                  <option value="2.2">2.2 倍褶（蛇形帘/韩褶推荐）</option>
                  <option value="2.5">2.5 倍褶（高定饱满）</option>
                  <option value="1.8">1.8 倍褶（经济型）</option>
                </select>
              </label>
              <label>
                面料门幅宽度 (英寸 / cm)
                <select
                  value={hwCalc.fabricWidthIn}
                  onChange={(e) => setHwCalc({ ...hwCalc, fabricWidthIn: e.target.value })}
                >
                  <option value="126">126&quot; (320cm 超宽幅布料标牌)</option>
                  <option value="110">110&quot; (280cm 宽幅定高转定宽)</option>
                  <option value="54">54&quot; (137cm 小幅定宽)</option>
                </select>
              </label>
              <label>
                离地扣减 (英寸 in)
                <input
                  type="number"
                  step="0.25"
                  value={hwCalc.floorDeductionIn}
                  onChange={(e) => setHwCalc({ ...hwCalc, floorDeductionIn: e.target.value })}
                />
              </label>
              <label>
                杆环 / 轨道滑轮扣减 (英寸 in)
                <input
                  type="number"
                  step="0.25"
                  value={hwCalc.trackDeductionIn}
                  onChange={(e) => setHwCalc({ ...hwCalc, trackDeductionIn: e.target.value })}
                />
              </label>
              <label>
                布料型号 / 标牌说明
                <input
                  value={hwCalc.fabricCode}
                  onChange={(e) => setHwCalc({ ...hwCalc, fabricCode: e.target.value })}
                />
              </label>
              <label>
                制作款式
                <input
                  value={hwCalc.headerStyle}
                  onChange={(e) => setHwCalc({ ...hwCalc, headerStyle: e.target.value })}
                />
              </label>
            </div>

            <div style={{ marginTop: 14, padding: 14, background: "#fff", borderRadius: 10, border: "1px solid #cbd5cf", fontSize: 13, lineHeight: 1.8 }}>
              <div><b>{highWindowResult.heightWarning}</b></div>
              <div>
                <b>外扩后成品尺寸：</b>{hwCalc.room} · 窗净宽 {highWindowResult.rawW}&quot; + 两侧各加 {highWindowResult.extSide}&quot; = <b>成品总宽 {highWindowResult.finishedW}&quot;</b>（配 {hwCalc.rodOrTrack}） × 窗净高 {highWindowResult.rawH}&quot; + 高度增加 {highWindowResult.extTop}&quot; - 扣减 = <b>成品净高 {highWindowResult.finishedH}&quot;</b>
              </div>
              <div>
                <b>工厂用料核算：</b>面料 {hwCalc.fabricCode} · 需拼幅 <b>{highWindowResult.panelsCount} 幅</b>（双开每侧 {highWindowResult.panelsCount / 2} 幅） · 预计单窗总用料约{" "}
                <b>{highWindowResult.totalYards} 码 (Yards)</b>（两扇窗合计约 <b>{Math.round(highWindowResult.totalYards * 2 * 10) / 10} 码</b>）
              </div>
              <div style={{ marginTop: 6, padding: "8px 10px", background: "#f2f7f4", borderRadius: 8, fontSize: 12 }}>
                <b>🎨 自动生成效果图指令：</b>{highWindowResult.renderPromptZh}
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  className="primary"
                  onClick={async () => {
                    const summary = `【挑高窗/外扩尺寸核算与工厂下单表】\n位置：${hwCalc.room}\n窗户净尺寸：宽 ${hwCalc.rawWidthIn}" × 高 ${hwCalc.rawHeightIn}"\n外扩规则：宽度比窗两侧各增加 ${hwCalc.extendEachSideIn}"（总加 ${Number(hwCalc.extendEachSideIn) * 2}"），高度增加 ${hwCalc.extendTopIn}"\n离地与杆轨扣减：离地扣 ${hwCalc.floorDeductionIn}"，杆轨扣 ${hwCalc.trackDeductionIn}"\n最终成品加工尺寸：宽 ${highWindowResult.finishedW}" × 高 ${highWindowResult.finishedH}"\n配套杆轨：${hwCalc.rodOrTrack}（杆长建议 ${highWindowResult.finishedW}"）\n布料型号：${hwCalc.fabricCode}\n款式与倍褶：${hwCalc.headerStyle}（${hwCalc.fullness}倍）\n门幅与拼幅：${hwCalc.fabricWidthIn}"门幅，单窗 ${highWindowResult.panelsCount} 幅（约 ${highWindowResult.totalYards} 码）\n备注：${highWindowResult.heightWarning}`;
                    await navigator.clipboard.writeText(summary);
                    notify("尺寸核算与工厂下单确认表已复制！");
                  }}
                >
                  📋 复制尺寸核算与工厂下单表
                </button>
                <button
                  className="secondary"
                  onClick={async () => {
                    await navigator.clipboard.writeText(highWindowResult.renderPromptZh);
                    notify("效果图制作提示词已复制！");
                  }}
                >
                  🎨 复制窗帘效果图制作指令
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTool === "translator" && (
          <div style={{ background: "#f8faf9", padding: 16, borderRadius: 12, border: "1px solid #d5ddd8" }}>
            <h3 style={{ marginTop: 0 }}>客户中英双语沟通生成器（含「感谢上门测量尺寸」地道英文话术）</h3>
            <div className="form-grid" style={{ marginTop: 12 }}>
              <label>
                客户称呼（如 Ignacio / 李度恒）
                <input
                  value={transClient}
                  onChange={(e) => setTransClient(e.target.value)}
                  placeholder="Ignacio"
                />
              </label>
              <label>
                选择沟通场景
                <select
                  value={transScene}
                  onChange={(e) => setTransScene(e.target.value as typeof transScene)}
                >
                  <option value="measureThanks">1. 感谢上门测量尺寸（测量后发给客户）</option>
                  <option value="sizeConfirm">2. 挑高窗/窗帘尺寸与款式明细确认</option>
                  <option value="linerPriceConsult">3. 窗帘衬里价格调整咨询（全遮光 vs 透光衬里 vs 无衬里）</option>
                  <option value="quoteFollow">4. 发送美金报价单与收定金通知</option>
                  <option value="installNotice">5. 工厂到货通知（预约安装 / 通知取货）</option>
                </select>
              </label>
              <label className="full">
                额外补充说明（选填）
                <input
                  value={transCustomZh}
                  onChange={(e) => setTransCustomZh(e.target.value)}
                  placeholder="例如：客厅电动轨电源留在右侧，预计下周二前出效果图"
                />
              </label>
            </div>

            <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
              <div style={{ background: "#fff", padding: 14, borderRadius: 10, border: "1px solid #cbd5cf" }}>
                <b style={{ fontSize: 12, color: "#2e705d" }}>🇨🇳 中文版话术（发给华人客户如李度恒）</b>
                <p style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", margin: "8px 0 12px" }}>
                  {bilingualTemplates[transScene].zh}
                </p>
                <button
                  className="secondary"
                  onClick={async () => {
                    await navigator.clipboard.writeText(bilingualTemplates[transScene].zh);
                    notify("中文话术已复制");
                  }}
                >
                  复制中文话术
                </button>
              </div>
              <div style={{ background: "#fff", padding: 14, borderRadius: 10, border: "1px solid #cbd5cf" }}>
                <b style={{ fontSize: 12, color: "#173f35" }}>🇺🇸 英文版话术（发给英文客户如 Ignacio）</b>
                <p style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", margin: "8px 0 12px" }}>
                  {bilingualTemplates[transScene].en}
                </p>
                <button
                  className="primary"
                  onClick={async () => {
                    await navigator.clipboard.writeText(bilingualTemplates[transScene].en);
                    notify("地道英文话术已复制，可直接发送给客户！");
                  }}
                >
                  复制英文话术 (Copy English)
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTool === "usdInvoice" && (
          <div style={{ background: "#f8faf9", padding: 16, borderRadius: 12, border: "1px solid #d5ddd8" }}>
            <h3 style={{ marginTop: 0 }}>制作美金商业发票 (USD Commercial Invoice)</h3>
            <div className="form-grid" style={{ marginTop: 12 }}>
              <label>
                发票编号 (Invoice #)
                <input
                  value={invForm.invoiceNo}
                  onChange={(e) => setInvForm({ ...invForm, invoiceNo: e.target.value })}
                />
              </label>
              <label>
                客户姓名 / 公司 (Bill To)
                <input
                  value={invForm.clientName}
                  onChange={(e) => setInvForm({ ...invForm, clientName: e.target.value })}
                />
              </label>
              <label>
                客户地址 / 电话
                <input
                  value={invForm.clientAddress}
                  onChange={(e) => setInvForm({ ...invForm, clientAddress: e.target.value })}
                />
              </label>
              <label>
                运费 (Shipping USD $)
                <input
                  type="number"
                  step="0.01"
                  value={invForm.shippingUsd}
                  onChange={(e) => setInvForm({ ...invForm, shippingUsd: e.target.value })}
                />
              </label>
              <label>
                已收定金 (Deposit Paid USD $)
                <input
                  type="number"
                  step="0.01"
                  value={invForm.depositPaidUsd}
                  onChange={(e) => setInvForm({ ...invForm, depositPaidUsd: e.target.value })}
                />
              </label>
              <label className="full">
                发票明细行（每行一条，格式：项目描述 | 尺寸 | 数量 | $金额）
                <textarea
                  rows={4}
                  value={invForm.itemsText}
                  onChange={(e) => setInvForm({ ...invForm, itemsText: e.target.value })}
                />
              </label>
            </div>

            <div style={{ marginTop: 14, background: "#fff", padding: 18, borderRadius: 10, border: "1px solid #cbd5cf" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #173f35", paddingBottom: 10, marginBottom: 12 }}>
                <div>
                  <strong style={{ fontSize: 18 }}>BRAUN INTERNATIONAL, LLC</strong>
                  <div style={{ fontSize: 11, color: "#65746d" }}>2115 S. Hellman Avenue, Unit E, Ontario, CA 91761 · Tel: 626-658-5002</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong style={{ fontSize: 16, color: "#173f35" }}>COMMERCIAL INVOICE (USD)</strong>
                  <div style={{ fontSize: 12 }}>Invoice #: <b>{invForm.invoiceNo}</b></div>
                  <div style={{ fontSize: 11, color: "#65746d" }}>Date: {new Date().toISOString().slice(0, 10)}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, marginBottom: 10 }}>
                <b>Bill To:</b> {invForm.clientName} ({invForm.clientAddress})
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 0, fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#f2f7f4" }}>
                    <th style={{ padding: 8 }}>#</th>
                    <th style={{ padding: 8 }}>Description / 窗帘与款式明细</th>
                    <th style={{ padding: 8 }}>Size / 尺寸</th>
                    <th style={{ padding: 8 }}>Qty / 数量</th>
                    <th style={{ padding: 8, textAlign: "right" }}>Amount (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedInvoiceLines.map((r) => (
                    <tr key={r.index} style={{ borderBottom: "1px solid #edf1ee" }}>
                      <td style={{ padding: 8 }}>{r.index}</td>
                      <td style={{ padding: 8 }}><b>{r.desc}</b></td>
                      <td style={{ padding: 8 }}>{r.size}</td>
                      <td style={{ padding: 8 }}>{r.qty}</td>
                      <td style={{ padding: 8, textAlign: "right" }}>{fmtMoney(r.amount, "USD")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 12, textAlign: "right", fontSize: 13, lineHeight: 1.8 }}>
                <div>Subtotal (小计): <b>{fmtMoney(invSubtotal, "USD")}</b></div>
                <div>Shipping / Installation (运费/安装): <b>{fmtMoney(invShipping, "USD")}</b></div>
                <div style={{ fontSize: 15, color: "#173f35" }}>Total USD (美金总计): <b>{fmtMoney(invTotal, "USD")}</b></div>
                <div>Deposit Paid (已付定金): <b>-{fmtMoney(invDeposit, "USD")}</b></div>
                <div style={{ fontSize: 15, color: "#b45439" }}>Balance Due (待付尾款): <b>{fmtMoney(invBalance, "USD")}</b></div>
              </div>
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <button
                  className="primary"
                  onClick={async () => {
                    const text = `COMMERCIAL INVOICE (USD)\nBRAUN INTERNATIONAL, LLC\n2115 S. Hellman Ave, Unit E, Ontario, CA 91761\nInvoice #: ${invForm.invoiceNo}\nBill To: ${invForm.clientName} (${invForm.clientAddress})\n\n${parsedInvoiceLines.map((r) => `${r.index}. ${r.desc} | ${r.size} | ${r.qty} | ${fmtMoney(r.amount, "USD")}`).join("\n")}\n\nSubtotal: ${fmtMoney(invSubtotal, "USD")}\nShipping/Install: ${fmtMoney(invShipping, "USD")}\nTotal USD: ${fmtMoney(invTotal, "USD")}\nDeposit Paid: ${fmtMoney(invDeposit, "USD")}\nBalance Due: ${fmtMoney(invBalance, "USD")}`;
                    await navigator.clipboard.writeText(text);
                    notify("美金商业发票已复制！");
                  }}
                >
                  📋 复制美金商业发票文本
                </button>
                <button className="secondary" onClick={() => window.print()}>
                  🖨 打印 / 导出发票 PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTool === "specTable" && (
          <div style={{ background: "#f8faf9", padding: 16, borderRadius: 12, border: "1px solid #d5ddd8" }}>
            <h3 style={{ marginTop: 0 }}>
              1. 李度恒02 (20008全屋42窗) 实单预算、设计PDF比对与工厂三厂分单系统
            </h3>
            <p style={{ fontSize: 12, color: "#5b655f", lineHeight: 1.7 }}>
              已 100% 接入您本地磁盘的 3 份核心文件（<b>《李度恒02加工.xlsx》</b> + <b>《李度恒20008预算.xlsx》</b> + <b>《李度恒20008 窗帘.pdf》53页设计方案</b>）：
              <br />• <b>预算计价公式（《李度恒20008预算.xlsx》）</b>：布+纱按 <b>$8/英寸宽</b>；罗马帘按 <b>$11/sqft（10 sqft起算）</b>；卷帘按 <b>$7/sqft</b>；另加测量费 <b>$200</b> + 安装费 <b>$1,200</b>。
              <br />• <b>总价对比</b>：复尺后 42 樘手动税前 <b>$14,145.29</b>（含 8.75% 税后 <b>$15,383.00</b>）；若加电动包 <b>+$3,476</b>（电机 54×$60 + 遥控器 17×$8 + Hub $100），电动税前 <b>$17,621.29</b>（税后 <b>$19,163.15</b>）。对比设计师初稿 40 樘：手动税前 $12,380.44（税后 $13,463.73）。
              <br />• <b>加工高度自动扣减与三厂分单（《李度恒02加工.xlsx》）</b>：16樘布帘与 16樘纱帘自动执行 <code>加工高度 = 原始高度 - 2&quot;</code>（需要双层杆）；自动按型号分配给 <b>【臻品】</b>（纱SSY06）、<b>【鑫亚纶】</b>（公共区域 UK001-2）、<b>【泰纶】</b>（书房 3003-3 / 主卧 3008-1 / 其他卧室 3002-2）。
            </p>

            {/* 4项待核实重点警示框 */}
            <div style={{ background: "#fff9f0", border: "1px solid #f0d090", borderRadius: 10, padding: 12, marginTop: 10, marginBottom: 12, fontSize: 12, lineHeight: 1.7 }}>
              <b style={{ color: "#9a5b13" }}>⚠️ 《李度恒20008》复尺表与加工表 4 项重点核实提醒（自动提取自您的 Excel 原表批注）：</b>
              <div>1. <b>厨房 K1 (66×46)、K2 (35×46.25)</b>：原表P11-P12批注「<b>按照李先生的尺寸未测量</b>」（与设计PDF P.16/P.18标注的 41×49、46×50 差异较大）。</div>
              <div>2. <b>家庭厅 FR1sd、FR2sd、FR3、FR4</b>：原表P15-P18批注「<b>电影院是否需要遮光</b>」（PDF P.19/P.21为投影幕布家庭影院，当前配的是透光卷帘 JL3601 与透光布 UK001-2）。</div>
              <div>3. <b>书房 书房1、书房2、书房3、书房4</b>：原表P21-P24批注「<b>是否遮光</b>」（当前配 3003-3 透光罗马/透光布 与 JL3601 透光卷帘）。</div>
              <div>4. <b>口内/口外标注冲突</b>：<b>#33 2卧2-2sd (30×69)</b> 与 <b>#35 2卧3-1sd (30×70)</b>（遮光卷帘 JL2801）在《预算表》Q35/Q37 标为「<b>口外</b>」，在《02加工表》X14/X16 标为「<b>口内</b>」，下厂前请统一！</div>
            </div>

            {/* 切换不同项目或李度恒02的四大加工分单 */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10, marginBottom: 10 }}>
              <button
                className={factorySplitTab === "all42" ? "primary" : "secondary"}
                onClick={() => {
                  setFactorySplitTab("all42");
                  setRawExcelProject("李度恒02-20008全屋42窗预算与加工核对总表");
                  setRawExcelRowsText(LIDUHENG_20008_42_ROWS.join("\n"));
                }}
              >
                📋 全屋 42 窗预算 & PDF核对总表 ($15,383 税后)
              </button>
              <button
                className={factorySplitTab === "sheer16" ? "primary" : "secondary"}
                onClick={() => {
                  setFactorySplitTab("sheer16");
                  setRawExcelProject("李度恒02加工-16樘纱帘分单(臻品-SSY06-高减2寸)");
                  setRawExcelRowsText(
                    [
                      "客厅1 | 纱#01 | 79 | 86 (原高88-2) | 对开 | 纱SSY06 | 供应商：臻品 (需要双层杆) | 原始高度 88\"",
                      "客厅2 | 纱#02 | 78 | 86 (原高88-2) | 对开 | 纱SSY06 | 供应商：臻品 (需要双层杆) | 原始高度 88\"",
                      "客厅3 | 纱#03 | 37 | 86 (原高88-2) | 对开 | 纱SSY06 | 供应商：臻品 (需要双层杆) | 原始高度 88\"",
                      "客厅4 | 纱#04 | 52 | 86 (原高88-2) | 单开 | 纱SSY06 | 供应商：臻品 (需要双层杆) | 原始高度 88\"",
                      "客厅5 | 纱#05 | 52 | 86 (原高88-2) | 单开 | 纱SSY06 | 供应商：臻品 (需要双层杆) | 原始高度 88\"",
                      "客厅6 | 纱#06 | 36 | 86 (原高88-2) | 对开 | 纱SSY06 | 供应商：臻品 (需要双层杆) | 原始高度 88\"",
                      "客厅7 | 纱#07 | 76 | 86 (原高88-2) | 对开 | 纱SSY06 | 供应商：臻品 (需要双层杆) | 原始高度 88\"",
                      "餐厅 | 纱#08 | 164 | 90 (原高92-2) | 对开 | 纱SSY06 | 供应商：臻品 (需要双层杆) | 原始高度 92\"",
                      "小楼梯边 | 纱#09 | 88 | 86.5 (原高88.5-2) | 对开 | 纱SSY06 | 供应商：臻品 (需要双层杆) | 原始高度 88.5\"",
                      "FR3 | 纱#10 | 87.5 | 98.5 (原高100.5-2) | 对开 | 纱SSY06 | 供应商：臻品 (需要双层杆) | 原始高度 100.5\"",
                      "1卧 | 纱#11 | 104 | 99 (原高101-2) | 对开 | 纱SSY06 | 供应商：臻品 (需要双层杆) | 原始高度 101\"",
                      "书房2 | 纱#12 | 66 | 99 (原高101-2) | 对开 | 纱SSY06 | 供应商：臻品 (需要双层杆) | 原始高度 101\"",
                      "书房4 | 纱#13 | 79 | 99 (原高101-2) | 对开 | 纱SSY06 | 供应商：臻品 (需要双层杆) | 原始高度 101\"",
                      "2主卧1 | 纱#14 | 98 | 98 (原高100-2) | 对开 | 纱SSY06 | 供应商：臻品 (需要双层杆) | 原始高度 100\"",
                      "2卧1-1 | 纱#15 | 63 | 98 (原高100-2) | 对开 | 纱SSY06 | 供应商：臻品 (需要双层杆) | 原始高度 100\"",
                      "2卧1-2 | 纱#16 | 59 | 98 (原高100-2) | 对开 | 纱SSY06 | 供应商：臻品 (需要双层杆) | 原始高度 100\" (总宽1218.5\"=3094.99cm)",
                    ].join("\n")
                  );
                }}
              >
                ① 纱帘加工单 16樘（臻品 SSY06 · 高-2&quot;）
              </button>
              <button
                className={factorySplitTab === "drapery16" ? "primary" : "secondary"}
                onClick={() => {
                  setFactorySplitTab("drapery16");
                  setRawExcelProject("李度恒02加工-16樘布帘分单(鑫亚纶UK001-2与泰纶3002-2)");
                  setRawExcelRowsText(
                    [
                      "客厅1 | 布#01 | 79 | 86 (原高88-2) | 对开 | 透光布 UK001-2 | 供应商：鑫亚纶 (公共区域) | 原始高度 88\"",
                      "客厅2 | 布#02 | 78 | 86 (原高88-2) | 对开 | 透光布 UK001-2 | 供应商：鑫亚纶 (公共区域) | 原始高度 88\"",
                      "客厅3 | 布#03 | 37 | 86 (原高88-2) | 对开 | 透光布 UK001-2 | 供应商：鑫亚纶 (公共区域) | 原始高度 88\"",
                      "客厅4 | 布#04 | 52 | 86 (原高88-2) | 单开 | 透光布 UK001-2 | 供应商：鑫亚纶 (公共区域) | 原始高度 88\"",
                      "客厅5 | 布#05 | 52 | 86 (原高88-2) | 单开 | 透光布 UK001-2 | 供应商：鑫亚纶 (公共区域) | 原始高度 88\"",
                      "客厅6 | 布#06 | 36 | 86 (原高88-2) | 对开 | 透光布 UK001-2 | 供应商：鑫亚纶 (公共区域) | 原始高度 88\"",
                      "客厅7 | 布#07 | 76 | 86 (原高88-2) | 对开 | 透光布 UK001-2 | 供应商：鑫亚纶 (公共区域) | 原始高度 88\"",
                      "餐厅 | 布#08 | 164 | 90 (原高92-2) | 对开 | 透光布 UK001-2 | 供应商：鑫亚纶 (公共区域) | 原始高度 92\"",
                      "小楼梯边 | 布#09 | 88 | 86.5 (原高88.5-2) | 对开 | 透光布 UK001-2 | 供应商：鑫亚纶 (公共区域) | 原始高度 88.5\"",
                      "FR3 | 布#10 | 87.5 | 98.5 (原高100.5-2) | 对开 | 透光布 UK001-2 | 供应商：鑫亚纶 (公共区域) | 原始高度 100.5\"",
                      "1卧 | 布#11 | 104 | 99 (原高101-2) | 对开 | 遮光布 3002-2 | 供应商：泰纶 (卧室区域) | 原始高度 101\"",
                      "书房2 | 布#12 | 66 | 99 (原高101-2) | 对开 | 透光布 UK001-2 (预算表标3003-3) | 供应商：鑫亚纶/泰纶 | 原始高度 101\"",
                      "书房4 | 布#13 | 79 | 99 (原高101-2) | 对开 | 透光布 UK001-2 (预算表标3003-3) | 供应商：鑫亚纶/泰纶 | 原始高度 101\"",
                      "2主卧1 | 布#14 | 98 | 98 (原高100-2) | 对开 | 遮光布 3002-2 (预算表标3008-1) | 供应商：泰纶 (主卧) | 原始高度 100\"",
                      "2卧1-1 | 布#15 | 63 | 98 (原高100-2) | 对开 | 遮光布 3002-2 | 供应商：泰纶 (其他卧室) | 原始高度 100\"",
                      "2卧1-2 | 布#16 | 59 | 98 (原高100-2) | 对开 | 遮光布 3002-2 | 供应商：泰纶 (其他卧室) | 原始高度 100\"",
                    ].join("\n")
                  );
                }}
              >
                ② 布帘加工单 16樘（鑫亚纶 UK001-2 / 泰纶 3002-2）
              </button>
              <button
                className={factorySplitTab === "roman9" ? "primary" : "secondary"}
                onClick={() => {
                  setFactorySplitTab("roman9");
                  setRawExcelProject("李度恒02加工-9樘罗马帘分单(全部口内)");
                  setRawExcelRowsText(
                    [
                      "FR4 | 罗马#01 | 17.875 | 59 | 口内 | 透光罗马 UK001-2 | 供应商：鑫亚纶 | 家庭厅屏幕右侧窄窗",
                      "书房1 | 罗马#02 | 22.875 | 59 | 口内 | 透光罗马 3003-3 | 供应商：泰纶 (书房) | 书房W1左窄窗",
                      "2主卧2 | 罗马#03 | 34.75 | 59 | 口内 | 遮光罗马 3008-1 | 供应商：泰纶 (主卧) | 主卧W1右窗",
                      "2主卧衣帽 | 罗马#04 | 47 | 34.75 | 口内 | 透光罗马 3008-1 | 供应商：泰纶 (主卧) | 主卧衣帽间窗W6",
                      "2卧2-1 | 罗马#05 | 59.125 | 59 | 口内 | 遮光罗马 3002-2 | 供应商：泰纶 (其他卧室) | 哥哥房W1主窗",
                      "2卧3-2 | 罗马#06 | 59 | 59.25 | 口内 | 遮光罗马 3002-2 | 供应商：泰纶 (其他卧室) | 姐姐房W1中间大窗",
                      "2卧3-3 | 罗马#07 | 47 | 35.25 | 口内 | 遮光罗马 3002-2 | 供应商：泰纶 (其他卧室) | 姐姐房W2小窗",
                      "2卧3-4 | 罗马#08 | 47 | 35 | 口内 | 遮光罗马 3002-2 | 供应商：泰纶 (其他卧室) | 姐姐房W3右窗",
                      "车库1 | 罗马#09 | 22.875 | 59 | 口内 | 透光罗马 UK001-2 | 供应商：鑫亚纶 | 车库入口窄窗 (总宽357.5\"=908.05cm)",
                    ].join("\n")
                  );
                }}
              >
                ③ 罗马帘加工单 9樘（全部口内 · 泰纶/鑫亚纶）
              </button>
              <button
                className={factorySplitTab === "roller17" ? "primary" : "secondary"}
                onClick={() => {
                  setFactorySplitTab("roller17");
                  setRawExcelProject("李度恒02加工-17樘卷帘分单(JL3601与JL2801)");
                  setRawExcelRowsText(
                    [
                      "K1 | 卷帘#01 | 66 | 46 | 口内 | 透光卷帘 JL3601 | 厨房冰箱左侧窗 | ⚠️ 按照李先生的尺寸未测量",
                      "K2 | 卷帘#02 | 35 | 46.25 | 口内 | 透光卷帘 JL3601 | 厨房水槽窗 | ⚠️ 按照李先生的尺寸未测量",
                      "1卫1 | 卷帘#03 | 35.5 | 41 | 口内 | 透光卷帘 JL3601 | 一楼卫生间1 | 瓷砖口内",
                      "FR1sd | 卷帘#04 | 26 | 85 | 口外 | 透光卷帘 JL3601 | 家庭厅双扇玻璃门左 | 口外安装",
                      "FR2sd | 卷帘#05 | 26 | 85 | 口外 | 透光卷帘 JL3601 | 家庭厅双扇玻璃门右 | 口外安装",
                      "1卫2 | 卷帘#06 | 27.625 | 22 | 口内 | 透光卷帘 JL3601 | 一楼客卫高窗 | 瓷砖口内",
                      "书房3 | 卷帘#07 | 30 | 85 | 口内 | 透光卷帘 JL3601 | 书房玻璃门 | 口内安装",
                      "2主卧卫1 | 卷帘#08 | 47 | 34.625 | 口内 | 透光卷帘 JL3601 | 主卫马桶间窗W5 | 瓷砖口内",
                      "2主卧卫2 | 卷帘#09 | 33.625 | 22.25 | 口内 | 透光卷帘 JL3601 | 主卫左高窗W2 | 瓷砖口内",
                      "2主卧卫3 | 卷帘#10 | 69.375 | 52.25 | 口内 | 透光卷帘 JL3601 | 主卫中窗W3(浴缸) | 瓷砖口内",
                      "2主卧卫4 | 卷帘#11 | 33.875 | 52.75 | 口内 | 透光卷帘 JL3601 | 主卫右窗W4 | 瓷砖口内",
                      "2卧2-2sd | 卷帘#12 | 30 | 69 | 口内(预算表口外) | 遮光卷帘 JL2801 | 哥哥房玻璃门D1 | ⚠️ 核实口内/口外",
                      "2卫 | 卷帘#13 | 46.25 | 33.5 | 口内 | 透光卷帘 JL3601 | 哥哥房浴室窗W2 | 瓷砖口内",
                      "2卧3-1sd | 卷帘#14 | 30 | 70 | 口内(预算表口外) | 遮光卷帘 JL2801 | 姐姐房玻璃门D1 | ⚠️ 核实口内/口外",
                      "2卧卫 | 卷帘#15 | 46.125 | 33.5 | 口内 | 透光卷帘 JL3601 | 姐姐房浴室窗W4 | 瓷砖口内",
                      "车库2 | 卷帘#16 | 47 | 34.75 | 口内 | 透光卷帘 JL3601 | 车库左窗W2 | 口内安装",
                      "车库3 | 卷帘#17 | 46.75 | 34.875 | 口内 | 透光卷帘 JL3601 | 车库右窗W3 | 口内安装",
                    ].join("\n")
                  );
                }}
              >
                ④ 卷帘加工单 17樘（JL3601 透光 / JL2801 遮光）
              </button>
              <button
                className="secondary"
                onClick={() => {
                  setRawExcelProject("尔湾106号窗帘测量下单表 (Irvine #106)");
                  setRawExcelRowsText(
                    [
                      "1F 客厅小窗 | IRV-01 | 46 1/2 | 58 3/4 | IB | 柔纱帘 / 斑马帘 | 无拉绳 Cordless | 照片1黄字实测标注",
                      "1F 客厅推拉门 | IRV-02 | 118 | 93.5 | OB | 双开布艺帘 + 白纱 | 黑色罗马杆/双轨 | 照片2黄字标注：高93.5",
                      "2F 主卧大窗 | IRV-03 | 78 | 84 | OB | 全遮光布艺窗帘 | 顶装静音轨 | 照片3主卧实拍测量",
                      "2F 主卫浴缸窗 | IRV-04 | 34 3/4 | 59 1/2 | IB | 防水遮光卷帘 | 无拉绳 Cordless | 照片4浴缸旁窗户",
                      "2F 二楼次卧 | IRV-05 | 70.5 | 59.5 | IB | 定制卷帘 / 罗马帘 | 右拉或无绳 | 照片5黄字标注：二楼次卧 70.5*59.5",
                      "2F 次卧侧窗 | IRV-06 | 35 1/2 | 47 1/2 | IB | 定制卷帘 | 无拉绳 Cordless | 照片6实测原始尺寸",
                    ].join("\n")
                  );
                }}
              >
                📸 切换《尔湾106号》测量表
              </button>
            </div>

            <div className="form-grid" style={{ marginTop: 10 }}>
              <label className="full">
                当前工作表名称（导出 Excel 文件名）
                <input
                  value={rawExcelProject}
                  onChange={(e) => setRawExcelProject(e.target.value)}
                />
              </label>
              <label className="full">
                窗位明细数据（支持随时增删修改，严格保留原始测量值与加工扣减公式）
                <textarea
                  rows={8}
                  value={rawExcelRowsText}
                  onChange={(e) => setRawExcelRowsText(e.target.value)}
                  style={{ fontFamily: "monospace", fontSize: 12 }}
                />
              </label>
            </div>

            <div className="table-wrap" style={{ marginTop: 12, background: "#fff", borderRadius: 10, border: "1px solid #cbd5cf", maxHeight: 480, overflowY: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>序号</th>
                    <th>房间窗位</th>
                    <th>编号 / 设计PDF定位</th>
                    <th>宽 (in)</th>
                    <th>高 (in / 加工高)</th>
                    <th>开合 / 安装</th>
                    <th>面料款式与型号</th>
                    <th>供应商 / 面积或杆轨</th>
                    <th>预算金额 / 核对备注</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRawExcelRows.map((r) => (
                    <tr key={r.seq}>
                      <td>{r.seq}</td>
                      <td><b>{r.floorRoom}</b></td>
                      <td><code>{r.winCode}</code></td>
                      <td><b style={{ color: "#173f35" }}>{r.rawWidth}&quot;</b></td>
                      <td><b style={{ color: "#173f35" }}>{r.rawHeight}&quot;</b></td>
                      <td>{r.mountType}</td>
                      <td>{r.productStyle}</td>
                      <td>{r.controlHardware}</td>
                      <td>{r.rawNote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12, marginBottom: 20 }}>
              <button className="primary" onClick={exportStrictExcelCsv}>
                📥 导出当前表为 Excel (.csv)
              </button>
              <button
                className="secondary"
                onClick={async () => {
                  const tsv = [
                    ["序号", "房间窗位", "编号/设计PDF定位", "宽(in)", "高(in/加工高)", "开合/安装", "面料款式与型号", "供应商/面积", "预算金额/备注"].join("\t"),
                    ...parsedRawExcelRows.map((r) =>
                      [r.seq, r.floorRoom, r.winCode, r.rawWidth, r.rawHeight, r.mountType, r.productStyle, r.controlHardware, r.rawNote].join("\t")
                    ),
                  ].join("\n");
                  await navigator.clipboard.writeText(tsv);
                  notify("已复制为 Excel 制表符格式，可直接打开 Excel 或 Google Sheets 粘贴！");
                }}
              >
                📋 复制当前表（可直接粘贴进 Excel / Google Sheets）
              </button>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #d5ddd8", margin: "16px 0" }} />

            <h3 style={{ marginTop: 0 }}>2. 窗帘效果图制作 & 窗帘尺寸与款式明细表（同步自您的 Gemini《窗帘效果图制作》）</h3>
            <p style={{ fontSize: 12, color: "#5b655f", lineHeight: 1.7 }}>
              已接入您在 Gemini 中的标准零售看图出图流程：<strong>上传窗户测量实拍图（带红字标尺）+ 款式参考图 + 布料型号标签图（如 Width: 320cm）</strong>，自动按「<strong>宽度比窗两侧各增加 10 英寸、高度增加 10 英寸、配黑色杆</strong>」生成效果图指令与工厂下单尺寸表。
            </p>
            <div style={{ background: "#fff", padding: 14, borderRadius: 10, border: "1px solid #cbd5cf", marginTop: 10, fontSize: 13, lineHeight: 1.8 }}>
              <div><b>📌 您的 Gemini《窗帘效果图制作》预设指令模板：</b></div>
              <div style={{ padding: "8px 12px", background: "#f2f7f4", borderRadius: 8, margin: "6px 0" }}>
                「给前面两个窗添加布艺窗帘，布料型号是最后一张图片（门幅 320cm / 126&quot;），宽度比窗两侧各增加 10 英寸（总宽 +20&quot;），高度增加 10 英寸，黑色杆，制作效果图」
              </div>
              <div style={{ fontSize: 12, color: "#5b655f" }}>
                • <b>外扩尺寸自动换算</b>：窗1 / 窗2 成品宽 = 窗户实测净宽 + 20&quot;（左右各 +10&quot;）；成品安装高 = 窗户实测净高 + 10&quot;；配黑色罗马杆（Black Curtain Rod）。
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
              <button
                className="primary"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    "给前面两个窗添加布艺窗帘，布料型号是最后一张图片，宽度比窗两侧各增加10英寸，高度增加10英寸，黑色杆，制作效果图"
                  );
                  notify("Gemini 窗帘效果图制作标准指令已复制！");
                }}
              >
                📋 一键复制「窗帘效果图制作」标准指令
              </button>
              <button className="secondary" onClick={() => setActiveTool("highWindow")}>
                📐 去「挑高/外扩尺寸核算器」计算左右+10&quot;/高+10&quot;用料 →
              </button>
              <button className="secondary" onClick={() => go("报价管理")}>
                打开 Braun Complete v3.0 尺寸款式明细表 →
              </button>
              <a
                className="secondary"
                href="/design-studio"
                style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}
              >
                打开窗帘设计中心与效果图工作台 →
              </a>
              <a
                className="secondary"
                href="/manufacturing-drawing"
                style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}
              >
                打开双语加工图制作 →
              </a>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

// ==========================================
// 4. 模块二：批发业务管理（5步闭环）
// 1.客户发型号尺寸 -> 2.报价和标注细节 -> 3.客户同意并付款 -> 4.下单给工厂 -> 5.到货通知取货/我去安装
// ==========================================

const WHOLESALE_STAGES: WholesaleStage[] = [
  "待报价标注",
  "已报价待付款",
  "已付款待下厂",
  "已下单工厂生产中",
  "已到货待通知取货",
  "已到货待我去安装",
  "已完成",
];

export function WholesaleWorkflowPage({ notify }: { notify: (msg: string) => void }) {
  const [items, setItems] = useState<WholesaleItem[]>(() => loadLocalList<WholesaleItem>(STORAGE_KEYS.wholesale));
  const [stageFilter, setStageFilter] = useState<string>("全部");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    customer: "",
    phone: "",
    rawSpec: "",
    detailNotes: "",
    quoteUsd: "",
    paidUsd: "",
    paymentMethod: "Zelle",
    factoryName: "国内主力工厂",
    factoryOrderNo: "",
    factoryCostCurrency: "RMB" as "USD" | "RMB",
    factoryCost: "",
    deliveryMode: "客户自提" as "客户自提" | "我去安装",
    installAddress: "",
  });

  const save = (next: WholesaleItem[]) => {
    setItems(next);
    saveLocalList(STORAGE_KEYS.wholesale, next);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const extracted = extractInquiryLines(form.rawSpec);
    const parsedSummary = extracted.lines
      .map((l, idx) => {
        const d = l.draft;
        const size = d.widthInches && d.heightInches ? `${d.widthInches}"×${d.heightInches}"` : "尺寸见原文";
        return `窗${idx + 1}: ${d.productCode || "型号见原文"} (${size}) ×${d.quantity || 1}`;
      })
      .join("；");

    const now = new Date().toLocaleString("zh-CN", { hour12: false });
    const quote = Number(form.quoteUsd) || 0;
    const paid = Number(form.paidUsd) || 0;
    let initialStage: WholesaleStage = "待报价标注";
    if (quote > 0 && paid <= 0) initialStage = "已报价待付款";
    if (paid > 0) initialStage = "已付款待下厂";

    const newItem: WholesaleItem = {
      id: `WS-${Date.now().toString().slice(-6)}`,
      customer: form.customer.trim() || "批发客户",
      phone: form.phone.trim(),
      rawSpec: form.rawSpec.trim(),
      parsedSummary: parsedSummary || form.rawSpec.trim(),
      detailNotes: form.detailNotes.trim(),
      quoteUsd: quote,
      paidUsd: paid,
      paymentMethod: form.paymentMethod,
      factoryName: form.factoryName.trim(),
      factoryOrderNo: form.factoryOrderNo.trim(),
      factoryCostCurrency: form.factoryCostCurrency,
      factoryCost: Number(form.factoryCost) || 0,
      deliveryMode: form.deliveryMode,
      installAddress: form.installAddress.trim(),
      stage: initialStage,
      createdAt: now,
      updatedAt: now,
    };

    save([newItem, ...items]);
    setCreating(false);
    setForm({
      customer: "",
      phone: "",
      rawSpec: "",
      detailNotes: "",
      quoteUsd: "",
      paidUsd: "",
      paymentMethod: "Zelle",
      factoryName: "国内主力工厂",
      factoryOrderNo: "",
      factoryCostCurrency: "RMB",
      factoryCost: "",
      deliveryMode: "客户自提",
      installAddress: "",
    });
    notify(`批发单 ${newItem.id} 已建立`);
  };

  // 推进状态并自动记账/提醒
  const advanceStage = (item: WholesaleItem, targetStage: WholesaleStage) => {
    const now = new Date().toLocaleString("zh-CN", { hour12: false });
    const updated: WholesaleItem = {
      ...item,
      stage: targetStage,
      PaidUsd: targetStage === "已付款待下厂" && item.paidUsd === 0 ? item.quoteUsd : item.paidUsd,
      paidUsd: targetStage === "已付款待下厂" && item.paidUsd === 0 ? item.quoteUsd : item.paidUsd,
      updatedAt: now,
    } as WholesaleItem;

    save(items.map((x) => (x.id === item.id ? updated : x)));

    // 如果进入“已付款待下厂”，自动询问/写入一笔批发收款记账
    if (targetStage === "已付款待下厂" && updated.paidUsd > 0) {
      const ledger = loadLocalList<LedgerEntry>(STORAGE_KEYS.ledger);
      if (!ledger.some((l) => l.relatedOrderId === item.id && l.direction === "收入")) {
        ledger.unshift({
          id: `ACC-${Date.now().toString().slice(-6)}`,
          date: new Date().toISOString().slice(0, 10),
          direction: "收入",
          category: "批发订单收款",
          currency: "USD",
          amount: updated.paidUsd,
          method: updated.paymentMethod || "Zelle",
          relatedOrderId: item.id,
          counterparty: item.customer,
          note: `批发单 ${item.id} 客户付款（${item.parsedSummary}）`,
          createdAt: now,
        });
        saveLocalList(STORAGE_KEYS.ledger, ledger);
        notify(`已更新为【已付款待下厂】，并自动记入公司账本 +${fmtMoney(updated.paidUsd, "USD")}`);
        return;
      }
    }

    // 如果进入“已下单工厂生产中”且填了工厂成本，自动记入工厂支出
    if (targetStage === "已下单工厂生产中" && updated.factoryCost > 0) {
      const ledger = loadLocalList<LedgerEntry>(STORAGE_KEYS.ledger);
      if (!ledger.some((l) => l.relatedOrderId === item.id && l.category === "支付工厂货款")) {
        ledger.unshift({
          id: `ACC-${Date.now().toString().slice(-6)}`,
          date: new Date().toISOString().slice(0, 10),
          direction: "支出",
          category: "支付工厂货款",
          currency: updated.factoryCostCurrency,
          amount: updated.factoryCost,
          method: "银行转账",
          relatedOrderId: item.id,
          counterparty: updated.factoryName || "加工工厂",
          note: `批发单 ${item.id} 下单工厂成本（厂单号 ${updated.factoryOrderNo || "待填"}）`,
          createdAt: now,
        });
        saveLocalList(STORAGE_KEYS.ledger, ledger);
      }
    }

    // 如果进入“已到货待通知取货”或“已到货待我去安装”，自动生成待办提醒
    if (targetStage === "已到货待通知取货" || targetStage === "已到货待我去安装") {
      const reminders = loadLocalList<SmartReminder>(STORAGE_KEYS.reminders);
      reminders.unshift({
        id: `REM-${Date.now().toString().slice(-6)}`,
        dueTime: "今天",
        category: targetStage === "已到货待通知取货" ? "到货取货通知" : "上门安装",
        title: `${targetStage === "已到货待通知取货" ? "通知客户取货" : "安排去给客户安装"}：${item.customer} (${item.id})`,
        detail: `${item.parsedSummary} · 电话：${item.phone || "—"}`,
        relatedId: item.id,
        priority: "紧急",
        done: false,
      });
      saveLocalList(STORAGE_KEYS.reminders, reminders);
    }

    notify(`${item.id} 状态已更新为：${targetStage}`);
  };

  const copyPickupNotice = async (item: WholesaleItem) => {
    const text =
      item.deliveryMode === "客户自提"
        ? `【到货取货通知】${item.customer} 您好！您的窗帘订单（${item.id}：${item.parsedSummary}）已经到货入库，可以随时来仓库取货。地址：2115 S. Hellman Ave, Unit E, Ontario, CA 91761，来之前请跟我确认一下时间，谢谢！`
        : `【到货安装通知】${item.customer} 您好！您的窗帘订单（${item.id}：${item.parsedSummary}）已经到货，我们可以安排时间过去为您安装，请问您哪天方便？`;
    await navigator.clipboard.writeText(text);
    notify("通知话术已复制，可直接粘贴到微信或短信发送给客户");
  };

  const copyFactorySheet = async (item: WholesaleItem) => {
    const text = `【工厂生产下单表】\n内部单号：${item.id}\n客户代号：${item.customer}\n型号与尺寸明细：${item.rawSpec}\n智能核对：${item.parsedSummary}\n工艺与细节标注：${item.detailNotes || "按标准工艺"}`;
    await navigator.clipboard.writeText(text);
    notify("工厂下单明细已复制，可直接发给工厂");
  };

  const visible = items.filter((x) => stageFilter === "全部" || x.stage === stageFilter);

  return (
    <>
      <div className="module-head">
        <div>
          <span className="eyebrow">业务一 · 批发全流程（型号尺寸 ➔ 报价标注 ➔ 收款 ➔ 下单工厂 ➔ 到货取货/安装）</span>
          <h1>批发业务管理</h1>
          <p>客户发来型号和尺寸后，在这里完成报价与细节标注、确认收款、下单工厂、到货通知客户自提或安排我去安装。</p>
        </div>
        <button className="primary" onClick={() => setCreating((v) => !v)}>
          {creating ? "收起表单" : "＋ 新建批发询价单"}
        </button>
      </div>

      <section className="kpi-grid">
        <article className="kpi">
          <span>1. 待报价 / 待付款</span>
          <strong>{items.filter((x) => ["待报价标注", "已报价待付款"].includes(x.stage)).length}</strong>
          <small>需报价或等客户付款</small>
        </article>
        <article className="kpi">
          <span>2. 已付款待下厂</span>
          <strong>{items.filter((x) => x.stage === "已付款待下厂").length}</strong>
          <small>客户已付，需尽快发给工厂</small>
        </article>
        <article className="kpi">
          <span>3. 工厂生产中</span>
          <strong>{items.filter((x) => x.stage === "已下单工厂生产中").length}</strong>
          <small>跟踪工厂发货与到货</small>
        </article>
        <article className="kpi">
          <span>4. 已到货待取货/安装</span>
          <strong>{items.filter((x) => ["已到货待通知取货", "已到货待我去安装"].includes(x.stage)).length}</strong>
          <small>需通知客户自提或我去安装</small>
        </article>
      </section>

      {creating && (
        <form className="panel" onSubmit={handleCreate} style={{ marginBottom: 16 }}>
          <h2>新建批发订单（支持直接粘贴客户发来的型号与尺寸）</h2>
          <div className="form-grid" style={{ marginTop: 12 }}>
            <label>
              批发客户名称 *
              <input
                required
                value={form.customer}
                onChange={(e) => setForm({ ...form, customer: e.target.value })}
                placeholder="例如：Blinds America / 李总"
              />
            </label>
            <label>
              客户电话 / 微信
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="例如：626-555-0199"
              />
            </label>
            <label className="full">
              客户发来的型号和尺寸（可多行粘贴，系统自动解析英寸分数） *
              <textarea
                required
                rows={4}
                value={form.rawSpec}
                onChange={(e) => setForm({ ...form, rawSpec: e.target.value })}
                placeholder={"1. JL3601 White LF 39 5/8 x 40 5/8 qty 2 motorized\n2. ML-1801 48 x 72 qty 1 cordless"}
              />
            </label>
            <label className="full">
              报价细节与工艺标注（安装方式、减尺寸、拉绳方向、罩盒、花边等）
              <input
                value={form.detailNotes}
                onChange={(e) => setForm({ ...form, detailNotes: e.target.value })}
                placeholder="例如：口内安装自动减1/4寸，1号窗右控配7通道遥控器"
              />
            </label>
            <label>
              给客户报价金额 (USD $)
              <input
                type="number"
                step="0.01"
                value={form.quoteUsd}
                onChange={(e) => setForm({ ...form, quoteUsd: e.target.value })}
                placeholder="0.00"
              />
            </label>
            <label>
              已收客户款项 (USD $)
              <input
                type="number"
                step="0.01"
                value={form.paidUsd}
                onChange={(e) => setForm({ ...form, paidUsd: e.target.value })}
                placeholder="客户付款后填写，自动记账"
              />
            </label>
            <label>
              到货后交付方式
              <select
                value={form.deliveryMode}
                onChange={(e) => setForm({ ...form, deliveryMode: e.target.value as "客户自提" | "我去安装" })}
              >
                <option value="客户自提">到货通知客户自提</option>
                <option value="我去安装">到货后我去安装</option>
              </select>
            </label>
            <label>
              分配加工工厂
              <input
                value={form.factoryName}
                onChange={(e) => setForm({ ...form, factoryName: e.target.value })}
                placeholder="例如：国内罗马帘一厂 / CWF"
              />
            </label>
            <label>
              工厂成本币种
              <select
                value={form.factoryCostCurrency}
                onChange={(e) => setForm({ ...form, factoryCostCurrency: e.target.value as "USD" | "RMB" })}
              >
                <option value="RMB">人民币 (RMB ¥)</option>
                <option value="USD">美元 (USD $)</option>
              </select>
            </label>
            <label>
              工厂下单成本金额
              <input
                type="number"
                step="0.01"
                value={form.factoryCost}
                onChange={(e) => setForm({ ...form, factoryCost: e.target.value })}
                placeholder="0.00"
              />
            </label>
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
            <button type="submit" className="primary">
              保存批发单
            </button>
            <button type="button" className="secondary" onClick={() => setCreating(false)}>
              取消
            </button>
          </div>
        </form>
      )}

      <div className="task-filters" style={{ marginBottom: 14 }}>
        {["全部", ...WHOLESALE_STAGES].map((st) => (
          <button
            key={st}
            className={stageFilter === st ? "active" : ""}
            onClick={() => setStageFilter(st)}
          >
            {st} ({st === "全部" ? items.length : items.filter((x) => x.stage === st).length})
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {visible.map((item) => (
          <article className="panel" key={item.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <span className={`status ${item.stage === "已完成" ? "green" : item.stage.includes("已到货") ? "red" : "blue"}`}>
                  <i />
                  {item.stage}
                </span>
                <strong style={{ marginLeft: 10, fontSize: 16 }}>
                  {item.id} · {item.customer}
                </strong>
                {item.phone && <span style={{ marginLeft: 10, fontSize: 12, color: "#65746d" }}>📞 {item.phone}</span>}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="secondary" onClick={() => copyFactorySheet(item)}>
                  📋 复制工厂下单表
                </button>
                <button className="secondary" onClick={() => copyPickupNotice(item)}>
                  💬 复制到货{item.deliveryMode === "客户自提" ? "取货" : "安装"}通知
                </button>
                <button
                  className="secondary"
                  onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                >
                  {editingId === item.id ? "收起编辑" : "✎ 修改报价/标注/工厂成本"}
                </button>
              </div>
            </div>

            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, fontSize: 12, background: "#f8faf9", padding: 12, borderRadius: 10 }}>
              <div>
                <span style={{ color: "#7c8983", display: "block" }}>客户型号与尺寸</span>
                <b>{item.parsedSummary || item.rawSpec}</b>
              </div>
              <div>
                <span style={{ color: "#7c8983", display: "block" }}>报价与工艺细节标注</span>
                <b>{item.detailNotes || "待补充细节标注"}</b>
              </div>
              <div>
                <span style={{ color: "#7c8983", display: "block" }}>客户报价 / 已付款</span>
                <b>
                  报价 {fmtMoney(item.quoteUsd, "USD")} · 已收 {fmtMoney(item.paidUsd, "USD")}
                </b>
              </div>
              <div>
                <span style={{ color: "#7c8983", display: "block" }}>下单工厂 / 交付方式</span>
                <b>
                  {item.factoryName || "待定工厂"} ({fmtMoney(item.factoryCost, item.factoryCostCurrency)}) · {item.deliveryMode}
                </b>
              </div>
            </div>

            {editingId === item.id && (
              <div style={{ marginTop: 12, padding: 12, border: "1px solid #d5ddd8", borderRadius: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                <label style={{ fontSize: 12 }}>
                  客户报价 (USD)
                  <input
                    type="number"
                    step="0.01"
                    value={item.quoteUsd}
                    onChange={(e) =>
                      save(items.map((x) => (x.id === item.id ? { ...x, quoteUsd: Number(e.target.value) || 0 } : x)))
                    }
                    style={{ width: "100%", padding: 6 }}
                  />
                </label>
                <label style={{ fontSize: 12 }}>
                  已收款 (USD)
                  <input
                    type="number"
                    step="0.01"
                    value={item.paidUsd}
                    onChange={(e) =>
                      save(items.map((x) => (x.id === item.id ? { ...x, paidUsd: Number(e.target.value) || 0 } : x)))
                    }
                    style={{ width: "100%", padding: 6 }}
                  />
                </label>
                <label style={{ fontSize: 12 }}>
                  工艺细节标注
                  <input
                    value={item.detailNotes}
                    onChange={(e) =>
                      save(items.map((x) => (x.id === item.id ? { ...x, detailNotes: e.target.value } : x)))
                    }
                    style={{ width: "100%", padding: 6 }}
                  />
                </label>
                <label style={{ fontSize: 12 }}>
                  工厂名称
                  <input
                    value={item.factoryName}
                    onChange={(e) =>
                      save(items.map((x) => (x.id === item.id ? { ...x, factoryName: e.target.value } : x)))
                    }
                    style={{ width: "100%", padding: 6 }}
                  />
                </label>
                <label style={{ fontSize: 12 }}>
                  工厂成本 ({item.factoryCostCurrency})
                  <input
                    type="number"
                    step="0.01"
                    value={item.factoryCost}
                    onChange={(e) =>
                      save(items.map((x) => (x.id === item.id ? { ...x, factoryCost: Number(e.target.value) || 0 } : x)))
                    }
                    style={{ width: "100%", padding: 6 }}
                  />
                </label>
                <label style={{ fontSize: 12 }}>
                  交付方式
                  <select
                    value={item.deliveryMode}
                    onChange={(e) =>
                      save(
                        items.map((x) =>
                          x.id === item.id ? { ...x, deliveryMode: e.target.value as "客户自提" | "我去安装" } : x
                        )
                      )
                    }
                    style={{ width: "100%", padding: 6 }}
                  >
                    <option value="客户自提">客户自提</option>
                    <option value="我去安装">我去安装</option>
                  </select>
                </label>
              </div>
            )}

            <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#65746d" }}>流程推进：</span>
              <button
                className={item.stage === "已报价待付款" ? "primary" : "secondary"}
                onClick={() => advanceStage(item, "已报价待付款")}
              >
                ① 已报价标注
              </button>
              <button
                className={item.stage === "已付款待下厂" ? "primary" : "secondary"}
                onClick={() => advanceStage(item, "已付款待下厂")}
              >
                ② 客户同意并付款（自动记账）
              </button>
              <button
                className={item.stage === "已下单工厂生产中" ? "primary" : "secondary"}
                onClick={() => advanceStage(item, "已下单工厂生产中")}
              >
                ③ 已下单给工厂
              </button>
              <button
                className={item.stage === "已到货待通知取货" ? "primary" : "secondary"}
                onClick={() => advanceStage(item, "已到货待通知取货")}
              >
                ④ 到货通知客户取货
              </button>
              <button
                className={item.stage === "已到货待我去安装" ? "primary" : "secondary"}
                onClick={() => advanceStage(item, "已到货待我去安装")}
              >
                ④ 到货安排我去安装
              </button>
              <button
                className={item.stage === "已完成" ? "primary" : "secondary"}
                onClick={() => advanceStage(item, "已完成")}
              >
                ⑤ 完成结单 ✓
              </button>
              <button
                className="secondary"
                style={{ marginLeft: "auto", color: "#b45439" }}
                onClick={() => save(items.filter((x) => x.id !== item.id))}
              >
                删除
              </button>
            </div>
          </article>
        ))}

        {!visible.length && (
          <div className="panel empty-search">
            暂无该状态的批发业务记录。点击右上角「＋ 新建批发询价单」或在「智能体工作台」粘贴客户型号尺寸即可自动创建。
          </div>
        )}
      </div>
    </>
  );
}

// ==========================================
// 5. 模块三：零售定制管理（6步闭环）
// 预约时间测量 -> 选产品 -> 报价 -> 确定后收款 -> 下单给工厂 -> 收到后安装
// ==========================================

const RETAIL_STAGES: RetailStage[] = [
  "已预约待测量",
  "已测量待选品报价",
  "已报价待确定收款",
  "已收款待下单工厂",
  "工厂生产中",
  "已到货待上门安装",
  "已安装完工结清",
];

export function RetailWorkflowPage({ notify }: { notify: (msg: string) => void }) {
  const [items, setItems] = useState<RetailItem[]>(() => loadLocalList<RetailItem>(STORAGE_KEYS.retail));
  const [stageFilter, setStageFilter] = useState<string>("全部");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    customer: "",
    phone: "",
    address: "",
    measureTime: "",
    measureNotes: "",
    selectedProducts: "",
    quoteUsd: "",
    depositUsd: "",
    paymentMethod: "Zelle",
    factoryName: "国内定制工厂",
    factoryCostCurrency: "RMB" as "USD" | "RMB",
    factoryCost: "",
    installTime: "",
  });

  const save = (next: RetailItem[]) => {
    setItems(next);
    saveLocalList(STORAGE_KEYS.retail, next);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toLocaleString("zh-CN", { hour12: false });
    const newItem: RetailItem = {
      id: `RT-${Date.now().toString().slice(-6)}`,
      customer: form.customer.trim() || "零售客户",
      phone: form.phone.trim(),
      address: form.address.trim(),
      measureTime: form.measureTime ? form.measureTime.replace("T", " ") : "待定",
      measureNotes: form.measureNotes.trim(),
      selectedProducts: form.selectedProducts.trim(),
      quoteUsd: Number(form.quoteUsd) || 0,
      depositUsd: Number(form.depositUsd) || 0,
      totalPaidUsd: Number(form.depositUsd) || 0,
      paymentMethod: form.paymentMethod,
      factoryName: form.factoryName.trim(),
      factoryOrderNo: "",
      factoryCostCurrency: form.factoryCostCurrency,
      factoryCost: Number(form.factoryCost) || 0,
      installTime: form.installTime ? form.installTime.replace("T", " ") : "待定",
      stage: "已预约待测量",
      createdAt: now,
      updatedAt: now,
    };

    save([newItem, ...items]);

    // 自动写入测量提醒
    const reminders = loadLocalList<SmartReminder>(STORAGE_KEYS.reminders);
    reminders.unshift({
      id: `REM-${Date.now().toString().slice(-6)}`,
      dueTime: newItem.measureTime,
      category: "预约测量",
      title: `零售上门测量：${newItem.customer}`,
      detail: `地址：${newItem.address || "—"} · 电话：${newItem.phone || "—"}`,
      relatedId: newItem.id,
      priority: "紧急",
      done: false,
    });
    saveLocalList(STORAGE_KEYS.reminders, reminders);

    setCreating(false);
    setForm({
      customer: "",
      phone: "",
      address: "",
      measureTime: "",
      measureNotes: "",
      selectedProducts: "",
      quoteUsd: "",
      depositUsd: "",
      paymentMethod: "Zelle",
      factoryName: "国内定制工厂",
      factoryCostCurrency: "RMB",
      factoryCost: "",
      installTime: "",
    });
    notify(`零售预约单 ${newItem.id} 已建立，并已加入测量提醒`);
  };

  const advanceRetail = (item: RetailItem, targetStage: RetailStage) => {
    const now = new Date().toLocaleString("zh-CN", { hour12: false });
    const nextPaid =
      targetStage === "已安装完工结清" && item.quoteUsd > item.totalPaidUsd
        ? item.quoteUsd
        : targetStage === "已收款待下单工厂" && item.totalPaidUsd === 0
        ? item.depositUsd || item.quoteUsd
        : item.totalPaidUsd;

    const deltaPaid = Math.max(0, nextPaid - item.totalPaidUsd);
    const updated: RetailItem = {
      ...item,
      stage: targetStage,
      totalPaidUsd: nextPaid,
      updatedAt: now,
    };

    save(items.map((x) => (x.id === item.id ? updated : x)));

    // 如果产生新收款（收定金或完工结清尾款），自动记入账本
    if (deltaPaid > 0 || (targetStage === "已收款待下单工厂" && updated.totalPaidUsd > 0)) {
      const ledger = loadLocalList<LedgerEntry>(STORAGE_KEYS.ledger);
      const amountToRecord = deltaPaid > 0 ? deltaPaid : updated.totalPaidUsd;
      if (amountToRecord > 0) {
        ledger.unshift({
          id: `ACC-${Date.now().toString().slice(-6)}`,
          date: new Date().toISOString().slice(0, 10),
          direction: "收入",
          category: "零售定制收款",
          currency: "USD",
          amount: amountToRecord,
          method: updated.paymentMethod || "Zelle",
          relatedOrderId: item.id,
          counterparty: item.customer,
          note: `零售单 ${item.id} (${targetStage}) 收款`,
          createdAt: now,
        });
        saveLocalList(STORAGE_KEYS.ledger, ledger);
      }
    }

    // 如果到货待安装，自动加入安装提醒
    if (targetStage === "已到货待上门安装") {
      const reminders = loadLocalList<SmartReminder>(STORAGE_KEYS.reminders);
      reminders.unshift({
        id: `REM-${Date.now().toString().slice(-6)}`,
        dueTime: item.installTime !== "待定" ? item.installTime : "今天联系客户约安装",
        category: "上门安装",
        title: `零售到货待安装：${item.customer} (${item.id})`,
        detail: `地址：${item.address} · 电话：${item.phone} · 待收尾款：${fmtMoney(Math.max(0, item.quoteUsd - updated.totalPaidUsd), "USD")}`,
        relatedId: item.id,
        priority: "紧急",
        done: false,
      });
      saveLocalList(STORAGE_KEYS.reminders, reminders);
    }

    notify(`零售单 ${item.id} 已推进至：${targetStage}`);
  };

  const visible = items.filter((x) => stageFilter === "全部" || x.stage === stageFilter);

  return (
    <>
      <div className="module-head">
        <div>
          <span className="eyebrow">业务二 · 零售窗帘定制（预约测量 ➔ 选产品 ➔ 报价 ➔ 收款 ➔ 下单工厂 ➔ 收到安装）</span>
          <h1>零售定制管理</h1>
          <p>客户找您做窗帘时，从预约上门测量、现场选产品、报价、收定金、下单工厂到到货上门安装并收齐尾款的全流程管理。</p>
        </div>
        <button className="primary" onClick={() => setCreating((v) => !v)}>
          {creating ? "收起表单" : "＋ 新建零售预约测量"}
        </button>
      </div>

      <section className="kpi-grid">
        <article className="kpi">
          <span>1. 待上门测量</span>
          <strong>{items.filter((x) => x.stage === "已预约待测量").length}</strong>
          <small>已约时间待现场测量</small>
        </article>
        <article className="kpi">
          <span>2. 待选品报价 / 待收款</span>
          <strong>{items.filter((x) => ["已测量待选品报价", "已报价待确定收款"].includes(x.stage)).length}</strong>
          <small>需跟进方案与收定金</small>
        </article>
        <article className="kpi">
          <span>3. 待下厂 / 生产中</span>
          <strong>{items.filter((x) => ["已收款待下单工厂", "工厂生产中"].includes(x.stage)).length}</strong>
          <small>工厂定制加工阶段</small>
        </article>
        <article className="kpi">
          <span>4. 已到货待我去安装</span>
          <strong>{items.filter((x) => x.stage === "已到货待上门安装").length}</strong>
          <small>需预约上门安装并收尾款</small>
        </article>
      </section>

      {creating && (
        <form className="panel" onSubmit={handleCreate} style={{ marginBottom: 16 }}>
          <h2>新建零售客户预约测量</h2>
          <div className="form-grid" style={{ marginTop: 12 }}>
            <label>
              客户姓名 *
              <input
                required
                value={form.customer}
                onChange={(e) => setForm({ ...form, customer: e.target.value })}
                placeholder="例如：王女士 / 张先生"
              />
            </label>
            <label>
              联系电话 *
              <input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="例如：626-888-0000"
              />
            </label>
            <label>
              预约测量时间 *
              <input
                type="datetime-local"
                required
                value={form.measureTime}
                onChange={(e) => setForm({ ...form, measureTime: e.target.value })}
              />
            </label>
            <label>
              测量与安装地址 *
              <input
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="客户住宅完整地址"
              />
            </label>
            <label className="full">
              意向产品与房间备注（测量后可补充具体尺寸和选品）
              <textarea
                rows={3}
                value={form.selectedProducts}
                onChange={(e) => setForm({ ...form, selectedProducts: e.target.value })}
                placeholder="例如：一楼客厅蛇形帘+纱帘，二楼3个卧室罗马帘遮光衬"
              />
            </label>
            <label>
              报价总额 (USD $)
              <input
                type="number"
                step="0.01"
                value={form.quoteUsd}
                onChange={(e) => setForm({ ...form, quoteUsd: e.target.value })}
                placeholder="测量选品后可填"
              />
            </label>
            <label>
              已收定金/款项 (USD $)
              <input
                type="number"
                step="0.01"
                value={form.depositUsd}
                onChange={(e) => setForm({ ...form, depositUsd: e.target.value })}
                placeholder="0.00"
              />
            </label>
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
            <button type="submit" className="primary">
              保存预约并加入提醒
            </button>
            <button type="button" className="secondary" onClick={() => setCreating(false)}>
              取消
            </button>
          </div>
        </form>
      )}

      <div className="task-filters" style={{ marginBottom: 14 }}>
        {["全部", ...RETAIL_STAGES].map((st) => (
          <button
            key={st}
            className={stageFilter === st ? "active" : ""}
            onClick={() => setStageFilter(st)}
          >
            {st} ({st === "全部" ? items.length : items.filter((x) => x.stage === st).length})
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {visible.map((item) => {
          const unpaid = Math.max(0, item.quoteUsd - item.totalPaidUsd);
          return (
            <article className="panel" key={item.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <span className={`status ${item.stage === "已安装完工结清" ? "green" : item.stage.includes("待") ? "amber" : "blue"}`}>
                    <i />
                    {item.stage}
                  </span>
                  <strong style={{ marginLeft: 10, fontSize: 16 }}>
                    {item.id} · {item.customer}
                  </strong>
                  <span style={{ marginLeft: 10, fontSize: 12, color: "#65746d" }}>
                    📞 {item.phone || "—"} · 📍 {item.address || "未填地址"}
                  </span>
                </div>
                <button
                  className="secondary"
                  onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                >
                  {editingId === item.id ? "收起编辑" : "✎ 填写测量尺寸 / 选品报价 / 收款"}
                </button>
              </div>

              <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, fontSize: 12, background: "#f8faf9", padding: 12, borderRadius: 10 }}>
                <div>
                  <span style={{ color: "#7c8983", display: "block" }}>预约测量时间</span>
                  <b>{item.measureTime}</b>
                </div>
                <div>
                  <span style={{ color: "#7c8983", display: "block" }}>所选产品与测量尺寸</span>
                  <b>{item.selectedProducts || "待选品"} {item.measureNotes ? `（${item.measureNotes}）` : ""}</b>
                </div>
                <div>
                  <span style={{ color: "#7c8983", display: "block" }}>报价 / 已收 / 待收尾款</span>
                  <b>
                    总价 {fmtMoney(item.quoteUsd)} · 已收 {fmtMoney(item.totalPaidUsd)} · 尾款{" "}
                    <span style={{ color: unpaid > 0 ? "#b45439" : "#2e705d" }}>{fmtMoney(unpaid)}</span>
                  </b>
                </div>
                <div>
                  <span style={{ color: "#7c8983", display: "block" }}>工厂下单与预约安装</span>
                  <b>
                    {item.factoryName || "待下厂"} · 安装时间：{item.installTime}
                  </b>
                </div>
              </div>

              {editingId === item.id && (
                <div style={{ marginTop: 12, padding: 12, border: "1px solid #d5ddd8", borderRadius: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                  <label style={{ fontSize: 12 }}>
                    测量尺寸记录
                    <input
                      value={item.measureNotes}
                      onChange={(e) =>
                        save(items.map((x) => (x.id === item.id ? { ...x, measureNotes: e.target.value } : x)))
                      }
                      placeholder="各窗宽高与安装方式"
                      style={{ width: "100%", padding: 6 }}
                    />
                  </label>
                  <label style={{ fontSize: 12 }}>
                    选定产品与面料
                    <input
                      value={item.selectedProducts}
                      onChange={(e) =>
                        save(items.map((x) => (x.id === item.id ? { ...x, selectedProducts: e.target.value } : x)))
                      }
                      style={{ width: "100%", padding: 6 }}
                    />
                  </label>
                  <label style={{ fontSize: 12 }}>
                    报价总额 (USD)
                    <input
                      type="number"
                      step="0.01"
                      value={item.quoteUsd}
                      onChange={(e) =>
                        save(items.map((x) => (x.id === item.id ? { ...x, quoteUsd: Number(e.target.value) || 0 } : x)))
                      }
                      style={{ width: "100%", padding: 6 }}
                    />
                  </label>
                  <label style={{ fontSize: 12 }}>
                    累计已收款 (USD)
                    <input
                      type="number"
                      step="0.01"
                      value={item.totalPaidUsd}
                      onChange={(e) =>
                        save(items.map((x) => (x.id === item.id ? { ...x, totalPaidUsd: Number(e.target.value) || 0 } : x)))
                      }
                      style={{ width: "100%", padding: 6 }}
                    />
                  </label>
                  <label style={{ fontSize: 12 }}>
                    工厂成本 ({item.factoryCostCurrency})
                    <input
                      type="number"
                      step="0.01"
                      value={item.factoryCost}
                      onChange={(e) =>
                        save(items.map((x) => (x.id === item.id ? { ...x, factoryCost: Number(e.target.value) || 0 } : x)))
                      }
                      style={{ width: "100%", padding: 6 }}
                    />
                  </label>
                  <label style={{ fontSize: 12 }}>
                    预约安装时间
                    <input
                      value={item.installTime}
                      onChange={(e) =>
                        save(items.map((x) => (x.id === item.id ? { ...x, installTime: e.target.value } : x)))
                      }
                      placeholder="例如：下周三上午 10:00"
                      style={{ width: "100%", padding: 6 }}
                    />
                  </label>
                </div>
              )}

              <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#65746d" }}>流程推进：</span>
                <button
                  className={item.stage === "已测量待选品报价" ? "primary" : "secondary"}
                  onClick={() => advanceRetail(item, "已测量待选品报价")}
                >
                  ① 完成测量与选品
                </button>
                <button
                  className={item.stage === "已报价待确定收款" ? "primary" : "secondary"}
                  onClick={() => advanceRetail(item, "已报价待确定收款")}
                >
                  ② 已报价
                </button>
                <button
                  className={item.stage === "已收款待下单工厂" ? "primary" : "secondary"}
                  onClick={() => advanceRetail(item, "已收款待下单工厂")}
                >
                  ③ 客户确定并收款（自动记账）
                </button>
                <button
                  className={item.stage === "工厂生产中" ? "primary" : "secondary"}
                  onClick={() => advanceRetail(item, "工厂生产中")}
                >
                  ④ 已下单给工厂
                </button>
                <button
                  className={item.stage === "已到货待上门安装" ? "primary" : "secondary"}
                  onClick={() => advanceRetail(item, "已到货待上门安装")}
                >
                  ⑤ 到货待我去安装（加入提醒）
                </button>
                <button
                  className={item.stage === "已安装完工结清" ? "primary" : "secondary"}
                  onClick={() => advanceRetail(item, "已安装完工结清")}
                >
                  ⑥ 安装完工结清 ✓
                </button>
                <button
                  className="secondary"
                  style={{ marginLeft: "auto", color: "#b45439" }}
                  onClick={() => save(items.filter((x) => x.id !== item.id))}
                >
                  删除
                </button>
              </div>
            </article>
          );
        })}

        {!visible.length && (
          <div className="panel empty-search">
            暂无该状态的零售定制记录。点击右上角「＋ 新建零售预约测量」即可开始记录。
          </div>
        )}
      </div>
    </>
  );
}

// ==========================================
// 6. 模块四：公司日常记账（含订单收支 + 公司日常开销，USD/RMB 独立核算）
// ==========================================

const LEDGER_CATEGORIES: LedgerEntry["category"][] = [
  "批发订单收款",
  "零售定制收款",
  "支付工厂货款",
  "国际/本地运费",
  "安装工费",
  "公司房租与仓库",
  "车辆加油与保养",
  "水电网络办公",
  "工具与配件采购",
  "员工工资",
  "其他日常收支",
];

export function CompanyBookkeepingPage({ notify }: { notify: (msg: string) => void }) {
  const [entries, setEntries] = useState<LedgerEntry[]>(() => loadLocalList<LedgerEntry>(STORAGE_KEYS.ledger));
  const [filterCat, setFilterCat] = useState<string>("全部");
  const [quickInput, setQuickInput] = useState("");
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    direction: "支出" as "收入" | "支出",
    category: "车辆加油与保养" as LedgerEntry["category"],
    currency: "USD" as "USD" | "RMB",
    amount: "",
    method: "信用卡",
    counterparty: "",
    relatedOrderId: "",
    note: "",
  });

  const save = (next: LedgerEntry[]) => {
    setEntries(next);
    saveLocalList(STORAGE_KEYS.ledger, next);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!amount || amount <= 0) {
      notify("请输入有效的正数金额");
      return;
    }
    const item: LedgerEntry = {
      id: `ACC-${Date.now().toString().slice(-6)}`,
      date: form.date,
      direction: form.direction,
      category: form.category,
      currency: form.currency,
      amount,
      method: form.method,
      relatedOrderId: form.relatedOrderId.trim(),
      counterparty: form.counterparty.trim(),
      note: form.note.trim(),
      createdAt: new Date().toLocaleString("zh-CN", { hour12: false }),
    };
    save([item, ...entries]);
    setForm({ ...form, amount: "", note: "", counterparty: "", relatedOrderId: "" });
    notify(`已记入账本：${item.direction} ${fmtMoney(item.amount, item.currency)}`);
  };

  const handleQuickAdd = () => {
    if (!quickInput.trim()) return;
    const parsed = parseSmartInput("记账：" + quickInput);
    if (parsed.kind === "ledger" && parsed.amount > 0) {
      const item: LedgerEntry = {
        id: `ACC-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().slice(0, 10),
        direction: parsed.direction,
        category: parsed.category,
        currency: parsed.currency,
        amount: parsed.amount,
        method: parsed.method,
        relatedOrderId: "",
        counterparty: parsed.counterparty,
        note: quickInput.trim(),
        createdAt: new Date().toLocaleString("zh-CN", { hour12: false }),
      };
      save([item, ...entries]);
      setQuickInput("");
      notify(`智能记账成功：${item.category} ${fmtMoney(item.amount, item.currency)}`);
    } else {
      notify("未能识别出金额，请包含具体数字（如：今天加油花了 $75）");
    }
  };

  const exportCsv = () => {
    const header = "编号,日期,收支方向,分类,币种,金额,支付方式,关联单号,往来对象,备注说明";
    const rows = entries.map((e) =>
      [e.id, e.date, e.direction, e.category, e.currency, e.amount, e.method, e.relatedOrderId, e.counterparty, e.note]
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const blob = new Blob(["\ufeff" + [header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `公司日常记账明细-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const usdIncome = entries
    .filter((x) => x.currency === "USD" && x.direction === "收入")
    .reduce((s, x) => s + x.amount, 0);
  const usdExpense = entries
    .filter((x) => x.currency === "USD" && x.direction === "支出")
    .reduce((s, x) => s + x.amount, 0);
  const rmbExpense = entries
    .filter((x) => x.currency === "RMB" && x.direction === "支出")
    .reduce((s, x) => s + x.amount, 0);

  const visible = entries.filter((x) => filterCat === "全部" || x.category === filterCat);

  return (
    <>
      <div className="module-head">
        <div>
          <span className="eyebrow">财务与日常记账 · 严格区分美元 (USD) 与人民币 (RMB)</span>
          <h1>公司日常记账</h1>
          <p>统一记录批发/零售收款、支付工厂货款，以及公司房租、车辆油费、水电办公、买工具配件、工资等日常开销。</p>
        </div>
        <button className="secondary" onClick={exportCsv}>
          导出 Excel / CSV 账本
        </button>
      </div>

      <section className="kpi-grid">
        <article className="kpi">
          <span>美元总收入 (USD)</span>
          <strong style={{ color: "#2e705d" }}>{fmtMoney(usdIncome, "USD")}</strong>
          <small>批发收款 + 零售定制收款</small>
        </article>
        <article className="kpi">
          <span>美元总支出 (USD)</span>
          <strong style={{ color: "#b45439" }}>{fmtMoney(usdExpense, "USD")}</strong>
          <small>日常开销 + 本地运费/安装</small>
        </article>
        <article className="kpi">
          <span>美元净结余 (USD)</span>
          <strong>{fmtMoney(usdIncome - usdExpense, "USD")}</strong>
          <small>USD 收入减去 USD 支出</small>
        </article>
        <article className="kpi">
          <span>人民币工厂支出 (RMB)</span>
          <strong style={{ color: "#9a6b1e" }}>{fmtMoney(rmbExpense, "RMB")}</strong>
          <small>国内工厂货款/运费独立核算</small>
        </article>
      </section>

      <section className="panel" style={{ marginBottom: 16 }}>
        <h2>⚡ 一句话快速记账（智能体自动分类）</h2>
        <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
          <input
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
            placeholder="例如：今天货车加油花了 $78 / 付仓库房租 $2100 / 付国内工厂货款 ¥9500 / 收到李总批发款 $1280"
            style={{ flex: "1 1 320px", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5cf" }}
          />
          <button className="primary" onClick={handleQuickAdd}>
            ✦ 一键智能入账
          </button>
        </div>
      </section>

      <form className="panel" onSubmit={handleAdd} style={{ marginBottom: 16 }}>
        <h2>手工登记收支明细</h2>
        <div className="form-grid" style={{ marginTop: 10 }}>
          <label>
            日期
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </label>
          <label>
            收支方向
            <select
              value={form.direction}
              onChange={(e) => setForm({ ...form, direction: e.target.value as "收入" | "支出" })}
            >
              <option value="支出">支出（日常开销/工厂货款）</option>
              <option value="收入">收入（批发/零售收款）</option>
            </select>
          </label>
          <label>
            账目分类
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as LedgerEntry["category"] })}
            >
              {LEDGER_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            币种
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value as "USD" | "RMB" })}
            >
              <option value="USD">美元 (USD $)</option>
              <option value="RMB">人民币 (RMB ¥)</option>
            </select>
          </label>
          <label>
            金额 *
            <input
              type="number"
              step="0.01"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
            />
          </label>
          <label>
            支付/收款方式
            <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
              <option>信用卡</option>
              <option>Zelle</option>
              <option>支票</option>
              <option>现金</option>
              <option>银行转账</option>
              <option>微信/支付宝</option>
            </select>
          </label>
          <label>
            客户 / 供应商 / 商户
            <input
              value={form.counterparty}
              onChange={(e) => setForm({ ...form, counterparty: e.target.value })}
              placeholder="例如：Home Depot / 国内工厂 / 张先生"
            />
          </label>
          <label>
            备注说明
            <input
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="说明具体用途或对应窗帘项目"
            />
          </label>
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="submit" className="primary">
            保存记账记录
          </button>
        </div>
      </form>

      <div className="task-filters" style={{ marginBottom: 14 }}>
        {["全部", ...LEDGER_CATEGORIES].map((cat) => (
          <button
            key={cat}
            className={filterCat === cat ? "active" : ""}
            onClick={() => setFilterCat(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="panel module-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>日期</th>
                <th>方向</th>
                <th>分类</th>
                <th>金额</th>
                <th>方式</th>
                <th>客户/商户</th>
                <th>关联单号</th>
                <th>备注说明</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((e) => (
                <tr key={e.id}>
                  <td>{e.date}</td>
                  <td>
                    <span className={`status ${e.direction === "收入" ? "green" : "amber"}`}>
                      <i />
                      {e.direction}
                    </span>
                  </td>
                  <td><b>{e.category}</b></td>
                  <td>
                    <strong style={{ color: e.direction === "收入" ? "#2e705d" : "#b45439" }}>
                      {e.direction === "收入" ? "+" : "-"}
                      {fmtMoney(e.amount, e.currency)}
                    </strong>
                  </td>
                  <td>{e.method}</td>
                  <td>{e.counterparty || "—"}</td>
                  <td>{e.relatedOrderId || "—"}</td>
                  <td>{e.note || "—"}</td>
                  <td>
                    <button
                      onClick={() => save(entries.filter((x) => x.id !== e.id))}
                      style={{ border: "1px solid #d5ddd8", background: "#fff", borderRadius: 6, padding: "4px 8px", fontSize: 11 }}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visible.length && (
            <div className="empty-search">暂无记账记录。可在上方用一句话智能记账或手工添加。</div>
          )}
        </div>
      </div>
    </>
  );
}
