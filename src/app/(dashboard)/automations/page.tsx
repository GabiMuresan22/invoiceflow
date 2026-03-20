import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Plus, Zap, Clock, AlertTriangle, CheckCircle } from "lucide-react";

const TRIGGER_LABELS: Record<string, string> = {
  INVOICE_DUE_SOON: "Invoice due soon",
  INVOICE_OVERDUE: "Invoice overdue",
  PAYMENT_RECEIVED: "Payment received",
  SCHEDULE_MONTHLY: "Monthly schedule",
  SCHEDULE_WEEKLY: "Weekly schedule",
};

const TRIGGER_ICONS: Record<string, React.ReactNode> = {
  INVOICE_DUE_SOON: <Clock size={16} className="text-indigo-500" />,
  INVOICE_OVERDUE: <AlertTriangle size={16} className="text-red-500" />,
  PAYMENT_RECEIVED: <CheckCircle size={16} className="text-green-500" />,
  SCHEDULE_MONTHLY: <Zap size={16} className="text-amber-500" />,
  SCHEDULE_WEEKLY: <Zap size={16} className="text-amber-500" />,
};

const TRIGGER_ICON_BG: Record<string, string> = {
  INVOICE_DUE_SOON: "bg-indigo-50",
  INVOICE_OVERDUE: "bg-red-50",
  PAYMENT_RECEIVED: "bg-green-50",
  SCHEDULE_MONTHLY: "bg-amber-50",
  SCHEDULE_WEEKLY: "bg-amber-50",
};

const TEMPLATES = [
  {
    emoji: "📧",
    title: "Auto Payment Reminder",
    desc: "Send reminders before and after due dates automatically.",
  },
  {
    emoji: "🔄",
    title: "Recurring Billing",
    desc: "Auto-create and send invoices on a set schedule.",
  },
  {
    emoji: "✅",
    title: "Payment Confirmation",
    desc: "Send a thank-you email when a payment is received.",
  },
  {
    emoji: "🚨",
    title: "Overdue Escalation",
    desc: "Escalate follow-up when an invoice is 7+ days overdue.",
  },
];

export default async function AutomationsPage() {
  const automations = await prisma.automation.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <>
      <Header title="Automations" />
      <div className="flex-1 overflow-y-auto p-7">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-[22px] font-bold text-slate-900">
              Automations
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Set up billing workflows that run automatically.
            </p>
          </div>
          <Button variant="primary">
            <Plus size={13} /> New Workflow
          </Button>
        </div>

        {/* Active workflows */}
        <div className="mb-8 flex flex-col gap-3">
          {automations.map((auto) => (
            <Card key={auto.id}>
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                      TRIGGER_ICON_BG[auto.trigger] ?? "bg-slate-100"
                    }`}
                  >
                    {TRIGGER_ICONS[auto.trigger] ?? (
                      <Zap size={16} className="text-slate-500" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {auto.name}
                      </p>
                      {auto.enabled ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="neutral">Paused</Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Triggered {auto.runCount} times
                      {auto.lastRunAt
                        ? ` · Last run ${format(new Date(auto.lastRunAt), "MMM d, yyyy")}`
                        : ""}
                    </p>
                  </div>

                  {/* Workflow viz */}
                  <div className="flex items-center gap-1.5">
                    <div className="rounded-md border-l-2 border-indigo-400 bg-white px-3 py-2 shadow-card">
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                        Trigger
                      </p>
                      <p className="text-xs font-semibold text-slate-700">
                        {TRIGGER_LABELS[auto.trigger] ?? auto.trigger}
                      </p>
                    </div>
                    <span className="text-slate-300">→</span>
                    <div className="rounded-md border-l-2 border-amber-400 bg-white px-3 py-2 shadow-card">
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                        Condition
                      </p>
                      <p className="text-xs font-semibold text-slate-700">
                        Check status
                      </p>
                    </div>
                    <span className="text-slate-300">→</span>
                    <div className="rounded-md border-l-2 border-green-400 bg-white px-3 py-2 shadow-card">
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                        Action
                      </p>
                      <p className="text-xs font-semibold text-slate-700">
                        Send email
                      </p>
                    </div>
                  </div>

                  {/* Toggle */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-5 w-9 cursor-pointer rounded-full transition-colors ${
                        auto.enabled ? "bg-indigo-600" : "bg-slate-200"
                      }`}
                    />
                    <Button variant="ghost" size="sm">
                      ···
                    </Button>
                  </div>
                </div>

                {auto.description && (
                  <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    {auto.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Templates */}
        <div className="mb-4">
          <h3 className="mb-1 text-sm font-semibold text-slate-800">
            Workflow Templates
          </h3>
          <p className="text-xs text-slate-400">
            Get started quickly with pre-built automations
          </p>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {TEMPLATES.map((t) => (
            <Card key={t.title} className="cursor-pointer hover:border-indigo-200">
              <CardContent>
                <div className="mb-3 text-2xl">{t.emoji}</div>
                <p className="mb-1 text-sm font-semibold text-slate-800">
                  {t.title}
                </p>
                <p className="mb-4 text-xs text-slate-500">{t.desc}</p>
                <Button variant="secondary" size="sm">
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
