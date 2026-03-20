export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import { Plus, Download } from "lucide-react";

const STATUS_FILTERS = ["All", "Draft", "Sent", "Overdue", "Paid"];

async function getInvoices(status?: string) {
  return prisma.invoice.findMany({
    where:
      status && status !== "All"
        ? { status: status.toUpperCase() }
        : undefined,
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "All" } = await searchParams;
  const invoices = await getInvoices(status);

  const counts = await prisma.invoice.groupBy({
    by: ["status"],
    _count: true,
  });
  const countMap: Record<string, number> = { All: 0 };
  counts.forEach((c) => {
    const label =
      c.status.charAt(0) + c.status.slice(1).toLowerCase();
    countMap[label] = c._count;
    countMap["All"] = (countMap["All"] ?? 0) + c._count;
  });

  const totalAmount = invoices.reduce((s, i) => s + i.total, 0);

  return (
    <>
      <Header title="Invoices" />
      <div className="flex-1 overflow-y-auto p-7">
        {/* Page heading */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-[22px] font-bold text-slate-900">Invoices</h2>
            <p className="mt-1 text-sm text-slate-500">
              {countMap["All"] ?? 0} invoices · {formatCurrency(totalAmount)} total
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">
              <Download size={13} />
              Export
            </Button>
            <Link href="/invoices/new">
              <Button variant="primary">
                <Plus size={13} />
                New Invoice
              </Button>
            </Link>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="mb-4 flex gap-2">
          {STATUS_FILTERS.map((s) => (
            <Link key={s} href={`/invoices?status=${s}`}>
              <span
                className={`inline-flex cursor-pointer items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  status === s
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:text-indigo-600"
                }`}
              >
                {s} {countMap[s] !== undefined ? `(${countMap[s]})` : ""}
              </span>
            </Link>
          ))}
        </div>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {[
                    "Invoice",
                    "Client",
                    "Issue Date",
                    "Due Date",
                    "Amount",
                    "Status",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 first:pl-5"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-sm text-slate-400">
                      No invoices found.
                    </td>
                  </tr>
                )}
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="py-3 pl-5 pr-4">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="text-sm font-semibold text-indigo-600 hover:underline"
                      >
                        #{inv.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {inv.client.company ?? inv.client.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {format(new Date(inv.issueDate), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {format(new Date(inv.dueDate), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                      {formatCurrency(inv.total, inv.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/invoices/${inv.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
