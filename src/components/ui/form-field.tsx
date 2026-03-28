"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const formFieldVariants = cva(
  "space-y-2",
  {
    variants: {
      layout: {
        default: "",
        horizontal: "flex items-center gap-4 space-y-0",
        inline: "flex items-center gap-2 space-y-0",
      },
    },
    defaultVariants: {
      layout: "default",
    },
  }
)

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof formFieldVariants> {
  label?: string
  description?: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

function FormField({
  className,
  layout,
  label,
  description,
  error,
  required,
  children,
  ...props
}: FormFieldProps) {
  return (
    <div
      data-slot="form-field"
      className={cn(formFieldVariants({ layout }), className)}
      {...props}
    >
      {label && (
        <label className={cn(
          "text-sm font-medium text-foreground",
          layout === "horizontal" && "min-w-0 flex-shrink-0",
          layout === "inline" && "text-xs"
        )}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <div className="flex-1 space-y-2">
        {children}
        
        {description && !error && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
        
        {error && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-destructive/20 text-destructive text-[10px] flex items-center justify-center">!</span>
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

export { FormField, formFieldVariants }
