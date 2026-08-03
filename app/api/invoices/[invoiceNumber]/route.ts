import { and, eq } from "drizzle-orm";
import { getCustomerSession } from "../../../customer-auth";
import { getDb } from "../../../../db";
import { customerOrders } from "../../../../db/schema";

export async function GET(
  _request: Request,
  context: { params: Promise<{ invoiceNumber: string }> },
) {
  const customer = await getCustomerSession();
  if (!customer) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { invoiceNumber: rawInvoiceNumber } = await context.params;
  const invoiceNumber = decodeURIComponent(rawInvoiceNumber || "").trim();
  if (!/^\d{5}$/.test(invoiceNumber)) {
    return Response.json({ error: "Invalid invoice number" }, { status: 400 });
  }

  const db = await getDb();
  const [order] = await db
    .select({
      id: customerOrders.id,
      orderNumber: customerOrders.orderNumber,
      invoiceNumber: customerOrders.invoiceNumber,
      projectName: customerOrders.projectName,
      wholesaleTotal: customerOrders.wholesaleTotal,
      paymentStatus: customerOrders.paymentStatus,
      amountPaid: customerOrders.amountPaid,
      paymentCurrency: customerOrders.paymentCurrency,
      paidAt: customerOrders.paidAt,
    })
    .from(customerOrders)
    .where(
      and(
        eq(customerOrders.invoiceNumber, invoiceNumber),
        eq(customerOrders.customerEmail, customer.email),
      ),
    )
    .limit(1);

  if (!order) return Response.json({ error: "Invoice not found" }, { status: 404 });

  const balanceDue = Math.max(0, Number(order.wholesaleTotal) - Number(order.amountPaid || 0));
  return Response.json({
    invoice: {
      ...order,
      balanceDue: Math.round(balanceDue * 100) / 100,
      customerEmail: customer.email,
      customerName: customer.contactName || customer.companyName || customer.email,
    },
  });
}
