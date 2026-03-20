import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const MENU_ITEMS = [
  "Profile",
  "Business",
  "Branding",
  "Invoices",
  "Payments",
  "Notifications",
  "Team",
  "Integrations",
  "Billing",
];

export default function SettingsPage() {
  return (
    <>
      <Header title="Settings" />
      <div className="flex-1 overflow-y-auto p-7">
        <div className="mb-6">
          <h2 className="text-[22px] font-bold text-slate-900">Settings</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage your account, branding, and preferences.
          </p>
        </div>

        <div className="grid grid-cols-[200px_1fr] gap-6">
          {/* Settings menu */}
          <div className="flex flex-col gap-0.5">
            {MENU_ITEMS.map((item) => (
              <button
                key={item}
                className={`rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                  item === "Profile"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                }`}
              >
                {item}
              </button>
            ))}
            <button className="mt-4 rounded-md px-3 py-2 text-left text-sm font-medium text-red-500 hover:bg-red-50">
              Danger Zone
            </button>
          </div>

          {/* Settings content */}
          <div className="flex flex-col gap-5">
            {/* Profile */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Profile</CardTitle>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Your personal account details
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-5 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-xl font-semibold text-indigo-600">
                    GS
                  </div>
                  <div>
                    <Button variant="secondary" size="sm">
                      Upload photo
                    </Button>
                    <p className="mt-1 text-xs text-slate-400">
                      JPG, PNG up to 2MB
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">
                      First Name
                    </label>
                    <input
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800"
                      defaultValue="Gabi"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">
                      Last Name
                    </label>
                    <input
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800"
                      defaultValue="Santos"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">
                    Email Address
                  </label>
                  <input
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800"
                    defaultValue="gabi@gabisantos.design"
                  />
                </div>
                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">
                    Time Zone
                  </label>
                  <select className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800">
                    <option>UTC-8 — Pacific Time (US & Canada)</option>
                    <option>UTC-5 — Eastern Time (US & Canada)</option>
                    <option>UTC+0 — London</option>
                    <option>UTC+1 — Amsterdam, Berlin, Rome</option>
                  </select>
                </div>
                <div className="mt-5">
                  <Button variant="primary">Save Changes</Button>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col divide-y divide-slate-100">
                  {[
                    {
                      label: "Invoice paid",
                      sub: "Notify when a client pays an invoice",
                      on: true,
                    },
                    {
                      label: "Invoice overdue",
                      sub: "Notify when an invoice becomes overdue",
                      on: true,
                    },
                    {
                      label: "Weekly summary",
                      sub: "Receive a weekly revenue summary email",
                      on: false,
                    },
                    {
                      label: "Automation runs",
                      sub: "Notify when a workflow automation fires",
                      on: true,
                    },
                  ].map((n) => (
                    <div
                      key={n.label}
                      className="flex items-center justify-between py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {n.label}
                        </p>
                        <p className="text-xs text-slate-400">{n.sub}</p>
                      </div>
                      <div
                        className={`h-5 w-9 cursor-pointer rounded-full ${
                          n.on ? "bg-indigo-600" : "bg-slate-200"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Plan */}
            <Card>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Current Plan
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Badge variant="info">Pro</Badge>
                    <span className="text-xs text-slate-400">
                      $19/month · Renews Apr 20, 2026
                    </span>
                  </div>
                </div>
                <Button variant="secondary">Manage Plan</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
