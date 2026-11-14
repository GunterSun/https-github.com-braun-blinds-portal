"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  loadLocalList,
  saveLocalList,
  STORAGE_KEYS,
  type RetailItem,
  type SmartReminder,
  type WholesaleItem,
} from "./smart-agent-workspace";

// ==========================================
// 1. 数据类型定义：拍照画线 + 语音 + 手写测量记录
// ==========================================

export type DimensionLine = {
  id: string;
  x1: number; // 0..1 归一化坐标
  y1: number;
  x2: number;
  y2: number;
  label: string; // 如 "W: 152 1/2\"" 或 "H: 177\""
  color: string;
};

export type FreehandStroke = {
  id: string;
  color: string;
  width: number;
  points: Array<{ x: number; y: number }>; // 0..1 归一化坐标
};

export type TextPin = {
  id: string;
  x: number; // 0..1
  y: number;
  text: string;
  color: string;
};

export type PhotoMeasureRecord = {
  id: string;
  customer: string;
  phone: string;
  address: string;
  windowCode: string; // 如 W1, W2
  windowLocation: string; // 如 客厅主窗 / 主卧 / 挑高大窗
  widthRaw: string; // 如 152 1/2
  heightRaw: string; // 如 177
  depthRaw: string; // 如 3 1/2
  finishedWidthNote: string; // 加工宽度建议（如推拉门+10"）
  finishedHeightNote: string; // 加工高度建议（如扣80mm轨道+离地）
  productCategory: string; // 如 双层布帘+纱 / 卷帘 / 斑马帘 / 编织木帘
  productModel: string; // 客户选定的具体型号/面料号，如 Yuma 1% Black / JL3601 / Group B
  mountType: "口内安装 (IM)" | "口外安装 (OM)" | "顶装 (Ceiling)";
  openOrControl: string; // 对开 / 单开 / 左控 / 右控 / 无拉绳
  motorOrTrack: string; // 手动 / NOVO高扭矩插电电机 / 黑色轨道 / 金色杆
  linerOrStyle: string; // 双韩褶 / 平折款 / 遮光衬 / 透光衬
  voiceTranscript: string; // 语音识别及手写备注汇总
  audioDataUrl?: string; // 现场原声录音 base64
  rawPhotoDataUrl: string; // 原始照片或底图
  annotatedPhotoDataUrl: string; // 合成画线、尺寸、手写与顶部信息栏后的成品图
  lines: DimensionLine[];
  strokes: FreehandStroke[];
  pins: TextPin[];
  createdAt: string;
};

export const PHOTO_MEASURE_STORAGE_KEY = "braun-photo-voice-measures-v1";

const QUICK_CUSTOMERS = [
  { name: "Ignacio (Purrfect Shutters)", phone: "+1 909-552-0455", address: "680 W Byron Ct" },
  { name: "Jose", phone: "+1 310-484-4816", address: "" },
  { name: "李先生 (李度恒)", phone: "+1 213-770-3111", address: "" },
  { name: "Alex", phone: "+1 951-703-5046", address: "" },
];

const QUICK_LOCATIONS = [
  "客厅主窗 (Living Room)",
  "挑高大窗 (High Ceiling)",
  "推拉门 (Sliding Door)",
  "主卧 (Master Bedroom)",
  "次卧 1 (Guest Room 1)",
  "次卧 2 (Guest Room 2)",
  "餐厅 (Dining Room)",
  "厨房 (Kitchen)",
  "书房/办公室 (Office)",
  "楼梯/半圆窗 (Arched/Stair)",
];

const PRODUCT_CATEGORIES = [
  "布艺窗帘 (Drapery)",
  "双层布帘+纱 (Double Layer)",
  "白纱透光帘 (White Sheer)",
  "卷帘 (Roller Shade)",
  "斑马帘 (Zebra Shade)",
  "罗马帘 (Roman Shade)",
  "竹帘/编织木帘 (Woven Wood)",
  "百叶窗 (Shutters)",
  "百叶帘 (Blinds)",
  "户外防风帘 (Windproof)",
];

const QUICK_MODELS: Record<string, string[]> = {
  "布艺窗帘 (Drapery)": ["Group B 面料 + 双韩褶", "Group A 基础布料", "遮光定制绒布", "亚麻肌理布帘"],
  "双层布帘+纱 (Double Layer)": ["Group B 布帘 + White Sheer 白纱", "全遮光布 + 透光金刚纱", "双轨电动布+纱"],
  "白纱透光帘 (White Sheer)": ["White Sheer Light-Filtering (整墙)", "White Sheer (左右装饰假帘 30\")"],
  "卷帘 (Roller Shade)": ["Yuma 1% Black (黑色透景)", "Yuma 5% Black", "JL1806 迷宫全遮光", "JL3601 阳光面料", "Stella 系列 (+侧轨挡光条)"],
  "斑马帘 (Zebra Shade)": ["无拉绳斑马帘 (Cordless Zebra)", "ML-1801 遮光斑马帘", "方形包布罩壳斑马帘"],
  "罗马帘 (Roman Shade)": ["标准平折罗马帘 (Flat Fold)", "贴墙款定制罗马帘 ($10/inch起)", "全遮光衬罗马帘"],
  "竹帘/编织木帘 (Woven Wood)": ["编织木帘+薄透光衬+无绳 ($10/sq.ft)", "编织木帘+遮光衬 (+10%)", "平折电动编织木帘"],
  "百叶窗 (Shutters)": ["3.5\" 椴木百叶窗 (Basswood)", "PVC 防水百叶窗", "隐形拉杆 (Hidden Tilt)"],
  "百叶帘 (Blinds)": ["2\" 仿木百叶帘 (Faux Wood)", "铝合金百叶帘"],
  "户外防风帘 (Windproof)": ["户外电动防风卷帘 (6-8周交期)", "重型拉链防风轨"],
};

const FRACTIONS = ["1/8", "1/4", "3/8", "1/2", "5/8", "3/4", "7/8", "1/16", "3/16", "5/16", "7/16", "9/16", "11/16", "13/16", "15/16"];

const PEN_COLORS = [
  { name: "工程黄", value: "#facc15" },
  { name: "醒目红", value: "#ef4444" },
  { name: "荧光绿", value: "#22c55e" },
  { name: "纯白", value: "#ffffff" },
  { name: "深蓝墨", value: "#0f172a" },
];

// ==========================================
// 2. 辅助函数：生成默认窗型底图 & 语音语义解析
// ==========================================

function createBlankWindowTemplateDataUrl(windowCode: string, location: string): string {
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // 背景网格
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // 绘制示意窗框
  const wx = 240,
    wy = 160,
    ww = 720,
    wh = 560;
  ctx.strokeStyle = "rgba(226, 232, 240, 0.7)";
  ctx.lineWidth = 6;
  ctx.strokeRect(wx, wy, ww, wh);

  // 内框与中梃虚线
  ctx.strokeStyle = "rgba(226, 232, 240, 0.35)";
  ctx.lineWidth = 3;
  ctx.strokeRect(wx + 24, wy + 24, ww - 48, wh - 48);
  ctx.beginPath();
  ctx.moveTo(wx + ww / 2, wy + 24);
  ctx.lineTo(wx + ww / 2, wy + wh - 24);
  ctx.moveTo(wx + 24, wy + wh / 2);
  ctx.lineTo(wx + ww - 24, wy + wh / 2);
  ctx.stroke();

  // 地面线与天花线
  ctx.setLineDash([12, 8]);
  ctx.strokeStyle = "rgba(250, 204, 21, 0.45)";
  ctx.beginPath();
  ctx.moveTo(100, 90);
  ctx.lineTo(1100, 90);
  ctx.moveTo(100, 810);
  ctx.lineTo(1100, 810);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "rgba(226, 232, 240, 0.7)";
  ctx.font = "bold 24px sans-serif";
  ctx.fillText(`窗位草图画布 · ${windowCode} (${location}) — 可直接画尺寸线或手写标注`, 240, 130);
  ctx.font = "18px sans-serif";
  ctx.fillStyle = "rgba(250, 204, 21, 0.75)";
  ctx.fillText("天花线 Ceiling", 110, 80);
  ctx.fillText("地面线 Floor", 110, 800);

  return canvas.toDataURL("image/jpeg", 0.9);
}

/**
 * 解析中文/英文语音转写文本中的宽高尺寸、窗位、产品型号、安装方式
 */
function parseVoiceMeasureText(text: string): {
  width?: string;
  height?: string;
  depth?: string;
  location?: string;
  category?: string;
  model?: string;
  mount?: "口内安装 (IM)" | "口外安装 (OM)" | "顶装 (Ceiling)";
  control?: string;
  motor?: string;
  style?: string;
} {
  const result: ReturnType<typeof parseVoiceMeasureText> = {};
  const normalized = text
    .replace(/又十六分之(\d+)/g, " $1/16")
    .replace(/又八分之(\d+)/g, " $1/8")
    .replace(/又四分之(\d+)/g, " $1/4")
    .replace(/又二分之一|半/g, " 1/2");

  // 识别宽与高
  const wMatch = normalized.match(/(?:宽|width|w)\s*[:：是]?\s*(\d+(?:\s+\d+\/\d+|\.\d+)?)/i);
  const hMatch = normalized.match(/(?:高|height|h)\s*[:：是]?\s*(\d+(?:\s+\d+\/\d+|\.\d+)?)/i);
  const dMatch = normalized.match(/(?:深|depth|d)\s*[:：是]?\s*(\d+(?:\s+\d+\/\d+|\.\d+)?)/i);
  const byMatch = normalized.match(/(\d+(?:\s+\d+\/\d+|\.\d+)?)\s*(?:×|x|by|乘)\s*(\d+(?:\s+\d+\/\d+|\.\d+)?)/i);

  if (wMatch) result.width = wMatch[1].trim();
  if (hMatch) result.height = hMatch[1].trim();
  if (dMatch) result.depth = dMatch[1].trim();
  if (!result.width && !result.height && byMatch) {
    result.width = byMatch[1].trim();
    result.height = byMatch[2].trim();
  }

  // 识别窗位
  if (/客厅|living/i.test(text)) result.location = "客厅主窗 (Living Room)";
  else if (/挑高|high ceiling/i.test(text)) result.location = "挑高大窗 (High Ceiling)";
  else if (/推拉门|sliding/i.test(text)) result.location = "推拉门 (Sliding Door)";
  else if (/主卧|master/i.test(text)) result.location = "主卧 (Master Bedroom)";
  else if (/次卧|guest|bedroom/i.test(text)) result.location = "次卧 1 (Guest Room 1)";
  else if (/餐厅|dining/i.test(text)) result.location = "餐厅 (Dining Room)";
  else if (/厨房|kitchen/i.test(text)) result.location = "厨房 (Kitchen)";
  else if (/书房|office/i.test(text)) result.location = "书房/办公室 (Office)";

  // 识别产品品类
  if (/双层|纱加布|布加纱|double layer/i.test(text)) result.category = "双层布帘+纱 (Double Layer)";
  else if (/白纱|纱帘|sheer/i.test(text)) result.category = "白纱透光帘 (White Sheer)";
  else if (/布帘|窗帘|drapery|curtain/i.test(text)) result.category = "布艺窗帘 (Drapery)";
  else if (/斑马|zebra/i.test(text)) result.category = "斑马帘 (Zebra Shade)";
  else if (/竹帘|编织|woven|bamboo/i.test(text)) result.category = "竹帘/编织木帘 (Woven Wood)";
  else if (/罗马|roman/i.test(text)) result.category = "罗马帘 (Roman Shade)";
  else if (/卷帘|roller/i.test(text)) result.category = "卷帘 (Roller Shade)";
  else if (/百叶窗|shutter/i.test(text)) result.category = "百叶窗 (Shutters)";
  else if (/防风|windproof/i.test(text)) result.category = "户外防风帘 (Windproof)";

  // 识别具体型号
  const codeMatch = text.match(/\b(Yuma\s*[15]%|JL\d+|ML-?\d+|Group\s*[ABC]|Stella)\b/i);
  if (codeMatch) result.model = codeMatch[1];

  // 安装方式
  if (/口外|框外|外装|outside|\bom\b/i.test(text)) result.mount = "口外安装 (OM)";
  else if (/口内|框内|内装|inside|\bim\b/i.test(text)) result.mount = "口内安装 (IM)";
  else if (/顶装|天花|ceiling/i.test(text)) result.mount = "顶装 (Ceiling)";

  // 控制与电机
  if (/对开|双开|center split/i.test(text)) result.control = "对开 (Center Split)";
  else if (/单开|one-way/i.test(text)) result.control = "单开 (One-way)";
  else if (/左控|left/i.test(text)) result.control = "左控 (Left)";
  else if (/右控|right/i.test(text)) result.control = "右控 (Right)";
  else if (/无绳|无拉绳|cordless/i.test(text)) result.control = "无拉绳 (Cordless)";

  if (/插电电机|高扭矩|hardwired/i.test(text)) result.motor = "NOVO Q1-3E-1.3 高扭矩插电电机";
  else if (/电池电机|锂电池|battery/i.test(text)) result.motor = "NOVO Q1-4E-1.2 锂电池电机";
  else if (/电动|电机|motor/i.test(text)) result.motor = "NOVO Q1-3E-1.3 高扭矩插电电机";
  else if (/黑杆|黑色轨道|black rod|black track/i.test(text)) result.motor = "手动 · 黑色轨道/窗帘杆";
  else if (/金杆|金色|gold rod/i.test(text)) result.motor = "手动 · 金色窗帘杆";

  // 褶皱与衬布
  const styleParts: string[] = [];
  if (/双韩褶|double pinch/i.test(text)) styleParts.push("双韩褶");
  if (/平折|flat fold/i.test(text)) styleParts.push("标准平折款");
  if (/全遮光|遮光衬|blackout/i.test(text)) styleParts.push("加遮光衬");
  else if (/透光衬|light.?filter/i.test(text)) styleParts.push("薄透光衬");
  if (styleParts.length > 0) result.style = styleParts.join(" + ");

  return result;
}

// ==========================================
// 3. 主组件：手机/平板拍照画线 + 语音 + 手写测量 App
// ==========================================

export function PhotoVoiceMeasureApp({
  notify,
  go,
  standalone = false,
}: {
  notify?: (msg: string) => void;
  go?: (page: string) => void;
  standalone?: boolean;
}) {
  const [records, setRecords] = useState<PhotoMeasureRecord[]>(() =>
    loadLocalList<PhotoMeasureRecord>(PHOTO_MEASURE_STORAGE_KEY)
  );
  const [toastMsg, setToastMsg] = useState("");
  const showMsg = (m: string) => {
    if (notify) notify(m);
    setToastMsg(m);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // 1. 客户与窗位置状态
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [windowCode, setWindowCode] = useState("W1");
  const [windowLocation, setWindowLocation] = useState("客厅主窗 (Living Room)");

  // 2. 尺寸与产品型号状态
  const [widthRaw, setWidthRaw] = useState("");
  const [heightRaw, setHeightRaw] = useState("");
  const [depthRaw, setDepthRaw] = useState("");
  const [activeDimField, setActiveDimField] = useState<"width" | "height" | "depth">("width");

  const [productCategory, setProductCategory] = useState("双层布帘+纱 (Double Layer)");
  const [productModel, setProductModel] = useState("Group B 布帘 + White Sheer 白纱");
  const [mountType, setMountType] = useState<PhotoMeasureRecord["mountType"]>("口外安装 (OM)");
  const [openOrControl, setOpenOrControl] = useState("对开 (Center Split)");
  const [motorOrTrack, setMotorOrTrack] = useState("手动 · 黑色轨道/窗帘杆");
  const [linerOrStyle, setLinerOrStyle] = useState("双韩褶 + 遮光衬");
  const [addTenInchRule, setAddTenInchRule] = useState(false);

  // 3. 照片与画布标注状态
  const [rawPhoto, setRawPhoto] = useState<string>("");
  const [toolMode, setToolMode] = useState<"line" | "pen" | "pin">("line");
  const [penColor, setPenColor] = useState("#facc15");
  const [penWidth, setPenWidth] = useState(4);
  const [lines, setLines] = useState<DimensionLine[]>([]);
  const [strokes, setStrokes] = useState<FreehandStroke[]>([]);
  const [pins, setPins] = useState<TextPin[]>([]);

  // 正在绘制的临时状态
  const [draftLine, setDraftLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [draftStroke, setDraftStroke] = useState<Array<{ x: number; y: number }> | null>(null);
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [editingLineText, setEditingLineText] = useState("");

  // 4. 语音输入与手写速记板状态
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceLang, setVoiceLang] = useState<"zh-CN" | "en-US">("zh-CN");
  const [isListening, setIsListening] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioDataUrl, setAudioDataUrl] = useState<string | undefined>(undefined);
  const [previewRecord, setPreviewRecord] = useState<PhotoMeasureRecord | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 初始化默认底图
  useEffect(() => {
    if (!rawPhoto) {
      setRawPhoto(createBlankWindowTemplateDataUrl("W1", "客厅主窗 (Living Room)"));
    }
  }, [rawPhoto]);

  // 当底图或标注变化时，重绘画布
  useEffect(() => {
    if (!rawPhoto) return;
    const img = new Image();
    img.onload = () => {
      imageObjRef.current = img;
      renderCanvas();
    };
    img.src = rawPhoto;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawPhoto]);

  useEffect(() => {
    renderCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines, strokes, pins, draftLine, draftStroke, customer, windowCode, windowLocation, productCategory, productModel, widthRaw, heightRaw]);

  // 智能计算成品宽高建议（遵循博朗知识库规则）
  const finishedWidthNote = (() => {
    const wNum = parseFloat(widthRaw);
    if (!wNum) return "待输入实测宽";
    if (addTenInchRule) {
      return `实测 ${widthRaw}" + 外延 10" = 建议成品宽 ${wNum + 10}"`;
    }
    if (mountType === "口内安装 (IM)" && (productCategory.includes("卷帘") || productCategory.includes("斑马帘"))) {
      return `内装建议扣减 1/8" ~ 1/4"（实测 ${widthRaw}"）`;
    }
    return `按实测宽 ${widthRaw}" 制作`;
  })();

  const finishedHeightNote = (() => {
    const hNum = parseFloat(heightRaw);
    if (!hNum) return "待输入实测高";
    if (productCategory.includes("布帘") || productCategory.includes("纱")) {
      const deducted = Math.max(0, +(hNum - 3.15 - 1).toFixed(2));
      return `实测 ${heightRaw}" - 轨道80mm(3.15") - 离地1" ≈ 成品布高 ${deducted}"`;
    }
    return `按实测高 ${heightRaw}" 制作`;
  })();

  // 竹帘/编织木帘自动批发价预估（$10/sq.ft，最低 10.76 sq.ft）
  const wovenWoodEstimate = (() => {
    if (!productCategory.includes("编织木")) return null;
    const wNum = parseFloat(widthRaw) || 0;
    const hNum = parseFloat(heightRaw) || 0;
    if (!wNum || !hNum) return "编织木帘批发价：$10/sq.ft（每窗最低按 10.76 sq.ft 计费，遮光衬 +10%）";
    const sqft = Math.max(10.76, (wNum * hNum) / 144);
    const hasBlackout = linerOrStyle.includes("遮光");
    const price = sqft * 10 * (hasBlackout ? 1.1 : 1);
    return `计费面积 ${sqft.toFixed(2)} sq.ft × $10${hasBlackout ? " (+10%遮光衬)" : ""} = 预估批发价 $${price.toFixed(2)}（注：仅做平折款 Flat Fold）`;
  })();

  // ==========================================
  // 画布渲染引擎（绘制照片 + 顶部信息栏 + 手写笔迹 + 尺寸标尺线 + 标签）
  // ==========================================
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img) return;

    const targetW = 1200;
    const ratio = img.height / img.width || 0.75;
    const targetH = Math.round(Math.max(680, Math.min(1400, targetW * ratio)));
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. 绘制原图
    ctx.clearRect(0, 0, targetW, targetH);
    ctx.drawImage(img, 0, 0, targetW, targetH);

    // 2. 绘制顶部半透明工程水印信息栏（方便保存图片发给客户或工厂时一眼看清窗位与型号）
    ctx.fillStyle = "rgba(15, 23, 42, 0.78)";
    ctx.fillRect(0, 0, targetW, 68);
    ctx.fillStyle = "#facc15";
    ctx.font = "bold 24px sans-serif";
    const headerTitle = `${windowCode} · ${windowLocation}  |  客户: ${customer || "未填客户"}`;
    ctx.fillText(headerTitle, 20, 30);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "19px sans-serif";
    const subTitle = `型号: ${productCategory} (${productModel || "待选"}) · ${mountType} · ${openOrControl}  |  尺寸: W ${widthRaw || "—"}" × H ${heightRaw || "—"}"`;
    ctx.fillText(subTitle, 20, 56);

    // 3. 绘制所有手写涂鸦笔迹 (Freehand Strokes)
    const drawStroke = (pts: Array<{ x: number; y: number }>, color: string, width: number) => {
      if (pts.length < 2) return;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = width * 1.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.moveTo(pts[0].x * targetW, pts[0].y * targetH);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x * targetW, pts[i].y * targetH);
      }
      ctx.stroke();
      ctx.restore();
    };

    for (const s of strokes) {
      drawStroke(s.points, s.color, s.width);
    }
    if (draftStroke && draftStroke.length > 1) {
      drawStroke(draftStroke, penColor, penWidth);
    }

    // 4. 绘制双箭头尺寸标尺线 (Dimension Lines)
    const drawDimensionLine = (
      x1Norm: number,
      y1Norm: number,
      x2Norm: number,
      y2Norm: number,
      label: string,
      color: string
    ) => {
      const x1 = x1Norm * targetW;
      const y1 = y1Norm * targetH;
      const x2 = x2Norm * targetW;
      const y2 = y2Norm * targetH;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy);
      if (len < 10) return;

      const angle = Math.atan2(dy, dx);
      const headLen = 22;

      ctx.save();
      // 黑色外描边保底，任何亮暗背景都清晰可见
      ctx.strokeStyle = "rgba(0,0,0,0.75)";
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // 主尺寸线
      ctx.strokeStyle = color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // 两端垂直卡尺短线 (End ticks)
      const perpX = -Math.sin(angle) * 16;
      const perpY = Math.cos(angle) * 16;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x1 - perpX, y1 - perpY);
      ctx.lineTo(x1 + perpX, y1 + perpY);
      ctx.moveTo(x2 - perpX, y2 - perpY);
      ctx.lineTo(x2 + perpX, y2 + perpY);
      ctx.stroke();

      // 两端箭头
      const drawArrow = (px: number, py: number, dir: number) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - headLen * Math.cos(dir - Math.PI / 6), py - headLen * Math.sin(dir - Math.PI / 6));
        ctx.lineTo(px - headLen * Math.cos(dir + Math.PI / 6), py - headLen * Math.sin(dir + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      };
      drawArrow(x2, y2, angle);
      drawArrow(x1, y1, angle + Math.PI);

      // 中点尺寸胶囊标签
      if (label) {
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        ctx.font = "bold 26px sans-serif";
        const textWidth = ctx.measureText(label).width;
        const padX = 16;
        const boxW = textWidth + padX * 2;
        const boxH = 42;

        ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(mx - boxW / 2, my - boxH / 2, boxW, boxH, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, mx, my + 1);
      }
      ctx.restore();
    };

    for (const l of lines) {
      drawDimensionLine(l.x1, l.y1, l.x2, l.y2, l.label, l.color);
    }
    if (draftLine) {
      drawDimensionLine(draftLine.x1, draftLine.y1, draftLine.x2, draftLine.y2, "松手输入尺寸...", penColor);
    }

    // 5. 绘制点击式文字标签 (Text Pins)
    for (const p of pins) {
      const px = p.x * targetW;
      const py = p.y * targetH;
      ctx.save();
      ctx.font = "bold 22px sans-serif";
      const tw = ctx.measureText(p.text).width;
      const bw = tw + 24;
      const bh = 38;
      ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(px - bw / 2, py - bh / 2, bw, bh, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = p.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(p.text, px, py + 1);
      ctx.restore();
    }
  };

  // ==========================================
  // 画布触控与手写笔事件处理（支持手指 & Apple Pencil）
  // ==========================================
  const getNormalizedPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0.5, y: 0.5 };
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0.02, Math.min(0.98, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0.08, Math.min(0.98, (e.clientY - rect.top) / rect.height));
    return { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = getNormalizedPoint(e);

    // 如果点在已有尺寸线的中点附近（且处于画线模式），直接编辑该线尺寸
    if (toolMode === "line") {
      const clickedLine = lines.find((l) => {
        const mx = (l.x1 + l.x2) / 2;
        const my = (l.y1 + l.y2) / 2;
        return Math.hypot(pt.x - mx, pt.y - my) < 0.06;
      });
      if (clickedLine) {
        setEditingLineId(clickedLine.id);
        setEditingLineText(clickedLine.label);
        return;
      }
      setDraftLine({ x1: pt.x, y1: pt.y, x2: pt.x, y2: pt.y });
      return;
    }

    if (toolMode === "pen") {
      setDraftStroke([pt]);
      return;
    }

    if (toolMode === "pin") {
      const text = window.prompt("输入此处标注文字（例如：插座位置 / 避开把手 / 左控 / 加宽+10\"）：", "插座/障碍物");
      if (text && text.trim()) {
        setPins((prev) => [
          ...prev,
          { id: `PIN-${Date.now()}`, x: pt.x, y: pt.y, text: text.trim(), color: penColor },
        ]);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (toolMode === "line" && draftLine) {
      const pt = getNormalizedPoint(e);
      // 轻微水平/垂直磁吸辅助（方便单手画出笔直的宽高线）
      let x2 = pt.x;
      let y2 = pt.y;
      if (Math.abs(x2 - draftLine.x1) < 0.03) x2 = draftLine.x1;
      if (Math.abs(y2 - draftLine.y1) < 0.03) y2 = draftLine.y1;
      setDraftLine({ ...draftLine, x2, y2 });
      return;
    }

    if (toolMode === "pen" && draftStroke) {
      const pt = getNormalizedPoint(e);
      setDraftStroke([...draftStroke, pt]);
    }
  };

  const handlePointerUp = () => {
    if (toolMode === "line" && draftLine) {
      const dist = Math.hypot(draftLine.x2 - draftLine.x1, draftLine.y2 - draftLine.y1);
      if (dist > 0.04) {
        const isHorizontal = Math.abs(draftLine.x2 - draftLine.x1) >= Math.abs(draftLine.y2 - draftLine.y1);
        const defaultVal = isHorizontal
          ? widthRaw
            ? `W: ${widthRaw}"`
            : "W: "
          : heightRaw
          ? `H: ${heightRaw}"`
          : "H: ";
        const newId = `LINE-${Date.now()}`;
        const newLine: DimensionLine = {
          id: newId,
          x1: draftLine.x1,
          y1: draftLine.y1,
          x2: draftLine.x2,
          y2: draftLine.y2,
          label: defaultVal,
          color: penColor,
        };
        setLines((prev) => [...prev, newLine]);
        setEditingLineId(newId);
        setEditingLineText(defaultVal);
      }
      setDraftLine(null);
      return;
    }

    if (toolMode === "pen" && draftStroke) {
      if (draftStroke.length > 1) {
        setStrokes((prev) => [
          ...prev,
          { id: `STR-${Date.now()}`, color: penColor, width: penWidth, points: draftStroke },
        ]);
      }
      setDraftStroke(null);
    }
  };

  // 保存正在编辑的画线尺寸，并自动同步到下方宽高输入框
  const confirmLineLabel = () => {
    if (!editingLineId) return;
    const trimmed = editingLineText.trim() || "未标注";
    setLines((prev) => prev.map((l) => (l.id === editingLineId ? { ...l, label: trimmed } : l)));

    // 如果包含数字，自动填入对应的宽或高表单
    const numMatch = trimmed.match(/(\d+(?:\s+\d+\/\d+|\.\d+)?)/);
    if (numMatch) {
      const val = numMatch[1].trim();
      if (/^w|宽/i.test(trimmed)) setWidthRaw(val);
      else if (/^h|高/i.test(trimmed)) setHeightRaw(val);
      else if (/^d|深/i.test(trimmed)) setDepthRaw(val);
    }
    setEditingLineId(null);
  };

  // 一键在照片上生成标准宽（W）与高（H）标尺线
  const autoDrawWHLines = (wVal = widthRaw, hVal = heightRaw) => {
    const nextLines: DimensionLine[] = [...lines.filter((l) => !l.id.startsWith("AUTO-"))];
    if (wVal) {
      nextLines.push({
        id: "AUTO-W",
        x1: 0.22,
        y1: 0.24,
        x2: 0.78,
        y2: 0.24,
        label: `W: ${wVal}"`,
        color: "#facc15",
      });
    }
    if (hVal) {
      nextLines.push({
        id: "AUTO-H",
        x1: 0.82,
        y1: 0.22,
        x2: 0.82,
        y2: 0.84,
        label: `H: ${hVal}"`,
        color: "#22c55e",
      });
    }
    setLines(nextLines);
    showMsg("已在照片上自动生成宽/高尺寸标尺线（可直接拖动或点击修改）");
  };

  // 处理手机/平板拍照或相册上传（自动压缩到适合本地存储的高清尺寸）
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1400;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const off = document.createElement("canvas");
        off.width = w;
        off.height = h;
        const ctx = off.getContext("2d");
        ctx?.drawImage(img, 0, 0, w, h);
        const compressed = off.toDataURL("image/jpeg", 0.86);
        setRawPhoto(compressed);
        showMsg("现场窗户照片已载入，请在照片上拖动手指画线标注尺寸，或点击下方语音录入！");
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ==========================================
  // 语音识别 (Web Speech API) + 原声录音 (MediaRecorder)
  // ==========================================
  const toggleSpeechRecognition = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      showMsg("当前浏览器不支持实时语音转写，您可以使用右侧「录制原声语音条」或在输入框用手机键盘自带麦克风听写！");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = voiceLang;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      showMsg("🎤 正在聆听... 请说出窗位置、宽高尺寸和产品型号（例如：客厅主窗 宽152 高177 双层布帘）");
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0]?.transcript || "")
        .join(" ")
        .trim();
      if (transcript) {
        const combined = voiceTranscript ? `${voiceTranscript}；${transcript}` : transcript;
        setVoiceTranscript(combined);
        applyVoiceParsing(transcript);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const applyVoiceParsing = (textToParse: string) => {
    const parsed = parseVoiceMeasureText(textToParse);
    let updatedW = widthRaw;
    let updatedH = heightRaw;
    if (parsed.width) {
      setWidthRaw(parsed.width);
      updatedW = parsed.width;
    }
    if (parsed.height) {
      setHeightRaw(parsed.height);
      updatedH = parsed.height;
    }
    if (parsed.depth) setDepthRaw(parsed.depth);
    if (parsed.location) setWindowLocation(parsed.location);
    if (parsed.category) {
      setProductCategory(parsed.category);
      const defaultModels = QUICK_MODELS[parsed.category];
      if (defaultModels?.length && !parsed.model) setProductModel(defaultModels[0]);
    }
    if (parsed.model) setProductModel(parsed.model);
    if (parsed.mount) setMountType(parsed.mount);
    if (parsed.control) setOpenOrControl(parsed.control);
    if (parsed.motor) setMotorOrTrack(parsed.motor);
    if (parsed.style) setLinerOrStyle(parsed.style);

    if (parsed.width || parsed.height) {
      autoDrawWHLines(updatedW, updatedH);
    }
    showMsg("✦ 已从语音/手写内容自动提取尺寸与型号，并标注在照片上！");
  };

  const toggleAudioMemo = async () => {
    if (isRecordingAudio) {
      mediaRecorderRef.current?.stop();
      setIsRecordingAudio(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          setAudioDataUrl(reader.result as string);
          showMsg("🔊 现场原声语音备忘已保存！");
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingAudio(true);
      showMsg("🎙️ 正在录制现场原声语音备忘... 再次点击即可结束录音");
    } catch {
      showMsg("无法调用麦克风，请检查浏览器麦克风权限");
    }
  };

  // ==========================================
  // 保存当前窗位测量记录 & 同步至零售/批发订单
  // ==========================================
  const handleSaveWindow = (andNextWindow: boolean) => {
    if (!customer.trim()) {
      showMsg("请先填写或点选【客户姓名】");
      return;
    }
    if (!widthRaw.trim() && !heightRaw.trim() && lines.length === 0 && strokes.length === 0) {
      showMsg("请至少录入宽高尺寸，或在照片上画线/手写标注尺寸");
      return;
    }

    // 确保最新标注渲染到画布并导出合成图
    renderCanvas();
    const annotatedDataUrl = canvasRef.current?.toDataURL("image/jpeg", 0.88) || rawPhoto;

    const record: PhotoMeasureRecord = {
      id: `PM-${Date.now().toString().slice(-6)}`,
      customer: customer.trim(),
      phone: phone.trim(),
      address: address.trim(),
      windowCode: windowCode.trim() || `W${records.length + 1}`,
      windowLocation: windowLocation.trim() || "未命名窗位",
      widthRaw: widthRaw.trim(),
      heightRaw: heightRaw.trim(),
      depthRaw: depthRaw.trim(),
      finishedWidthNote,
      finishedHeightNote,
      productCategory,
      productModel: productModel.trim(),
      mountType,
      openOrControl,
      motorOrTrack,
      linerOrStyle,
      voiceTranscript: voiceTranscript.trim(),
      audioDataUrl,
      rawPhotoDataUrl: rawPhoto,
      annotatedPhotoDataUrl: annotatedDataUrl,
      lines,
      strokes,
      pins,
      createdAt: new Date().toLocaleString("zh-CN", { hour12: false }),
    };

    const next = [record, ...records];
    setRecords(next);
    saveLocalList(PHOTO_MEASURE_STORAGE_KEY, next);

    if (andNextWindow) {
      // 自动递增窗号 W1 -> W2，保留客户与产品偏好，重置画布准备拍下一扇窗
      const numMatch = windowCode.match(/(\d+)/);
      const nextNum = numMatch ? Number(numMatch[1]) + 1 : next.length + 1;
      const nextCode = `W${nextNum}`;
      setWindowCode(nextCode);
      setWidthRaw("");
      setHeightRaw("");
      setDepthRaw("");
      setLines([]);
      setStrokes([]);
      setPins([]);
      setVoiceTranscript("");
      setAudioDataUrl(undefined);
      setRawPhoto(createBlankWindowTemplateDataUrl(nextCode, windowLocation));
      showMsg(`✓ 已保存 ${record.windowCode}（${record.windowLocation}）！已自动切换到 ${nextCode}，可直接拍下一扇窗`);
    } else {
      showMsg(`✓ 已保存 ${record.customer} 的 ${record.windowCode}（${record.windowLocation}）拍照测量记录！`);
    }
  };

  // 将选中客户的全部窗位一键转入【零售定制管理】或【批发业务管理】
  const syncCustomerToOrder = (targetCustomer: string, mode: "retail" | "wholesale") => {
    const custRecords = records.filter((r) => r.customer === targetCustomer);
    if (!custRecords.length) return;
    const first = custRecords[0];

    const summaryLines = custRecords
      .slice()
      .reverse()
      .map(
        (r) =>
          `${r.windowCode}【${r.windowLocation}】: 实测 ${r.widthRaw || "?"}" W × ${r.heightRaw || "?"}" H${
            r.depthRaw ? ` × 深${r.depthRaw}"` : ""
          } | ${r.productCategory} (${r.productModel}) | ${r.mountType} · ${r.openOrControl} · ${r.motorOrTrack} · ${
            r.linerOrStyle
          }${r.voiceTranscript ? ` | 备注:${r.voiceTranscript}` : ""}`
      )
      .join("\n");

    const now = new Date().toLocaleString("zh-CN", { hour12: false });

    if (mode === "retail") {
      const retailList = loadLocalList<RetailItem>(STORAGE_KEYS.retail);
      const newRetail: RetailItem = {
        id: `RT-${Date.now().toString().slice(-6)}`,
        customer: first.customer,
        phone: first.phone,
        address: first.address,
        measureTime: now,
        measureNotes: summaryLines,
        selectedProducts: Array.from(new Set(custRecords.map((r) => `${r.productCategory} (${r.productModel})`))).join("；"),
        quoteUsd: 0,
        depositUsd: 0,
        totalPaidUsd: 0,
        paymentMethod: "Zelle",
        factoryName: "待定",
        factoryOrderNo: "",
        factoryCostCurrency: "RMB",
        factoryCost: 0,
        installTime: "待定",
        stage: "已测量待选品报价",
        createdAt: now,
        updatedAt: now,
      };
      saveLocalList(STORAGE_KEYS.retail, [newRetail, ...retailList]);

      // 同时加入今日报价提醒
      const reminders = loadLocalList<SmartReminder>(STORAGE_KEYS.reminders);
      reminders.unshift({
        id: `REM-${Date.now().toString().slice(-6)}`,
        dueTime: "今晚 20:00",
        category: "日常待办",
        title: `核算并发送报价单：${first.customer}（共 ${custRecords.length} 扇窗已拍照测量）`,
        detail: summaryLines,
        relatedId: newRetail.id,
        priority: "紧急",
        done: false,
      });
      saveLocalList(STORAGE_KEYS.reminders, reminders);

      showMsg(`已将 ${first.customer} 的 ${custRecords.length} 个窗位测量单转入【零售定制管理】！`);
      if (go) go("零售定制管理");
    } else {
      const wholesaleList = loadLocalList<WholesaleItem>(STORAGE_KEYS.wholesale);
      const newWholesale: WholesaleItem = {
        id: `WS-${Date.now().toString().slice(-6)}`,
        customer: first.customer,
        phone: first.phone,
        rawSpec: summaryLines,
        parsedSummary: `${custRecords.length} 个窗位拍照测量明细`,
        detailNotes: Array.from(new Set(custRecords.map((r) => `${r.mountType} / ${r.openOrControl} / ${r.linerOrStyle}`))).join("；"),
        quoteUsd: 0,
        paidUsd: 0,
        paymentMethod: "Zelle",
        factoryName: "国内工厂",
        factoryOrderNo: "",
        factoryCostCurrency: "RMB",
        factoryCost: 0,
        deliveryMode: "我去安装",
        installAddress: first.address,
        stage: "待报价标注",
        createdAt: now,
        updatedAt: now,
      };
      saveLocalList(STORAGE_KEYS.wholesale, [newWholesale, ...wholesaleList]);
      showMsg(`已将 ${first.customer} 的 ${custRecords.length} 个窗位转入【批发业务管理】！`);
      if (go) go("批发业务管理");
    }
  };

  // 追加分数到当前聚焦的尺寸输入框
  const appendFraction = (frac: string) => {
    if (activeDimField === "width") {
      const base = widthRaw.replace(/\s+\d+\/\d+$/, "").trim();
      setWidthRaw(base ? `${base} ${frac}` : frac);
    } else if (activeDimField === "height") {
      const base = heightRaw.replace(/\s+\d+\/\d+$/, "").trim();
      setHeightRaw(base ? `${base} ${frac}` : frac);
    } else {
      const base = depthRaw.replace(/\s+\d+\/\d+$/, "").trim();
      setDepthRaw(base ? `${base} ${frac}` : frac);
    }
  };

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 40 }}>
      {/* 顶部标题栏（支持在手机/平板全屏打开） */}
      <div
        className="module-head"
        style={{
          background: "#153f34",
          color: "#fff",
          padding: "18px 22px",
          borderRadius: 18,
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <span style={{ color: "#e5c168", fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>
            MOBILE & TABLET FIELD MEASURE APP · 拍照画线 + 语音 + 手写录入
          </span>
          <h1 style={{ margin: "4px 0", fontSize: 24, color: "#fff" }}>
            📱 现场拍照画线测量工作台
          </h1>
          <p style={{ margin: 0, color: "#cbdcd6", fontSize: 13 }}>
            支持手机/平板直接拍照 ➔ 手指或触控笔画线标尺寸/手写涂鸦 ➔ 语音自动识别宽高与客户所选产品型号。
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {!standalone ? (
            <a
              href="/photo-measure"
              target="_blank"
              rel="noreferrer"
              style={{
                background: "#e5c168",
                color: "#153f34",
                padding: "10px 14px",
                borderRadius: 10,
                fontWeight: 800,
                textDecoration: "none",
                fontSize: 13,
              }}
            >
              📲 手机/平板全屏 App 模式打开 ↗
            </a>
          ) : (
            <a
              href="/"
              style={{
                background: "#e5c168",
                color: "#153f34",
                padding: "10px 14px",
                borderRadius: 10,
                fontWeight: 800,
                textDecoration: "none",
                fontSize: 13,
              }}
            >
              ← 返回博朗主工作台
            </a>
          )}
        </div>
      </div>

      {toastMsg && (
        <div
          style={{
            marginBottom: 14,
            padding: "12px 16px",
            borderRadius: 12,
            background: "#e6f4ed",
            border: "1px solid #2e705d",
            color: "#153f34",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* 第一步：录入客户与窗位置 */}
      <section className="panel" style={{ marginBottom: 16, padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          <h2 style={{ margin: 0, fontSize: 17 }}>① 客户信息与窗户位置</h2>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#64748b" }}>老客户快选：</span>
            {QUICK_CUSTOMERS.map((c) => (
              <button
                key={c.name}
                type="button"
                className="secondary"
                style={{ padding: "4px 10px", fontSize: 12 }}
                onClick={() => {
                  setCustomer(c.name);
                  setPhone(c.phone);
                  if (c.address) setAddress(c.address);
                }}
              >
                {c.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700 }}>
            客户姓名 / 公司 *
            <input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="例如：Ignacio / 李先生 / 王女士"
              style={{ padding: "10px 12px", borderRadius: 9, border: "1px solid #cbd5cf", fontSize: 15 }}
            />
          </label>
          <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700 }}>
            联系电话
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 909-xxx-xxxx"
              style={{ padding: "10px 12px", borderRadius: 9, border: "1px solid #cbd5cf", fontSize: 15 }}
            />
          </label>
          <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700 }}>
            测量/安装地址
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="例如：680 W Byron Ct"
              style={{ padding: "10px 12px", borderRadius: 9, border: "1px solid #cbd5cf", fontSize: 15 }}
            />
          </label>
          <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700 }}>
            窗位编号 (自动递增)
            <input
              value={windowCode}
              onChange={(e) => setWindowCode(e.target.value)}
              placeholder="W1 / W2"
              style={{ padding: "10px 12px", borderRadius: 9, border: "1px solid #cbd5cf", fontSize: 15, fontWeight: 800, color: "#153f34" }}
            />
          </label>
          <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700 }}>
            窗户所在位置 / 房间 *
            <input
              value={windowLocation}
              onChange={(e) => setWindowLocation(e.target.value)}
              placeholder="如：客厅主窗 / 主卧"
              style={{ padding: "10px 12px", borderRadius: 9, border: "1px solid #cbd5cf", fontSize: 15 }}
            />
          </label>
        </div>

        {/* 常用窗位一键快选芯片 */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>常用窗位置快选：</span>
          {QUICK_LOCATIONS.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setWindowLocation(loc)}
              style={{
                padding: "6px 11px",
                borderRadius: 999,
                border: windowLocation === loc ? "2px solid #153f34" : "1px solid #cbd5cf",
                background: windowLocation === loc ? "#e6f4ed" : "#f8faf9",
                color: "#153f34",
                fontSize: 12,
                fontWeight: windowLocation === loc ? 800 : 600,
                cursor: "pointer",
              }}
            >
              {loc}
            </button>
          ))}
        </div>
      </section>

      {/* 主操作区：左侧拍照画线/手写画布 + 右侧语音/手写与产品型号录入 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* 左侧：拍照 + 画线标尺寸 + 手写涂鸦画布 */}
        <section className="panel" style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 17 }}>② 拍照 · 画线标注尺寸 · 手写圈注</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <label
                style={{
                  background: "#1d654e",
                  color: "#fff",
                  padding: "9px 14px",
                  borderRadius: 10,
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                📷 拍照现场窗户
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  style={{ display: "none" }}
                />
              </label>
              <label
                style={{
                  background: "#edf3ef",
                  color: "#153f34",
                  padding: "9px 12px",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                🖼️ 相册选图
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />
              </label>
              <button
                type="button"
                className="secondary"
                style={{ padding: "8px 10px", fontSize: 12 }}
                onClick={() => {
                  setLines([]);
                  setStrokes([]);
                  setPins([]);
                  setRawPhoto(createBlankWindowTemplateDataUrl(windowCode, windowLocation));
                }}
              >
                🪟 空白窗型纸
              </button>
            </div>
          </div>

          {/* 画布工具栏：画尺寸线 / 手写笔 / 贴标签 / 颜色 / 撤销 */}
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
              padding: "10px 12px",
              background: "#f1f5f3",
              borderRadius: 12,
              marginBottom: 10,
            }}
          >
            <button
              type="button"
              onClick={() => setToolMode("line")}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                background: toolMode === "line" ? "#153f34" : "#fff",
                color: toolMode === "line" ? "#fff" : "#153f34",
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              📏 画尺寸线
            </button>
            <button
              type="button"
              onClick={() => setToolMode("pen")}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                background: toolMode === "pen" ? "#153f34" : "#fff",
                color: toolMode === "pen" ? "#fff" : "#153f34",
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              ✍️ 手写笔涂鸦
            </button>
            <button
              type="button"
              onClick={() => setToolMode("pin")}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                background: toolMode === "pin" ? "#153f34" : "#fff",
                color: toolMode === "pin" ? "#fff" : "#153f34",
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              🏷️ 点图贴字
            </button>

            <div style={{ display: "flex", gap: 5, alignItems: "center", marginLeft: 4 }}>
              {PEN_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.name}
                  onClick={() => setPenColor(c.value)}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: c.value,
                    border: penColor === c.value ? "3px solid #153f34" : "1px solid #94a3b8",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>

            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              <button
                type="button"
                className="secondary"
                style={{ padding: "6px 10px", fontSize: 12 }}
                onClick={() => autoDrawWHLines()}
              >
                ⚡ 自动标出宽高线
              </button>
              <button
                type="button"
                className="secondary"
                style={{ padding: "6px 10px", fontSize: 12 }}
                onClick={() => {
                  if (toolMode === "pen" && strokes.length) setStrokes((s) => s.slice(0, -1));
                  else if (lines.length) setLines((l) => l.slice(0, -1));
                  else if (strokes.length) setStrokes((s) => s.slice(0, -1));
                  else if (pins.length) setPins((p) => p.slice(0, -1));
                }}
              >
                ↶ 撤销
              </button>
              <button
                type="button"
                className="secondary"
                style={{ padding: "6px 10px", fontSize: 12 }}
                onClick={() => {
                  setLines([]);
                  setStrokes([]);
                  setPins([]);
                }}
              >
                清空标注
              </button>
            </div>
          </div>

          {/* 正在编辑某条尺寸线时的悬浮快捷尺寸条 */}
          {editingLineId && (
            <div
              style={{
                padding: 12,
                marginBottom: 10,
                borderRadius: 12,
                background: "#fffbeb",
                border: "2px solid #f59e0b",
                display: "grid",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <strong style={{ fontSize: 13, color: "#92400e" }}>📏 输入该标尺线尺寸：</strong>
                <input
                  autoFocus
                  value={editingLineText}
                  onChange={(e) => setEditingLineText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && confirmLineLabel()}
                  placeholder="例如：W: 72 1/2&quot; 或 H: 96&quot;"
                  style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid #f59e0b", fontSize: 15, fontWeight: 700 }}
                />
                <button type="button" className="primary" onClick={confirmLineLabel} style={{ padding: "8px 14px" }}>
                  确定标注 ✓
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    setLines((prev) => prev.filter((l) => l.id !== editingLineId));
                    setEditingLineId(null);
                  }}
                  style={{ padding: "8px 10px" }}
                >
                  删除此线
                </button>
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                <small style={{ color: "#92400e", fontWeight: 700 }}>快捷分数：</small>
                {["W: ", "H: ", "D: ", "离地: ", ...FRACTIONS.slice(0, 7)].map((token) => (
                  <button
                    key={token}
                    type="button"
                    onClick={() =>
                      setEditingLineText((prev) =>
                        token.endsWith(": ") ? token : `${prev.trim()} ${token}"`
                      )
                    }
                    style={{
                      padding: "4px 8px",
                      borderRadius: 6,
                      border: "1px solid #fcd34d",
                      background: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {token}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 交互式触控画布（禁止触摸滚动，确保手指和 Apple Pencil 画线流畅） */}
          <div
            style={{
              position: "relative",
              borderRadius: 14,
              overflow: "hidden",
              border: "2px solid #153f34",
              background: "#0f172a",
              touchAction: "none",
              userSelect: "none",
            }}
          >
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                cursor: toolMode === "line" ? "crosshair" : toolMode === "pen" ? "Default" : "pointer",
                touchAction: "none",
              }}
            />
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "#64748b" }}>
            💡 提示：在【📏 画尺寸线】模式下，手指按住照片从窗户一端拖到另一端即可画出带双箭头的标尺线；切换到【✍️ 手写笔涂鸦】可用手指或电容笔直接在照片上手写尺寸、画开合箭头。
          </p>
        </section>

        {/* 右侧：语音+手写录入 + 精确尺寸 + 客户选品型号 */}
        <div style={{ display: "grid", gap: 16 }}>
          {/* 模块 A：拍照后语音 + 手写速记区 */}
          <section className="panel" style={{ padding: 16, background: "#f7faf8", border: "1px solid #bdd5c8" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, color: "#153f34" }}>③ 语音 + 手写速记（自动填单 & 标图）</h2>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#52635b" }}>
                  拍完照直接说话或用 Apple Pencil 手写输入，自动提取宽高、安装方式与产品型号。
                </p>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <select
                  value={voiceLang}
                  onChange={(e) => setVoiceLang(e.target.value as "zh-CN" | "en-US")}
                  style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #cbd5cf", fontSize: 12 }}
                >
                  <option value="zh-CN">中文语音</option>
                  <option value="en-US">English Voice</option>
                </select>
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 9,
                    border: "none",
                    background: isListening ? "#dc2626" : "#153f34",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {isListening ? "⏹ 停止语音识别..." : "🎤 点此说话转尺寸"}
                </button>
                <button
                  type="button"
                  onClick={toggleAudioMemo}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 9,
                    border: "1px solid #153f34",
                    background: isRecordingAudio ? "#fef2f2" : "#fff",
                    color: isRecordingAudio ? "#dc2626" : "#153f34",
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {isRecordingAudio ? "⏹ 结束原声录音" : "🎙️ 录原声备忘"}
                </button>
              </div>
            </div>

            <textarea
              rows={3}
              value={voiceTranscript}
              onChange={(e) => setVoiceTranscript(e.target.value)}
              placeholder="点击上方【🎤 点此说话转尺寸】，或在此处用 iPad Apple Pencil 随手写 / 手机键盘语音输入：&#10;例如：“客厅大窗 宽 152 1/2 高 177 双层布帘 Group B 口外安装 对开 黑色轨道”"
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #9ab8a8",
                fontSize: 14,
                lineHeight: 1.5,
                background: "#fff",
              }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              <button
                type="button"
                className="secondary"
                onClick={() => applyVoiceParsing(voiceTranscript)}
                style={{ fontSize: 12, padding: "6px 12px" }}
              >
                ✦ 解析上方文字并自动填入尺寸/型号 + 标到照片上
              </button>
              {audioDataUrl && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#153f34" }}>已录原声：</span>
                  <audio controls src={audioDataUrl} style={{ height: 30, maxWidth: 200 }} />
                </div>
              )}
            </div>
          </section>

          {/* 模块 B：宽高尺寸与快捷分数键盘 */}
          <section className="panel" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h2 style={{ margin: 0, fontSize: 17 }}>④ 窗户实测尺寸（英寸 Inches）</h2>
              <button
                type="button"
                className="secondary"
                style={{ padding: "5px 10px", fontSize: 12 }}
                onClick={() => autoDrawWHLines()}
              >
                📏 将宽高同步画到照片上
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
              <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 800 }}>
                实测宽 Width (in) *
                <input
                  value={widthRaw}
                  onFocus={() => setActiveDimField("width")}
                  onChange={(e) => setWidthRaw(e.target.value)}
                  placeholder="如 152 1/2"
                  style={{
                    padding: "11px 12px",
                    borderRadius: 9,
                    border: activeDimField === "width" ? "2px solid #153f34" : "1px solid #cbd5cf",
                    fontSize: 17,
                    fontWeight: 800,
                  }}
                />
              </label>
              <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 800 }}>
                实测高 Height (in) *
                <input
                  value={heightRaw}
                  onFocus={() => setActiveDimField("height")}
                  onChange={(e) => setHeightRaw(e.target.value)}
                  placeholder="如 177"
                  style={{
                    padding: "11px 12px",
                    borderRadius: 9,
                    border: activeDimField === "height" ? "2px solid #153f34" : "1px solid #cbd5cf",
                    fontSize: 17,
                    fontWeight: 800,
                  }}
                />
              </label>
              <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 800 }}>
                窗框深 Depth (选填)
                <input
                  value={depthRaw}
                  onFocus={() => setActiveDimField("depth")}
                  onChange={(e) => setDepthRaw(e.target.value)}
                  placeholder="如 3 1/2"
                  style={{
                    padding: "11px 12px",
                    borderRadius: 9,
                    border: activeDimField === "depth" ? "2px solid #153f34" : "1px solid #cbd5cf",
                    fontSize: 16,
                  }}
                />
              </label>
            </div>

            {/* 英寸分数快捷输入条（现场单手点按免打斜杠） */}
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>
                点选分数（加入{activeDimField === "width" ? "宽度" : activeDimField === "height" ? "高度" : "深度"}）：
              </span>
              {FRACTIONS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => appendFraction(f)}
                  style={{
                    padding: "5px 9px",
                    borderRadius: 7,
                    border: "1px solid #cbd5cf",
                    background: "#f8faf9",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  +{f}
                </button>
              ))}
            </div>

            {/* 博朗智能工艺扣减/外延核算栏 */}
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                background: "#fffbeb",
                border: "1px solid #fde68a",
                fontSize: 12,
                color: "#78350f",
                display: "grid",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                <span>
                  <b>📐 智能尺寸核算：</b> {finishedWidthNote} ｜ {finishedHeightNote}
                </span>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer", fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={addTenInchRule}
                    onChange={(e) => setAddTenInchRule(e.target.checked)}
                    style={{ width: 16, height: 16 }}
                  />
                  推拉门/框外宽度 +10&quot;
                </label>
              </div>
              {wovenWoodEstimate && <div style={{ color: "#153f34", fontWeight: 700 }}>🎋 {wovenWoodEstimate}</div>}
            </div>
          </section>

          {/* 模块 C：客户选择产品与型号录入 */}
          <section className="panel" style={{ padding: 16 }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 17 }}>⑤ 客户选择产品型号与工艺要求</h2>

            {/* 产品大类芯片 */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {PRODUCT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setProductCategory(cat);
                    const models = QUICK_MODELS[cat];
                    if (models?.length) setProductModel(models[0]);
                    if (cat.includes("编织木")) setLinerOrStyle("标准平折款 (Flat Fold) + 薄透光衬");
                  }}
                  style={{
                    padding: "7px 11px",
                    borderRadius: 9,
                    border: productCategory === cat ? "2px solid #153f34" : "1px solid #cbd5cf",
                    background: productCategory === cat ? "#153f34" : "#fff",
                    color: productCategory === cat ? "#fff" : "#153f34",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700, gridColumn: "1 / -1" }}>
                客户选定的产品型号 / 面料色号 *
                <input
                  value={productModel}
                  onChange={(e) => setProductModel(e.target.value)}
                  placeholder="例如：Yuma 1% Black / JL3601 / Group B / White Sheer"
                  style={{ padding: "10px 12px", borderRadius: 9, border: "1px solid #cbd5cf", fontSize: 15, fontWeight: 700 }}
                />
              </label>

              {/* 当前大类下的常用型号一键点选 */}
              {QUICK_MODELS[productCategory] && (
                <div style={{ gridColumn: "1 / -1", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  <small style={{ color: "#64748b", fontWeight: 700 }}>常用型号点选：</small>
                  {QUICK_MODELS[productCategory].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setProductModel(m)}
                      style={{
                        padding: "4px 9px",
                        borderRadius: 6,
                        border: "1px solid #cbd5cf",
                        background: productModel === m ? "#e6f4ed" : "#f8faf9",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}

              <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700 }}>
                安装方式 (Mount)
                <select
                  value={mountType}
                  onChange={(e) => setMountType(e.target.value as PhotoMeasureRecord["mountType"])}
                  style={{ padding: "9px 10px", borderRadius: 9, border: "1px solid #cbd5cf", fontSize: 14 }}
                >
                  <option value="口外安装 (OM)">口外安装 (OM / Outside)</option>
                  <option value="口内安装 (IM)">口内安装 (IM / Inside)</option>
                  <option value="顶装 (Ceiling)">顶装 (Ceiling Mount)</option>
                </select>
              </label>

              <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700 }}>
                开合 / 控制方向
                <select
                  value={openOrControl}
                  onChange={(e) => setOpenOrControl(e.target.value)}
                  style={{ padding: "9px 10px", borderRadius: 9, border: "1px solid #cbd5cf", fontSize: 14 }}
                >
                  <option>对开 (Center Split)</option>
                  <option>单开 (One-way Draw)</option>
                  <option>无拉绳 (Cordless)</option>
                  <option>左控 (Left Control)</option>
                  <option>右控 (Right Control)</option>
                  <option>分项报价对比 (Itemized)</option>
                </select>
              </label>

              <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700 }}>
                轨道 / 窗帘杆 / 电机选型
                <select
                  value={motorOrTrack}
                  onChange={(e) => setMotorOrTrack(e.target.value)}
                  style={{ padding: "9px 10px", borderRadius: 9, border: "1px solid #cbd5cf", fontSize: 14 }}
                >
                  <option>手动 · 黑色轨道/窗帘杆 (Black Rod)</option>
                  <option>手动 · 金色窗帘杆 (Gold Rod)</option>
                  <option>手动 · 配卷帘边盖同色杆</option>
                  <option>手动 · 隐形静音轨</option>
                  <option>NOVO Q1-3E-1.3 高扭矩插电电机 (推荐)</option>
                  <option>NOVO Q1-4E-1.2 锂电池电机 (2200mAh)</option>
                  <option>奥科电动卷帘电机 + 15通道遥控</option>
                </select>
              </label>

              <label style={{ display: "grid", gap: 4, fontSize: 12, fontWeight: 700 }}>
                褶皱款式 / 衬布 / 附加配件
                <input
                  value={linerOrStyle}
                  onChange={(e) => setLinerOrStyle(e.target.value)}
                  placeholder="如：双韩褶 + 遮光衬 / 平折款 / 侧轨挡光条"
                  style={{ padding: "9px 10px", borderRadius: 9, border: "1px solid #cbd5cf", fontSize: 14 }}
                />
              </label>
            </div>

            {/* 保存按钮组 */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
              <button
                type="button"
                className="primary"
                onClick={() => handleSaveWindow(true)}
                style={{ flex: 2, padding: "13px 16px", fontSize: 15, fontWeight: 800 }}
              >
                ✓ 保存此窗位并继续拍下一扇窗 (自动切到下一窗号)
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => handleSaveWindow(false)}
                style={{ flex: 1, padding: "13px 14px", fontSize: 14, fontWeight: 700 }}
              >
                仅保存当前窗位
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* 已保存的拍照测量画册与一键转订单 */}
      <section className="panel" style={{ marginTop: 20, padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>📋 已保存的现场拍照测量单 ({records.length} 扇窗)</h2>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#64748b" }}>
              点击任意标注照片可放大查看或下载合成图发给客户/工厂；支持按客户一键转入【零售定制】或【批发业务】。
            </p>
          </div>
          {customer && records.some((r) => r.customer === customer) && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                className="primary"
                onClick={() => syncCustomerToOrder(customer, "retail")}
              >
                ➔ 将「{customer}」全部测量窗位转入【零售定制管理】
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => syncCustomerToOrder(customer, "wholesale")}
              >
                ➔ 转入【批发业务管理】
              </button>
            </div>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
            gap: 14,
          }}
        >
          {records.map((r) => (
            <article
              key={r.id}
              style={{
                border: "1px solid #d5ddd8",
                borderRadius: 14,
                overflow: "hidden",
                background: "#fff",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{ position: "relative", cursor: "pointer", background: "#0f172a" }}
                onClick={() => setPreviewRecord(r)}
              >
                <img
                  src={r.annotatedPhotoDataUrl}
                  alt={r.windowLocation}
                  style={{ width: "100%", height: 210, objectFit: "cover", display: "block" }}
                />
                <span
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    background: "rgba(15,23,42,0.85)",
                    color: "#facc15",
                    padding: "4px 9px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  🔍 点击放大标注图
                </span>
              </div>

              <div style={{ padding: 14, display: "grid", gap: 6, flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: 15, color: "#153f34" }}>
                    {r.windowCode} · {r.windowLocation}
                  </strong>
                  <small style={{ color: "#64748b" }}>{r.createdAt}</small>
                </div>

                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                  👤 {r.customer} {r.phone && `(${r.phone})`}
                </div>

                <div
                  style={{
                    padding: "7px 10px",
                    borderRadius: 8,
                    background: "#f1f5f3",
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#153f34",
                  }}
                >
                  📏 实测：W {r.widthRaw || "—"}" × H {r.heightRaw || "—"}"
                  {r.depthRaw ? ` × D ${r.depthRaw}"` : ""}
                </div>

                <div style={{ fontSize: 12, color: "#334155" }}>
                  <b>选定型号：</b>
                  {r.productCategory} · <strong>{r.productModel}</strong>
                </div>
                <div style={{ fontSize: 12, color: "#475569" }}>
                  <b>安装与工艺：</b>
                  {r.mountType} · {r.openOrControl} · {r.motorOrTrack} · {r.linerOrStyle}
                </div>

                {r.voiceTranscript && (
                  <div style={{ fontSize: 12, color: "#153f34", background: "#f0fdf4", padding: "6px 8px", borderRadius: 6 }}>
                    🎤 语音/手写备注：{r.voiceTranscript}
                  </div>
                )}

                {r.audioDataUrl && (
                  <audio controls src={r.audioDataUrl} style={{ width: "100%", height: 32, marginTop: 4 }} />
                )}

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: "auto", paddingTop: 8 }}>
                  <a
                    href={r.annotatedPhotoDataUrl}
                    download={`${r.customer}-${r.windowCode}-${r.windowLocation}.jpg`}
                    className="secondary"
                    style={{ padding: "6px 10px", fontSize: 12, textDecoration: "none" }}
                  >
                    ⬇ 保存标注照片
                  </a>
                  <button
                    type="button"
                    className="secondary"
                    style={{ padding: "6px 10px", fontSize: 12 }}
                    onClick={() => syncCustomerToOrder(r.customer, "retail")}
                  >
                    转零售单
                  </button>
                  <button
                    type="button"
                    className="secondary"
                    style={{ padding: "6px 10px", fontSize: 12 }}
                    onClick={() => syncCustomerToOrder(r.customer, "wholesale")}
                  >
                    转批发单
                  </button>
                  <button
                    type="button"
                    className="secondary"
                    style={{ padding: "6px 10px", fontSize: 12, color: "#b91c1c" }}
                    onClick={() => {
                      const next = records.filter((x) => x.id !== r.id);
                      setRecords(next);
                      saveLocalList(PHOTO_MEASURE_STORAGE_KEY, next);
                    }}
                  >
                    删除
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {!records.length && (
          <div className="empty-search" style={{ padding: 32, textAlign: "center", color: "#64748b" }}>
            暂无保存的拍照测量记录。在上方拍照、画线标尺寸或语音输入后点击「保存此窗位」即可生成带标注的现场测量图。
          </div>
        )}
      </section>

      {/* 放大预览合成标注图弹窗 */}
      {previewRecord && (
        <div
          className="drawer-wrap modal-wrap"
          onClick={() => setPreviewRecord(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.8)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 16,
              maxWidth: 960,
              width: "100%",
              padding: 18,
              maxHeight: "92vh",
              overflow: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0 }}>
                  {previewRecord.customer} — {previewRecord.windowCode} ({previewRecord.windowLocation})
                </h3>
                <small style={{ color: "#64748b" }}>
                  {previewRecord.productCategory} · {previewRecord.productModel} ｜ 实测 W {previewRecord.widthRaw}&quot; × H {previewRecord.heightRaw}&quot;
                </small>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <a
                  href={previewRecord.annotatedPhotoDataUrl}
                  download={`${previewRecord.customer}-${previewRecord.windowCode}.jpg`}
                  className="primary"
                  style={{ textDecoration: "none", padding: "8px 14px", fontSize: 13 }}
                >
                  ⬇ 下载高清标注图
                </a>
                <button type="button" className="secondary" onClick={() => setPreviewRecord(null)}>
                  关闭 ×
                </button>
              </div>
            </div>
            <img
              src={previewRecord.annotatedPhotoDataUrl}
              alt={previewRecord.windowLocation}
              style={{ width: "100%", borderRadius: 12, border: "1px solid #cbd5cf" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

