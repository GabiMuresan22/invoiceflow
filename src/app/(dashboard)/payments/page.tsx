export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { format, startOfMonth, endOfMonth } from "date-fns";
import Link from "next/link";
import { Download, AlertTriangle } from "lucide-react";

async function getPaymentsData() {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [payments, invoices] = await Promise.all([
    prisma.payment.findMany({
      include: { invoice: { include: { client: true } } },
      orderBy: { paidAt: "desc" },
    }),
    prisma.invoice.findMany({
      include: { client: true },
      where: { status: { in: ["SENT", "OVERDUE"] } },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  const thisMonthPayments = payments.filter(
    (p) => p.paidAt >= monthStart && p.paidAt <= monthEnd
  );

  const receivedThisMonth = thisMonthPayments.reduce(
    (s, p) => s + p.amount,
    0
  );
  const outstanding = invoices
    .filter((i) => i.status === "SENT")
    .reduce((s, i) => s + i.total, 0);
  const overdue = invoices.filter((i) => i.status === "OVERDUE");
  const totalOverdue = overdue.reduce((s, i) => s + i.total, 0);

  return { payments, invoices, receivedThisMonth, outstanding, overdue, totalOverdue };
}

export default async function PaymentsPage() {
  const data = await getPaymentsData();

  return (
    <>
      <Header title="Payments" />
      <div className="flex-1 overflow-y-auto p-7">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-[22px] font-bold text-slate-900">Payments</h2>
            <p className="mt-1 text-sm text-slate-500">
              Track received payments and outstanding balances.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">
              <Download size={13} /> Export
            </Button>
            <Button variant="primary">Record Payment</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-4 gap-4">
          <StatCard
            label="Received This Month"
            value={formatCurrency(data.receivedThisMonth)}
            change="↑ 8.2% vs last month"
            changeType="up"
          />
          <StatCard
            label="Outstanding"
            value={formatCurrency(data.outstanding)}
            change={`${data.invoices.filter((i) => i.status === "SENT").length} invoices`}
            changeType="neutral"
          />
          <StatCard
            label="Overdue"
            value={formatCurrency(data.totalOverdue)}
            change={`${data.overdue.length} clients`}
            changeType={data.overdue.length > 0 ? "down" : "neutral"}
          />
          <StatCard
            label="Total Collected"
            value={formatCurrency(
              data.payments.reduce((s, p) => s + p.amount, 0)
            )}
            change="All time"
            changeType="neutral"
          />
        </div>

        <div className="mb-5 grid grid-cols-2 gap-4">
          {/* Overdue clients */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Overdue Payments</CardTitle>
                <p className="mt-0.5 text-xs text-slate-400">
                  Requires immediate attention
                </p>
              </div>
              <AlertTriangle size={15} className="text-red-400" />
            </CardHeader>
            <CardContent>
              {data.overdue.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-400">
                  No overdue invoices 🎉
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {data.overdue.map((inv) => {
                    const daysOverdue = Math.abs(
                      Math.round(
                        (new Date().getTime() - new Date(inv.dueDate).getTime()) /
                          86400000
                      )
                    );
                    return (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="text-sm font-semibold text-slate-800 hover:text-indigo-600"
                          >
                            {inv.client.company ?? inv.client.name}
                          </Link>
                          <p className="text-xs text-slate-400">
                            #{inv.number} · {daysOverdue} days overdue
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-red-600">
                            {formatCurrency(inv.total)}
                          </span>
                          <Button variant="ghost" size="sm" className="text-indigo-600">
                            Remind
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Outstanding */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Outstanding Invoices</CardTitle>
                <p className="mt-0.5 text-xs text-slate-400">Awaiting payment</p>
              </div>
            </CardHeader>
            <CardContent>
              {data.invoices.filter((i) => i.status === "SENT").length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-400">
                  No outstanding invoices
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {data.invoices
                    .filter((i) => i.status === "SENT")
                    .slice(0, 4)
                    .map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between">
                        <div>
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="text-sm font-semibold text-slate-800 hover:text-indigo-600"
                          >
                            {inv.client.company ?? inv.client.name}
                          </Link>
                          <p className="text-xs text-slate-400">
                            #{inv.number} · Due{" "}
                            {format(new Date(inv.dueDate), "MMM d")}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-amber-600">
                          {formatCurrency(inv.total)}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment history */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {["Date", "Client", "Invoice", "Method", "Amount", "Status"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {data.payments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-slate-400">
                      No payments recorded yet.
                    </td>
                  </tr>
                )}
                {data.payments.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {format(new Date(p.paidAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {p.invoice.client.company ?? p.invoice.client.name}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/invoices/${p.invoiceId}`}
                        className="text-sm font-semibold text-indigo-600 hover:underline"
                      >
                        #{p.invoice.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {p.method}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status="PAID" />
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
