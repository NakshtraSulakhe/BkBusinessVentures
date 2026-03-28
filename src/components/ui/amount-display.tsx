"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const amountDisplayVariants = cva(
  "font-mono tabular-nums",
  {
    variants: {
      size: {
        sm: "text-sm",
        default: "text-base",
        lg: "text-lg",
        xl: "text-xl",
      },
      weight: {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
      },
      color: {
        default: "text-foreground",
        muted: "text-muted-foreground",
        success: "text-green-600",
        warning: "text-amber-600",
        error: "text-red-600",
        primary: "text-primary",
      },
    },
    defaultVariants: {
      size: "default",
      weight: "medium",
      color: "default",
    },
  }
)

interface AmountDisplayProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'>,
  VariantProps<typeof amountDisplayVariants> {
  amount: number | string
  currency?: string
  showSign?: boolean
  compact?: boolean
  className?: string
}

function AmountDisplay({
  amount,
  currency = "₹",
  showSign = false,
  compact = false,
  size,
  weight,
  color,
  className,
  ...props
}: AmountDisplayProps) {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  const isNegative = numericAmount < 0
  const absAmount = Math.abs(numericAmount)
  
  // Format the amount
  let formattedAmount: string
  if (compact) {
    if (absAmount >= 10000000) {
      formattedAmount = (absAmount / 10000000).toFixed(1) + 'Cr'
    } else if (absAmount >= 100000) {
      formattedAmount = (absAmount / 100000).toFixed(1) + 'L'
    } else if (absAmount >= 1000) {
      formattedAmount = (absAmount / 1000).toFixed(1) + 'K'
    } else {
      formattedAmount = absAmount.toFixed(0)
    }
  } else {
    formattedAmount = absAmount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }
  
  // Determine color based on sign if not explicitly set
  const finalColor: "default" | "muted" | "success" | "warning" | "error" | "primary" = 
    color || (isNegative ? "error" : "default")
  
  return (
    <span
      className={cn(
        amountDisplayVariants({ size, weight, color: finalColor }),
        className
      )}
      {...props}
    >
      {showSign && isNegative && "-"}
      {showSign && !isNegative && "+"}
      {currency}{formattedAmount}
    </span>
  )
}

// Specialized components for common use cases
function BalanceAmount({ amount }: { amount: number | string }) {
  return (
    <AmountDisplay
      amount={amount}
      size="lg"
      weight="semibold"
      showSign
    />
  )
}

function TableAmount({ amount }: { amount: number | string }) {
  return (
    <AmountDisplay
      amount={amount}
      size="sm"
      className="text-right"
    />
  )
}

function CardAmount({ amount }: { amount: number | string }) {
  return (
    <AmountDisplay
      amount={amount}
      size="xl"
      weight="bold"
    />
  )
}

function CompactAmount({ amount }: { amount: number | string }) {
  return (
    <AmountDisplay
      amount={amount}
      compact
      size="sm"
      weight="medium"
    />
  )
}

export {
  AmountDisplay,
  amountDisplayVariants,
  BalanceAmount,
  TableAmount,
  CardAmount,
  CompactAmount,
}
