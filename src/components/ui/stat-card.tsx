import * as React from "react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: React.ReactNode
  subtitle?: string
  trend?: {
    value: string
    isPositive: boolean
  }
  icon: React.ReactNode | React.ElementType
  iconVariant?: "primary" | "success" | "warning" | "danger" | "info" | "teal"
  borderVariant?: "primary" | "success" | "warning" | "danger" | "info" | "teal" | "none"
  highlight?: boolean
  className?: string
  children?: React.ReactNode
}

const iconVariantMap: Record<string, string> = {
  primary: "finance-icon-bg",
  success: "finance-icon-bg-success",
  warning: "finance-icon-bg-warning",
  danger:  "finance-icon-bg-danger",
  info:    "finance-icon-bg-info",
  teal:    "finance-icon-bg-teal",
}

const borderColorMap: Record<string, string> = {
  primary: "border-l-[hsl(220_90%_18%)]",
  success: "border-l-emerald-500",
  warning: "border-l-amber-500",
  danger:  "border-l-red-500",
  info:    "border-l-blue-500",
  teal:    "border-l-teal-500",
  none:    "",
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  iconVariant = "primary",
  borderVariant = "none",
  highlight = false,
  className,
  children,
}: StatCardProps) {
  // Support both component references (ElementType) and pre-rendered elements (ReactNode)
  const IconContent = typeof icon === "function"
    ? React.createElement(icon as React.ElementType, { className: "h-5 w-5" })
    : icon

  return (
    <div
      className={cn(
        "bg-white border border-slate-200 rounded-xl p-6 shadow-sm finance-hover-lift transition-all duration-300 hover:shadow-md relative",
        borderVariant !== "none" && "border-l-4",
        borderVariant !== "none" && borderColorMap[borderVariant],
        highlight && "ring-2 ring-red-400 ring-offset-1",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{title}</p>
          <div className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">{value}</div>
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <div className={cn(
                "flex items-center text-[10px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded",
                trend.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {trend.isPositive ? "↑" : "↓"} {trend.value}
              </div>
            )}
            {subtitle && (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">{subtitle}</p>
            )}
          </div>
        </div>
        <div
          className={cn(
            "h-11 w-11 rounded-2xl flex items-center justify-center flex-shrink-0 ml-4 shadow-sm",
            iconVariantMap[iconVariant]
          )}
        >
          {IconContent}
        </div>
      </div>
      {children}
    </div>
  )
}
