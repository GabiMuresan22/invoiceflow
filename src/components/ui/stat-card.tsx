import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  iconBg?: string;
}

export function StatCard({
  label,
  value,
  change,
  changeType = "neutral",
  icon,
  iconBg = "bg-indigo-50",
}: StatCardProps) {
  const changeColors = {
    up: "text-green-600",
    down: "text-red-500",
    neutral: "text-slate-400",
  };

  return (
    <div className="rounded-[10px] border border-slate-200 bg-white p-6 shadow-card">
      {icon && (
        <div
          className={cn(
            "mb-3 flex h-9 w-9 items-center justify-center rounded-lg",
            iconBg
          )}
        >
          {icon}
        </div>
      )}
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mb-1 text-[28px] font-bold leading-none text-slate-900">
        {value}
      </p>
      {change && (
        <p className={cn("text-xs font-medium", changeColors[changeType])}>
          {change}
        </p>
      )}
    </div>
  );
}
