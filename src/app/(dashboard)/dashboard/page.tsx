export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import {
  DollarSign,
  FileText,
  AlertTriangle,
  Users,
  ArrowRight,
} from "lucide-react";

async function getDashboardData() {
  const [invoices, clients] = await Promise.all([
    prisma.invoice.findMany({
      include: { client: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.findMany(),
  ]);

  const paid = invoices.filter((i) => i.status === "PAID");
  const outstanding = invoices.filter((i) => i.status === "SENT");
  const overdue = invoices.filter((i) => i.status === "OVERDUE");

  const totalRevenue = paid.reduce((s, i) => s + i.total, 0);
  const totalOutstanding = outstanding.reduce((s, i) => s + i.total, 0);
  const totalOverdue = overdue.reduce((s, i) => s + i.total, 0);

  // Revenue by month (last 12)
  const monthly: Record<string, number> = {};
  paid.forEach((inv) => {
    const key = format(new Date(inv.issueDate), "MMM");
    monthly[key] = (monthly[key] ?? 0) + inv.total;
  });

  const recent = invoices.slice(0, 6);

  return {
    totalRevenue,
    totalOutstanding,
    totalOverdue,
    activeClients: clients.length,
    outstandingCount: outstanding.length,
    overdueCount: overdue.length,
    monthly,
    recent,
    invoices,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const maxVal = Math.max(...months.map((m) => data.monthly[m] ?? 0), 1);

  // Status breakdown
  const statusBreakdown = [
    {
      label: "Paid",
      count: data.invoices.filter((i) => i.status === "PAID").length,
      total: data.invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.total, 0),
      color: "bg-indigo-600",
    },
    {
      label: "Outstanding",
      count: data.invoices.filter((i) => i.status === "SENT").length,
      total: data.invoices.filter((i) => i.status === "SENT").reduce((s, i) => s + i.total, 0),
      color: "bg-cyan-400",
    },
    {
      label: "Overdue",
      count: data.invoices.filter((i) => i.status === "OVERDUE").length,
      total: data.invoices.filter((i) => i.status === "OVERDUE").reduce((s, i) => s + i.total, 0),
      color: "bg-red-400",
    },
    {
      label: "Draft",
      count: data.invoices.filter((i) => i.status === "DRAFT").length,
      total: data.invoices.filter((i) => i.status === "DRAFT").reduce((s, i) => s + i.total, 0),
      color: "bg-slate-300",
    },
  ];
  const grandTotal = statusBreakdown.reduce((s, x) => s + x.total, 1);

  return (
    <>
      <Header title="Dashboard" />
      <div className="flex-1 overflow-y-auto p-7">
        {/* Greeting */}
        <div className="mb-7">
          <h2 className="text-[22px] font-bold text-slate-900">
            Good morning, Gabi 👋
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-4 gap-4">
          <StatCard
            label="Total Revenue"
            value={formatCurrency(data.totalRevenue)}
            change="↑ 12.4% vs last month"
            changeType="up"
            icon={<DollarSign size={16} className="text-indigo-600" />}
            iconBg="bg-indigo-50"
          />
          <StatCard
            label="Outstanding"
            value={formatCurrency(data.totalOutstanding)}
            change={`${data.outstandingCount} invoices pending`}
            changeType="neutral"
            icon={<FileText size={16} className="text-green-600" />}
            iconBg="bg-green-50"
          />
          <StatCard
            label="Overdue"
            value={formatCurrency(data.totalOverdue)}
            change={`↑ ${data.overdueCount} overdue invoices`}
            changeType={data.overdueCount > 0 ? "down" : "neutral"}
            icon={<AlertTriangle size={16} className="text-amber-500" />}
            iconBg="bg-amber-50"
          />
          <StatCard
            label="Active Clients"
            value={String(data.activeClients)}
            change="↑ 2 new this month"
            changeType="up"
            icon={<Users size={16} className="text-cyan-500" />}
            iconBg="bg-cyan-50"
          />
        </div>

        {/* Revenue chart + Status breakdown */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          {/* Revenue chart */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Revenue Overview</CardTitle>
                <p className="mt-0.5 text-xs text-slate-400">
                  Monthly revenue — 2025
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex h-36 items-end gap-1.5">
                {months.map((m) => {
                  const val = data.monthly[m] ?? 0;
                  const pct = Math.max((val / maxVal) * 100, 4);
                  const isCurrent = m === format(new Date(), "MMM");
                  return (
                    <div
                      key={m}
                      className="group flex flex-1 flex-col items-center gap-1"
                    >
                      <div
                        className={`w-full rounded-t-sm transition-all ${
                          isCurrent
                            ? "bg-indigo-600"
                            : "bg-indigo-100 group-hover:bg-indigo-400"
                        }`}
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex justify-between">
                {months.map((m) => (
                  <span key={m} className="flex-1 text-center text-[10px] text-slate-400">
                    {m}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Invoice status */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {statusBreakdown.map((s) => (
                  <div key={s.label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-medium text-slate-600">
                        {s.label}{" "}
                        <span className="text-slate-400">({s.count})</span>
                      </span>
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(s.total)}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${s.color}`}
                        style={{ width: `${(s.total / grandTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <Link
              href="/invoices"
              className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
            >
              View all <ArrowRight size={12} />
            </Link>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {["Invoice", "Client", "Issued", "Due", "Amount", "Status"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {data.recent.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
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
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inv.status} />
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
