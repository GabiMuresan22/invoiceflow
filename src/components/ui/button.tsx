import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "icon";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "secondary", size = "md", className, children, ...props }, ref) => {
    const variants = {
      primary:
        "bg-indigo-600 text-white hover:bg-indigo-700 border border-transparent",
      secondary:
        "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200",
      ghost:
        "bg-transparent text-slate-500 hover:bg-slate-50 border border-transparent",
      danger:
        "bg-white text-red-600 hover:bg-red-50 border border-slate-200",
    };
    const sizes = {
      sm: "h-7 px-3 text-xs",
      md: "h-8 px-3.5 text-sm",
      icon: "h-8 w-8 p-0 justify-center",
    };
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
