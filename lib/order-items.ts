import { money } from "@/lib/order-access";

const SOURCE_CALCULATORS = new Set(["Braun", "Jin", "manual"]);

export function parseOrderItem(body: Record<string, unknown>, owner: boolean) {
  const productType = text(body.productType, 120);
  const sourceCalculator = text(body.sourceCalculator || "manual", 20);
  const quantity = Number(body.quantity ?? 1);
  const unitPrice = Number(body.unitPrice ?? 0);
  const width = optionalNumber(body.width);
  const height = optionalNumber(body.height);
  if (!productType) return { error:"产品类型不能为空" } as const;
  if (!SOURCE_CALCULATORS.has(sourceCalculator)) return { error:"产品来源无效" } as const;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10_000) return { error:"数量必须为 1–10000 的整数" } as const;
  if (!Number.isFinite(unitPrice) || unitPrice < 0 || unitPrice > 10_000_000) return { error:"单价无效" } as const;
  if (width === undefined || height === undefined) return { error:"尺寸必须为空或有效正数" } as const;
  const cost = optionalNumber(body.costEstimateUsd);
  if (cost === undefined) return { error:"成本估算必须为空或有效正数" } as const;
  const value = {
    sourceCalculator, productType, style:text(body.style,120), fabricCode:text(body.fabricCode,120),
    width, height, quantity, mountType:text(body.mountType,80), controlType:text(body.controlType,80),
    lining:text(body.lining,80), unitPrice:money(unitPrice), lineTotal:money(unitPrice*quantity),
    costEstimateUsd:owner ? cost : null, notes:text(body.notes,1000), sortOrder:integer(body.sortOrder,0),
  };
  return { value } as const;
}

export function canEditOrderItems(status: string) { return status === "draft" || status === "quoted"; }
function text(value: unknown, max: number) { return String(value ?? "").replace(/\s+/g," ").trim().slice(0,max); }
function optionalNumber(value: unknown): number|null|undefined {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 10_000_000 ? parsed : undefined;
}
function integer(value: unknown, fallback: number) { const parsed=Number(value); return Number.isInteger(parsed)&&parsed>=0?parsed:fallback; }
