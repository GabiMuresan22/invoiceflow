"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  Zap,
  BarChart2,
  Settings,
} from "lucide-react";

const navItems = [
  {
    section: "Main",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/invoices", label: "Invoices", icon: FileText, badge: "3" },
      { href: "/clients", label: "Clients", icon: Users },
      { href: "/payments", label: "Payments", icon: CreditCard },
    ],
  },
  {
    section: "Tools",
    items: [
      { href: "/automations", label: "Automations", icon: Zap },
      { href: "/reports", label: "Reports", icon: BarChart2 },
    ],
  },
  {
    section: "Account",
    items: [{ href: "/settings", label: "Settings", icon: Settings }],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[240px] min-w-[240px] flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
          IF
        </div>
        <span className="text-[15px] font-bold text-slate-900">
          InvoiceFlow
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {navItems.map((section) => (
          <div key={section.section} className="mb-1">
            <p className="mb-1 mt-2 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {section.section}
            </p>
            {section.items.map(({ href, label, icon: Icon, badge }) => {
              const active =
                pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13.5px] font-medium transition-colors",
                    active
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  )}
                >
                  <Icon
                    size={15}
                    className={cn(active ? "opacity-100" : "opacity-70")}
                  />
                  <span className="flex-1">{label}</span>
                  {badge && (
                    <span className="rounded-full bg-indigo-600 px-1.5 py-px text-[10px] font-semibold text-white">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="flex items-center gap-2.5 border-t border-slate-200 p-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-600">
          GS
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-semibold text-slate-800">
            Gabi Santos
          </p>
          <p className="text-[11px] text-slate-400">Pro Plan</p>
        </div>
      </div>
    </aside>
  );
}
