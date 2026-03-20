"use client";

import Link from "next/link";
import { Bell, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="flex h-16 flex-shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-7">
      <h1 className="flex-1 text-base font-semibold text-slate-900">{title}</h1>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-400 w-56">
        <Search size={13} />
        <span>Search…</span>
      </div>

      {/* Notifications */}
      <div className="relative">
        <Button variant="ghost" size="icon">
          <Bell size={15} />
        </Button>
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
      </div>

      {/* New invoice CTA */}
      <Link href="/invoices/new">
        <Button variant="primary">
          <Plus size={13} />
          New Invoice
        </Button>
      </Link>
    </header>
  );
}
