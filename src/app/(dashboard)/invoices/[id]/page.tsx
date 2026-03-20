export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import Link from "next/link";
import { ArrowLeft, Download, Copy, Edit } from "lucide-react";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { client: true, items: true, payments: true },
  });

  if (!invoice) notFound();

  const isPaid = invoice.status === "PAID";
  const isOverdue = invoice.status === "OVERDUE";
  const daysUntilDue = differenceInDays(new Date(invoice.dueDate), new Date());
  const totalPaid = invoice.payments.reduce((s, p) => s + p.amount, 0);
  const balanceDue = invoice.total - totalPaid;

  return (
    <>
      <Header title={`Invoice #${invoice.number}`} />
      <div className="flex-1 overflow-y-auto p-7">
        {/* Breadcrumb + actions */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <Link href="/invoices">
              <Button variant="ghost" size="sm" className="mb-2 gap-1 pl-0">
                <ArrowLeft size={13} /> Back to Invoices
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <h2 className="text-[22px] font-bold text-slate-900">
                #{invoice.number}
              </h2>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {invoice.client.company ?? invoice.client.name} · Issued{" "}
              {format(new Date(invoice.issueDate), "MMM d")} · Due{" "}
              {format(new Date(invoice.dueDate), "MMM d, yyyy")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">
              <Download size={13} /> Download PDF
            </Button>
            <Button variant="secondary">
              <Copy size={13} /> Duplicate
            </Button>
            <Link href={`/invoices/${id}/edit`}>
              <Button variant="secondary">
                <Edit size={13} /> Edit
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_300px] gap-5">
          {/* Invoice preview */}
          <Card>
            {/* Header */}
            <CardContent className="border-b border-slate-200 py-8">
              <div className="mb-8 flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold text-indigo-600">
                    InvoiceFlow
                  </p>
                  <p className="text-sm text-slate-500">Gabi Santos Design</p>
                  <p className="text-sm text-slate-500">
                    gabi@gabisantos.design
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold uppercase tracking-wide text-slate-900">
                    Invoice
                  </p>
                  <p className="text-sm text-slate-400">#{invoice.number}</p>
                </div>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Bill To
                  </p>
                  <p className="font-semibold text-slate-900">
                    {invoice.client.company ?? invoice.client.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {invoice.client.email}
                  </p>
                  {invoice.client.address && (
                    <p className="text-sm text-slate-500">
                      {invoice.client.address}
                    </p>
                  )}
                  {invoice.client.city && (
                    <p className="text-sm text-slate-500">
                      {invoice.client.city}, {invoice.client.state}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="mb-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Issue Date
                    </p>
                    <p className="font-semibold text-slate-800">
                      {format(new Date(invoice.issueDate), "MMMM d, yyyy")}
                    </p>
                  </div>
                  <div className="mb-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Due Date
                    </p>
                    <p className="font-semibold text-slate-800">
                      {format(new Date(invoice.dueDate), "MMMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Amount Due
                    </p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {formatCurrency(balanceDue, invoice.currency)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>

            {/* Line items */}
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-800">
                    <th className="py-2 text-left text-xs font-semibold text-slate-700">
                      Description
                    </th>
                    <th className="py-2 text-center text-xs font-semibold text-slate-700">
                      Qty
                    </th>
                    <th className="py-2 text-right text-xs font-semibold text-slate-700">
                      Unit Price
                    </th>
                    <th className="py-2 text-right text-xs font-semibold text-slate-700">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="py-3">
                        <p className="font-medium text-slate-800">
                          {item.description}
                        </p>
                      </td>
                      <td className="py-3 text-center text-sm text-slate-500">
                        {item.quantity}
                      </td>
                      <td className="py-3 text-right text-sm text-slate-600">
                        {formatCurrency(item.unitPrice, invoice.currency)}
                      </td>
                      <td className="py-3 text-right text-sm font-semibold text-slate-800">
                        {formatCurrency(item.total, invoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="mt-4 ml-auto w-64">
                <div className="flex justify-between border-b border-slate-200 py-2 text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(invoice.subtotal, invoice.currency)}
                  </span>
                </div>
                {invoice.taxRate > 0 && (
                  <div className="flex justify-between border-b border-slate-200 py-2 text-sm text-slate-500">
                    <span>Tax ({invoice.taxRate}%)</span>
                    <span className="font-medium">
                      {formatCurrency(invoice.taxAmount, invoice.currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-3 text-base font-bold text-slate-900">
                  <span>Total Due</span>
                  <span className="text-indigo-600">
                    {formatCurrency(invoice.total, invoice.currency)}
                  </span>
                </div>
              </div>

              {invoice.notes && (
                <div className="mt-6 border-t border-slate-200 pt-4">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Notes
                  </p>
                  <p className="text-sm text-slate-500">{invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right panel */}
          <div className="flex flex-col gap-4">
            {/* Payment status */}
            <Card>
              <CardContent>
                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                  Payment Status
                </h3>
                <div
                  className={`mb-4 rounded-lg border p-4 ${
                    isPaid
                      ? "border-green-200 bg-green-50"
                      : isOverdue
                      ? "border-red-200 bg-red-50"
                      : "border-amber-200 bg-amber-50"
                  }`}
                >
                  <p
                    className={`text-[11px] font-semibold uppercase tracking-wide ${
                      isPaid
                        ? "text-green-600"
                        : isOverdue
                        ? "text-red-600"
                        : "text-amber-600"
                    }`}
                  >
                    {isPaid
                      ? "PAID IN FULL"
                      : isOverdue
                      ? "OVERDUE"
                      : "AWAITING PAYMENT"}
                  </p>
                  <p className="mt-0.5 text-xl font-bold text-slate-900">
                    {formatCurrency(balanceDue, invoice.currency)}
                  </p>
                  <p
                    className={`text-xs ${
                      isPaid
                        ? "text-green-600"
                        : isOverdue
                        ? "text-red-500"
                        : "text-amber-600"
                    }`}
                  >
                    {isPaid
                      ? `Paid on ${format(
                          new Date(invoice.payments[0]?.paidAt ?? invoice.dueDate),
                          "MMM d, yyyy"
                        )}`
                      : isOverdue
                      ? `${Math.abs(daysUntilDue)} days overdue`
                      : `Due ${format(new Date(invoice.dueDate), "MMM d, yyyy")} · ${daysUntilDue} days`}
                  </p>
                </div>
                {!isPaid && (
                  <>
                    <Button variant="primary" className="mb-2 w-full justify-center">
                      Record Payment
                    </Button>
                    <Button variant="secondary" className="w-full justify-center">
                      Send Reminder
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-0">
                  <div className="flex gap-3 border-b border-slate-100 pb-3">
                    <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500" />
                    <div>
                      <p className="text-sm text-slate-700">Invoice created</p>
                      <p className="text-[11px] text-slate-400">
                        {format(new Date(invoice.createdAt), "MMM d, yyyy · h:mm a")}
                      </p>
                    </div>
                  </div>
                  {invoice.status !== "DRAFT" && (
                    <div className="flex gap-3 border-b border-slate-100 py-3">
                      <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-amber-400" />
                      <div>
                        <p className="text-sm text-slate-700">Invoice sent</p>
                        <p className="text-[11px] text-slate-400">
                          {format(new Date(invoice.issueDate), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  )}
                  {isPaid && invoice.payments[0] && (
                    <div className="flex gap-3 pt-3">
                      <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
                      <div>
                        <p className="text-sm text-slate-700">
                          Payment received
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {format(
                            new Date(invoice.payments[0].paidAt),
                            "MMM d, yyyy"
                          )}{" "}
                          · {invoice.payments[0].method}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent>
                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                  Actions
                </h3>
                <div className="flex flex-col gap-2">
                  <Button variant="secondary" className="w-full justify-start gap-2">
                    <Download size={13} /> Download PDF
                  </Button>
                  <Button variant="secondary" className="w-full justify-start gap-2">
                    <Copy size={13} /> Copy share link
                  </Button>
                  <Link href={`/invoices/${id}/edit`} className="w-full">
                    <Button variant="secondary" className="w-full justify-start gap-2">
                      <Edit size={13} /> Edit invoice
                    </Button>
                  </Link>
                  <Button variant="danger" className="w-full justify-start gap-2">
                    Void invoice
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
