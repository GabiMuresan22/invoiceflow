export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { format, startOfYear, endOfYear } from "date-fns";
import { Download } from "lucide-react";

async function getReportsData() {
  const now = new Date();
  const yearStart = startOfYear(now);
  const yearEnd = endOfYear(now);

  const invoices = await prisma.invoice.findMany({
    include: { client: true },
    where: { issueDate: { gte: yearStart, lte: yearEnd } },
  });

  const paid = invoices.filter((i) => i.status === "PAID");
  const totalRevenue = paid.reduce((s, i) => s + i.total, 0);
  const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0);
  const collectionRate =
    totalInvoiced > 0 ? (totalRevenue / totalInvoiced) * 100 : 0;
  const avgInvoiceValue =
    invoices.length > 0 ? totalInvoiced / invoices.length : 0;

  // Monthly breakdown
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthlyRevenue: number[] = new Array(12).fill(0);
  const monthlyInvoiced: number[] = new Array(12).fill(0);
  invoices.forEach((inv) => {
    const m = new Date(inv.issueDate).getMonth();
    monthlyInvoiced[m] += inv.total;
    if (inv.status === "PAID") monthlyRevenue[m] += inv.total;
  });

  // Top clients
  const clientMap: Record<string, { name: string; total: number }> = {};
  paid.forEach((inv) => {
    const key = inv.clientId;
    if (!clientMap[key]) {
      clientMap[key] = {
        name: inv.client.company ?? inv.client.name,
        total: 0,
      };
    }
    clientMap[key].total += inv.total;
  });
  const topClients = Object.values(clientMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Status breakdown
  const statusBreakdown = [
    { label: "Paid", count: paid.length, total: totalRevenue, color: "bg-indigo-600" },
    {
      label: "Sent",
      count: invoices.filter((i) => i.status === "SENT").length,
      total: invoices.filter((i) => i.status === "SENT").reduce((s, i) => s + i.total, 0),
      color: "bg-cyan-400",
    },
    {
      label: "Overdue",
      count: invoices.filter((i) => i.status === "OVERDUE").length,
      total: invoices.filter((i) => i.status === "OVERDUE").reduce((s, i) => s + i.total, 0),
      color: "bg-red-400",
    },
    {
      label: "Draft",
      count: invoices.filter((i) => i.status === "DRAFT").length,
      total: invoices.filter((i) => i.status === "DRAFT").reduce((s, i) => s + i.total, 0),
      color: "bg-slate-300",
    },
  ];

  // Tax summary
  const taxCollected = paid.reduce((s, i) => s + i.taxAmount, 0);

  return {
    totalRevenue,
    totalInvoiced,
    collectionRate,
    avgInvoiceValue,
    invoiceCount: invoices.length,
    months,
    monthlyRevenue,
    monthlyInvoiced,
    topClients,
    statusBreakdown,
    taxCollected,
  };
}

export default async function ReportsPage() {
  const data = await getReportsData();
  const maxMonthly = Math.max(...data.monthlyInvoiced, 1);
  const maxClient = data.topClients[0]?.total ?? 1;

  return (
    <>
      <Header title="Reports" />
      <div className="flex-1 overflow-y-auto p-7">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-[22px] font-bold text-slate-900">Reports</h2>
            <p className="mt-1 text-sm text-slate-500">
              Financial insights for your business — {new Date().getFullYear()}.
            </p>
          </div>
          <div className="flex gap-2">
            <select className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700">
              <option>This Year</option>
              <option>Last Year</option>
              <option>Q1</option>
            </select>
            <Button variant="secondary">
              <Download size={13} /> Export PDF
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-4 gap-4">
          <StatCard
            label="Total Revenue (YTD)"
            value={formatCurrency(data.totalRevenue)}
            change="↑ 18.4% vs last year"
            changeType="up"
          />
          <StatCard
            label="Total Invoiced"
            value={formatCurrency(data.totalInvoiced)}
            change={`${data.invoiceCount} invoices`}
            changeType="neutral"
          />
          <StatCard
            label="Collection Rate"
            value={`${data.collectionRate.toFixed(1)}%`}
            change="↑ 4.2% vs last year"
            changeType="up"
          />
          <StatCard
            label="Avg Invoice Value"
            value={formatCurrency(data.avgInvoiceValue)}
            change="↑ vs last year"
            changeType="up"
          />
        </div>

        <div className="mb-5 grid grid-cols-2 gap-4">
          {/* Monthly revenue chart */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Monthly Revenue</CardTitle>
                <p className="mt-0.5 text-xs text-slate-400">
                  Invoiced vs collected
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex h-36 items-end gap-1.5">
                {data.months.map((m, i) => {
                  const invoicedPct = Math.max(
                    (data.monthlyInvoiced[i] / maxMonthly) * 100,
                    data.monthlyInvoiced[i] > 0 ? 4 : 0
                  );
                  const revPct = Math.max(
                    (data.monthlyRevenue[i] / maxMonthly) * 100,
                    data.monthlyRevenue[i] > 0 ? 3 : 0
                  );
                  const isCurrent = i === new Date().getMonth();
                  return (
                    <div
                      key={m}
                      className="group flex flex-1 flex-col items-center gap-0.5"
                    >
                      <div className="flex w-full items-end gap-0.5" style={{ height: "140px" }}>
                        <div
                          className={`flex-1 rounded-t-sm ${isCurrent ? "bg-indigo-600" : "bg-indigo-100"}`}
                          style={{ height: `${invoicedPct}%` }}
                        />
                        <div
                          className={`flex-1 rounded-t-sm ${isCurrent ? "bg-green-500" : "bg-green-200"}`}
                          style={{ height: `${revPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex justify-between">
                {data.months.map((m) => (
                  <span key={m} className="flex-1 text-center text-[10px] text-slate-400">
                    {m}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm bg-indigo-600" />
                  <span className="text-xs text-slate-500">Invoiced</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm bg-green-500" />
                  <span className="text-xs text-slate-500">Collected</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top clients */}
          <Card>
            <CardHeader>
              <CardTitle>Top Clients by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {data.topClients.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-400">
                  No data yet.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {data.topClients.map((client, i) => {
                    const pct = (client.total / maxClient) * 100;
                    const colors = [
                      "bg-indigo-600",
                      "bg-cyan-400",
                      "bg-green-500",
                      "bg-amber-400",
                      "bg-slate-300",
                    ];
                    return (
                      <div key={i}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="font-medium text-slate-700">
                            {client.name}
                          </span>
                          <span className="font-semibold text-slate-800">
                            {formatCurrency(client.total)}{" "}
                            <span className="font-normal text-slate-400">
                              ({((client.total / Math.max(data.totalRevenue, 1)) * 100).toFixed(0)}%)
                            </span>
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${colors[i]}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Status breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {data.statusBreakdown.map((s) => (
                  <div key={s.label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-medium text-slate-700">
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
                        style={{
                          width: `${
                            data.totalInvoiced > 0
                              ? (s.total / data.totalInvoiced) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tax summary */}
          <Card>
            <CardHeader>
              <CardTitle>Tax Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Invoiced (excl. tax)</span>
                  <span className="font-semibold text-slate-800">
                    {formatCurrency(data.totalInvoiced - data.taxCollected)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tax Collected</span>
                  <span className="font-semibold text-slate-800">
                    {formatCurrency(data.taxCollected)}
                  </span>
                </div>
                <div className="my-1 h-px bg-slate-200" />
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-slate-800">
                    Net Revenue (YTD)
                  </span>
                  <span className="text-base font-bold text-indigo-600">
                    {formatCurrency(data.totalRevenue)}
                  </span>
                </div>
                <Button variant="secondary" className="mt-2 w-full justify-center">
                  <Download size={13} /> Export Tax Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
