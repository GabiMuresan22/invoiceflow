import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getInitials } from "@/lib/utils";
import Link from "next/link";
import { Plus } from "lucide-react";

async function getClients() {
  const clients = await prisma.client.findMany({
    include: {
      invoices: {
        include: { payments: true },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return clients.map((c) => {
    const totalBilled = c.invoices.reduce((s, i) => s + i.total, 0);
    const totalPaid = c.invoices
      .filter((i) => i.status === "PAID")
      .reduce((s, i) => s + i.total, 0);
    const outstanding = c.invoices
      .filter((i) => i.status === "SENT")
      .reduce((s, i) => s + i.total, 0);
    const overdue = c.invoices.some((i) => i.status === "OVERDUE");
    const lastInvoice = c.invoices[0];
    return {
      ...c,
      totalBilled,
      totalPaid,
      outstanding,
      overdue,
      invoiceCount: c.invoices.length,
      lastInvoice,
    };
  });
}

const AVATAR_COLORS = [
  "bg-indigo-50 text-indigo-600",
  "bg-cyan-50 text-cyan-600",
  "bg-green-50 text-green-700",
  "bg-amber-50 text-amber-700",
  "bg-rose-50 text-rose-600",
  "bg-purple-50 text-purple-600",
];

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <>
      <Header title="Clients" />
      <div className="flex-1 overflow-y-auto p-7">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-[22px] font-bold text-slate-900">Clients</h2>
            <p className="mt-1 text-sm text-slate-500">
              {clients.length} active clients
            </p>
          </div>
          <Button variant="primary">
            <Plus size={13} /> Add Client
          </Button>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {[
                    "Client",
                    "Email",
                    "Invoices",
                    "Total Billed",
                    "Outstanding",
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
                {clients.map((client, i) => (
                  <tr
                    key={client.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="py-3 pl-5 pr-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                            AVATAR_COLORS[i % AVATAR_COLORS.length]
                          }`}
                        >
                          {getInitials(client.company ?? client.name)}
                        </div>
                        <div>
                          <Link
                            href={`/clients/${client.id}`}
                            className="text-sm font-semibold text-slate-800 hover:text-indigo-600"
                          >
                            {client.company ?? client.name}
                          </Link>
                          {client.company && (
                            <p className="text-xs text-slate-400">
                              {client.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {client.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {client.invoiceCount}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                      {formatCurrency(client.totalBilled)}
                    </td>
                    <td className="px-4 py-3">
                      {client.outstanding > 0 ? (
                        <span
                          className={`text-sm font-semibold ${
                            client.overdue ? "text-red-600" : "text-amber-600"
                          }`}
                        >
                          {formatCurrency(client.outstanding)}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {client.overdue ? (
                        <Badge variant="error">Overdue</Badge>
                      ) : client.invoiceCount === 0 ? (
                        <Badge variant="neutral">No invoices</Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/clients/${client.id}`}>
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
