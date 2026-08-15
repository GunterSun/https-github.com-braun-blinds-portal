import { getCustomerSession } from "../../../customer-auth";
import { Z_SERIES_CATALOG, Z_SERIES_SOURCE, zSeriesWholesalePrice } from "../../../z-series-data";

export async function GET() {
  const customer = await getCustomerSession();
  if (!customer || customer.status !== "active") {
    return Response.json({ error: "未授权 / Unauthorized" }, { status: 401 });
  }

  const discountPercent = Number(customer.discountPercent);
  if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) {
    return Response.json({ error: "客户折扣配置无效，请联系老板审核 / Customer discount configuration is invalid; Owner review required" }, { status: 409 });
  }
  return Response.json({
    source: Z_SERIES_SOURCE,
    discountPercent,
    items: Z_SERIES_CATALOG.map((item) => ({
      ...item,
      wholesale: zSeriesWholesalePrice(item.retail, discountPercent),
    })),
  });
}
