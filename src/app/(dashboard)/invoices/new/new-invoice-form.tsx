"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Send, Save } from "lucide-react";
import { format, addDays } from "date-fns";
import { createInvoice } from "@/app/actions/invoices";
import type { Client } from "@prisma/client";

interface LineItem {
  description: string;
  quantity: string;
  unitPrice: string;
}

const today = new Date();
const net30 = addDays(today, 30);

export function NewInvoiceForm({
  clients,
  nextNumber,
}: {
  clients: Client[];
  nextNumber: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [issueDate, setIssueDate] = useState(format(today, "yyyy-MM-dd"));
  const [dueDate, setDueDate] = useState(format(net30, "yyyy-MM-dd"));
  const [terms, setTerms] = useState("Net 30");
  const [taxRate, setTaxRate] = useState("0");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: "1", unitPrice: "" },
  ]);

  const selectedClient = clients.find((c) => c.id === clientId);

  const addItem = () =>
    setItems((prev) => [...prev, { description: "", quantity: "1", unitPrice: "" }]);

  const removeItem = (idx: number) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const updateItem = (idx: number, field: keyof LineItem, value: string) =>
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );

  const subtotal = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);
  const tax = subtotal * (parseFloat(taxRate) / 100);
  const total = subtotal + tax;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n);

  const handleSubmit = (sendNow: boolean) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("clientId", clientId);
      formData.set("issueDate", issueDate);
      formData.set("dueDate", dueDate);
      formData.set("terms", terms);
      formData.set("taxRate", taxRate);
      formData.set("notes", notes);
      formData.set("status", sendNow ? "SENT" : "DRAFT");
      formData.set("items", JSON.stringify(items));

      const result = await createInvoice(formData);
      if (result?.id) {
        router.push(`/invoices/${result.id}`);
      }
    });
  };

  return (
    <div className="grid grid-cols-[1fr_320px] gap-5">
      {/* Main form */}
      <div className="flex flex-col gap-4">
        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">
                  Invoice Number
                </label>
                <input
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                  value={nextNumber}
                  readOnly
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">
                  Payment Terms
                </label>
                <select
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
                  value={terms}
                  onChange={(e) => {
                    setTerms(e.target.value);
                    const days = parseInt(e.target.value.replace("Net ", ""), 10);
                    if (!isNaN(days)) {
                      setDueDate(format(addDays(new Date(issueDate), days), "yyyy-MM-dd"));
                    }
                  }}
                >
                  <option>Net 30</option>
                  <option>Net 15</option>
                  <option>Net 60</option>
                  <option>Due on receipt</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">
                  Issue Date
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">
                  Due Date
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line items */}
        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Column headers */}
            <div className="mb-2 grid grid-cols-[2fr_80px_110px_110px_36px] gap-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              <span>Description</span>
              <span>Qty</span>
              <span>Unit Price</span>
              <span>Total</span>
              <span />
            </div>

            {items.map((item, idx) => {
              const lineTotal =
                (parseFloat(item.quantity) || 0) *
                (parseFloat(item.unitPrice) || 0);
              return (
                <div
                  key={idx}
                  className="mb-2 grid grid-cols-[2fr_80px_110px_110px_36px] items-center gap-2"
                >
                  <input
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-800 placeholder:text-slate-400"
                    placeholder="Item description…"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(idx, "description", e.target.value)
                    }
                  />
                  <input
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-center text-sm"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                  />
                  <input
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm"
                    placeholder="0.00"
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateItem(idx, "unitPrice", e.target.value)
                    }
                  />
                  <input
                    className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-500"
                    value={lineTotal > 0 ? fmt(lineTotal) : "—"}
                    readOnly
                  />
                  <button
                    onClick={() => removeItem(idx)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500"
                    disabled={items.length === 1}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}

            <button
              onClick={addItem}
              className="mt-1 flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800"
            >
              <Plus size={12} /> Add line item
            </button>

            {/* Totals */}
            <div className="ml-auto mt-5 w-64">
              <div className="flex justify-between border-b border-slate-200 py-2 text-sm text-slate-500">
                <span>Subtotal</span>
                <span className="font-medium">{fmt(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 py-2">
                <span className="text-sm text-slate-500">Tax rate</span>
                <div className="flex items-center gap-1">
                  <input
                    className="w-14 rounded border border-slate-200 px-2 py-0.5 text-right text-sm"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                  />
                  <span className="text-sm text-slate-400">%</span>
                </div>
              </div>
              {tax > 0 && (
                <div className="flex justify-between border-b border-slate-200 py-2 text-sm text-slate-500">
                  <span>Tax</span>
                  <span className="font-medium">{fmt(tax)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 text-base font-bold text-slate-900">
                <span>Total Due</span>
                <span className="text-indigo-600">{fmt(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardContent>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              Notes / Payment Terms
            </label>
            <textarea
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400"
              rows={3}
              placeholder="Payment terms, bank details, thank-you note…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Right panel */}
      <div className="flex flex-col gap-4">
        {/* Bill To */}
        <Card>
          <CardHeader>
            <CardTitle>Bill To</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              className="mb-3 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company ?? c.name}
                </option>
              ))}
            </select>
            {selectedClient && (
              <div className="text-sm text-slate-500">
                <p className="font-medium text-slate-700">
                  {selectedClient.name}
                </p>
                <p>{selectedClient.email}</p>
                {selectedClient.address && <p>{selectedClient.address}</p>}
                {selectedClient.city && (
                  <p>
                    {selectedClient.city}, {selectedClient.state}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">
                  Currency
                </label>
                <select className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
                  <option>USD — US Dollar</option>
                  <option>EUR — Euro</option>
                  <option>GBP — British Pound</option>
                </select>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Auto reminders
                  </p>
                  <p className="text-xs text-slate-400">3 days before due</p>
                </div>
                <div className="h-5 w-9 cursor-pointer rounded-full bg-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Send actions */}
        <Card>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Button
                variant="primary"
                className="w-full justify-center"
                onClick={() => handleSubmit(true)}
                disabled={isPending}
              >
                <Send size={13} />
                {isPending ? "Saving…" : "Send Invoice →"}
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-center"
                onClick={() => handleSubmit(false)}
                disabled={isPending}
              >
                <Save size={13} />
                Save as Draft
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
