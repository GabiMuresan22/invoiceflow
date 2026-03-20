export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency, getInitials } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import Link from "next/link";
import { ArrowLeft, Plus, Mail, Phone, MapPin } from "lucide-react";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      invoices: {
        include: { items: true, payments: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client) notFound();

  const totalBilled = client.invoices.reduce((s, i) => s + i.total, 0);
  const totalPaid = client.invoices
    .filter((i) => i.status === "PAID")
    .reduce((s, i) => s + i.total, 0);
  const outstanding = client.invoices
    .filter((i) => ["SENT", "OVERDUE"].includes(i.status))
    .reduce((s, i) => s + i.total, 0);

  // Average payment time for paid invoices
  const paidInvoices = client.invoices.filter(
    (i) => i.status === "PAID" && i.payments.length > 0
  );
  const avgPayDays =
    paidInvoices.length > 0
      ? Math.round(
          paidInvoices.reduce((s, i) => {
            const days = differenceInDays(
              new Date(i.payments[0].paidAt),
              new Date(i.issueDate)
            );
            return s + days;
          }, 0) / paidInvoices.length
        )
      : null;

  return (
    <>
      <Header title={client.company ?? client.name} />
      <div className="flex-1 overflow-y-auto p-7">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <Link href="/clients">
              <Button variant="ghost" size="sm" className="mb-2 gap-1 pl-0">
                <ArrowLeft size={13} /> Back to Clients
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-base font-semibold text-indigo-600">
                {getInitials(client.company ?? client.name)}
              </div>
              <div>
                <h2 className="text-[22px] font-bold text-slate-900">
                  {client.company ?? client.name}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {client.email} · {client.invoices.length} invoices
                </p>
              </div>
              {client.invoices.some((i) => i.status === "OVERDUE") ? (
                <Badge variant="error">Overdue</Badge>
              ) : (
                <Badge variant="success">Active</Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">Edit Client</Button>
            <Link href={`/invoices/new`}>
              <Button variant="primary">
                <Plus size={13} /> New Invoice
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <StatCard
            label="Total Billed"
            value={formatCurrency(totalBilled)}
            change={`${client.invoices.length} invoices`}
            changeType="neutral"
          />
          <StatCard
            label="Outstanding"
            value={formatCurrency(outstanding)}
            change={outstanding === 0 ? "All invoices paid" : undefined}
            changeType={outstanding === 0 ? "up" : "down"}
          />
          <StatCard
            label="Avg. Pay Time"
            value={avgPayDays !== null ? `${avgPayDays} days` : "—"}
            change={
              avgPayDays !== null && avgPayDays <= 10
                ? "Excellent payer"
                : avgPayDays !== null
                ? "Average payer"
                : "No payments yet"
            }
            changeType={
              avgPayDays !== null && avgPayDays <= 10 ? "up" : "neutral"
            }
          />
        </div>

        <div className="grid grid-cols-[1fr_300px] gap-5">
          {/* Invoice history */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <Link href="/invoices/new">
                <Button variant="primary" size="sm">
                  <Plus size={12} /> New Invoice
                </Button>
              </Link>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {["Invoice", "Date", "Due", "Amount", "Status"].map(
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
                  {client.invoices.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-12 text-center text-sm text-slate-400"
                      >
                        No invoices yet.
                      </td>
                    </tr>
                  )}
                  {client.invoices.map((inv) => (
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

          {/* Right panel */}
          <div className="flex flex-col gap-4">
            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3 text-sm">
                  <div>
                    <p className="mb-0.5 text-xs font-medium text-slate-400">
                      Contact name
                    </p>
                    <p className="font-medium text-slate-800">{client.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-slate-400" />
                    <a
                      href={`mailto:${client.email}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {client.email}
                    </a>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-slate-400" />
                      <span className="text-slate-700">{client.phone}</span>
                    </div>
                  )}
                  {(client.address || client.city) && (
                    <div className="flex items-start gap-2">
                      <MapPin size={13} className="mt-0.5 text-slate-400" />
                      <div className="text-slate-700">
                        {client.address && <p>{client.address}</p>}
                        {client.city && (
                          <p>
                            {client.city}
                            {client.state ? `, ${client.state}` : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {client.notes ? (
                  <p className="text-sm leading-relaxed text-slate-500">
                    {client.notes}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400">No notes yet.</p>
                )}
                <button className="mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-800">
                  + Add note
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
