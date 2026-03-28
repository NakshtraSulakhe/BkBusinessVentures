"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"

export interface TableAction {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  variant?: "default" | "danger"
  separator?: boolean
}

interface TableActionsProps {
  actions: TableAction[]
}

export function TableActions({ actions }: TableActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
        >
          <EllipsisHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-lg border border-slate-200">
        {actions.map((action, i) => (
          <React.Fragment key={i}>
            {action.separator && i > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={action.onClick}
              className={cn(
                "flex items-center gap-2 text-sm cursor-pointer rounded-lg mx-1 px-3",
                action.variant === "danger"
                  ? "text-red-600 focus:text-red-600 focus:bg-red-50"
                  : "text-slate-700 focus:bg-slate-50"
              )}
            >
              {action.icon && (
                <span className="[&>svg]:h-4 [&>svg]:w-4 opacity-70">{action.icon}</span>
              )}
              {action.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
