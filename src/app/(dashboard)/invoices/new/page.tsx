export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { NewInvoiceForm } from "./new-invoice-form";

export default async function NewInvoicePage() {
  const clients = await prisma.client.findMany({
    orderBy: { company: "asc" },
  });

  // Get next invoice number
  const lastInvoice = await prisma.invoice.findFirst({
    orderBy: { number: "desc" },
  });

  let nextNum = "INV-0001";
  if (lastInvoice) {
    const n = parseInt(lastInvoice.number.replace("INV-", ""), 10) + 1;
    nextNum = `INV-${String(n).padStart(4, "0")}`;
  }

  return (
    <>
      <Header title="New Invoice" />
      <div className="flex-1 overflow-y-auto p-7">
        <div className="mb-6">
          <h2 className="text-[22px] font-bold text-slate-900">New Invoice</h2>
          <p className="mt-1 text-sm text-slate-500">
            Create and send an invoice in under 60 seconds.
          </p>
        </div>
        <NewInvoiceForm clients={clients} nextNumber={nextNum} />
      </div>
    </>
  );
}
