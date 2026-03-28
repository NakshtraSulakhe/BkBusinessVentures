"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Badge, BadgeProps } from "./badge"

const statusBadgeVariants = cva(
  "",
  {
    variants: {
      status: {
        paid: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
        pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
        overdue: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
        due_soon: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
        active: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
        inactive: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800",
        approved: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
        rejected: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
        processing: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
        draft: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800",
        closed: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800",
        open: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
      },
    },
    defaultVariants: {
      status: "pending",
    },
  }
)

interface StatusBadgeProps extends BadgeProps,
  VariantProps<typeof statusBadgeVariants> {
  status?: "paid" | "pending" | "overdue" | "due_soon" | "active" | "inactive" | "approved" | "rejected" | "processing" | "draft" | "closed" | "open"
  children: React.ReactNode
}

function StatusBadge({ 
  status = "pending", 
  className, 
  children, 
  ...props 
}: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        statusBadgeVariants({ status }),
        "font-medium",
        className
      )}
      {...props}
    >
      {children}
    </Badge>
  )
}

// Status-specific components for common use cases
function PaidStatus({ children = "Paid" }: { children?: React.ReactNode }) {
  return <StatusBadge status="paid">{children}</StatusBadge>
}

function PendingStatus({ children = "Pending" }: { children?: React.ReactNode }) {
  return <StatusBadge status="pending">{children}</StatusBadge>
}

function OverdueStatus({ children = "Overdue" }: { children?: React.ReactNode }) {
  return <StatusBadge status="overdue">{children}</StatusBadge>
}

function ActiveStatus({ children = "Active" }: { children?: React.ReactNode }) {
  return <StatusBadge status="active">{children}</StatusBadge>
}

function InactiveStatus({ children = "Inactive" }: { children?: React.ReactNode }) {
  return <StatusBadge status="inactive">{children}</StatusBadge>
}

function ApprovedStatus({ children = "Approved" }: { children?: React.ReactNode }) {
  return <StatusBadge status="approved">{children}</StatusBadge>
}

function RejectedStatus({ children = "Rejected" }: { children?: React.ReactNode }) {
  return <StatusBadge status="rejected">{children}</StatusBadge>
}

function ProcessingStatus({ children = "Processing" }: { children?: React.ReactNode }) {
  return <StatusBadge status="processing">{children}</StatusBadge>
}

function ClosedStatus({ children = "Closed" }: { children?: React.ReactNode }) {
  return <StatusBadge status="closed">{children}</StatusBadge>
}

export {
  StatusBadge,
  statusBadgeVariants,
  PaidStatus,
  PendingStatus,
  OverdueStatus,
  ActiveStatus,
  InactiveStatus,
  ApprovedStatus,
  RejectedStatus,
  ProcessingStatus,
  ClosedStatus,
}
