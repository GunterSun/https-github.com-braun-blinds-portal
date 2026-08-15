import { getCustomerSession } from "../../../customer-auth";
import { Z_SERIES_CATALOG, Z_SERIES_SOURCE, zSeriesWholesalePrice } from "../../../z-series-data";

export async function GET() {
  const customer = await getCustomerSession();
  if (!customer || customer.status !== "active") {
    return Response.json({ error: "未授权 / Unauthorized" }, { status: 401 });
  }

  const discountPercent = Number(customer.discountPercent) || 0;
  return Response.json({
    source: Z_SERIES_SOURCE,
    discountPercent,
    items: Z_SERIES_CATALOG.map((item) => ({
      ...item,
      wholesale: zSeriesWholesalePrice(item.retail, discountPercent),
    })),
  });
}
