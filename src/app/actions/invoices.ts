"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface LineItemInput {
  description: string;
  quantity: string;
  unitPrice: string;
}

export async function createInvoice(formData: FormData) {
  const clientId = formData.get("clientId") as string;
  const issueDate = new Date(formData.get("issueDate") as string);
  const dueDate = new Date(formData.get("dueDate") as string);
  const terms = formData.get("terms") as string;
  const taxRate = parseFloat(formData.get("taxRate") as string) || 0;
  const notes = formData.get("notes") as string;
  const status = formData.get("status") as string;
  const rawItems = JSON.parse(formData.get("items") as string) as LineItemInput[];

  const items = rawItems
    .filter((i) => i.description.trim() && parseFloat(i.unitPrice) > 0)
    .map((i) => ({
      description: i.description.trim(),
      quantity: parseFloat(i.quantity) || 1,
      unitPrice: parseFloat(i.unitPrice) || 0,
      total: (parseFloat(i.quantity) || 1) * (parseFloat(i.unitPrice) || 0),
    }));

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  // Generate number
  const lastInvoice = await prisma.invoice.findFirst({
    orderBy: { number: "desc" },
  });
  let nextNum = "INV-0001";
  if (lastInvoice) {
    const n = parseInt(lastInvoice.number.replace("INV-", ""), 10) + 1;
    nextNum = `INV-${String(n).padStart(4, "0")}`;
  }

  const invoice = await prisma.invoice.create({
    data: {
      number: nextNum,
      clientId,
      status,
      issueDate,
      dueDate,
      notes: notes || null,
      terms,
      taxRate,
      taxAmount,
      subtotal,
      total,
      items: { create: items },
    },
  });

  revalidatePath("/invoices");
  revalidatePath("/dashboard");

  return { id: invoice.id };
}

export async function voidInvoice(id: string) {
  await prisma.invoice.update({
    where: { id },
    data: { status: "VOID" },
  });
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
}

export async function recordPayment(invoiceId: string, amount: number, method: string) {
  await Promise.all([
    prisma.payment.create({
      data: { invoiceId, amount, method },
    }),
    prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "PAID" },
    }),
  ]);
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
  revalidatePath("/payments");
  revalidatePath("/dashboard");
}
