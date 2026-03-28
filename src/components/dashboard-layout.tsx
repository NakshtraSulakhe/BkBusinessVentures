"use client"

import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

import {
  HomeIcon,
  UsersIcon,
  BuildingLibraryIcon,
  BookOpenIcon,
  DocumentTextIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ReceiptPercentIcon,
  QueueListIcon,
  ArrowDownTrayIcon,
  CogIcon,
  ClipboardDocumentListIcon,
  DocumentIcon,
  XMarkIcon,
  UserIcon,
  BellIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline"

import { usePathname } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import {
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
} from "@/components/ui/sidebar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DashboardLayoutProps {
  children: React.ReactNode
}

// Navigation data
const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon, section: "main" },
  { name: "Customer Master", href: "/dashboard/customers", icon: UsersIcon, section: "main", indent: true },
  { name: "Account Master", href: "/dashboard/accounts", icon: BuildingLibraryIcon, section: "main", indent: true },
  { name: "Ledger", href: "/dashboard/ledger", icon: DocumentTextIcon, section: "main", indent: true },
  { name: "Suggestions", href: "/dashboard/suggestions", icon: ClipboardDocumentListIcon, section: "main", indent: true },
  { name: "Users", href: "/dashboard/users", icon: UsersIcon, section: "main", indent: true },
  { name: "Customer Ledger View", href: "/dashboard/customers/ledger", icon: BookOpenIcon, section: "main", indent: true },

  { name: "Fixed Deposits (FD)", href: "/dashboard/deposits/fd", icon: BuildingLibraryIcon, section: "deposits" },
  { name: "Create FD", href: "/dashboard/deposits/fd/create", icon: DocumentTextIcon, section: "deposits", indent: true },
  { name: "FD Ledger", href: "/dashboard/deposits/fd/ledger", icon: BookOpenIcon, section: "deposits", indent: true },
  { name: "Recurring Deposits (RD)", href: "/dashboard/deposits/rd", icon: CurrencyDollarIcon, section: "deposits" },
  { name: "Create RD", href: "/dashboard/deposits/rd/create", icon: DocumentTextIcon, section: "deposits", indent: true },
  { name: "RD Ledger", href: "/dashboard/deposits/rd/ledger", icon: BookOpenIcon, section: "deposits", indent: true },

  { name: "Loans", href: "/dashboard/loans", icon: ChartBarIcon, section: "loans" },
  { name: "Create Loan", href: "/dashboard/loans/create", icon: DocumentTextIcon, section: "loans", indent: true },
  { name: "EMI Entry", href: "/dashboard/loans/emi", icon: ReceiptPercentIcon, section: "loans", indent: true },
  { name: "Loan Ledger", href: "/dashboard/loans/ledger", icon: BookOpenIcon, section: "loans", indent: true },

  { name: "Suggestions Queue", href: "/dashboard/operations/suggestions", icon: QueueListIcon, section: "operations" },
  { name: "Generate Suggestions", href: "/dashboard/operations/generate-suggestions", icon: ArrowDownTrayIcon, section: "operations", indent: true },
  { name: "Pending Approvals", href: "/dashboard/operations/pending", icon: ClipboardDocumentListIcon, section: "operations", indent: true },
  { name: "Rejected Log", href: "/dashboard/operations/rejected", icon: XMarkIcon, section: "operations", indent: true },

  { name: "Reports", href: "/dashboard/reports", icon: DocumentIcon, section: "reports" },
  { name: "Customer Report", href: "/dashboard/reports/customers", icon: UsersIcon, section: "reports", indent: true },
  { name: "FD Reports", href: "/dashboard/reports/fd", icon: BuildingLibraryIcon, section: "reports", indent: true },
  { name: "RD Reports", href: "/dashboard/reports/rd", icon: CurrencyDollarIcon, section: "reports", indent: true },
  { name: "Loan Reports", href: "/dashboard/reports/loans", icon: ChartBarIcon, section: "reports", indent: true },
  { name: "Outstanding / EMI Pending", href: "/dashboard/reports/outstanding", icon: ReceiptPercentIcon, section: "reports", indent: true },
  { name: "Invoices / Receipts", href: "/dashboard/documents/invoices", icon: DocumentTextIcon, section: "reports" },
  { name: "Generate Invoice", href: "/dashboard/documents/invoices/create", icon: ArrowDownTrayIcon, section: "reports", indent: true },
  { name: "Invoice History", href: "/dashboard/documents/invoices/history", icon: BookOpenIcon, section: "reports", indent: true },
]

const adminSection = [
  { name: "Settings", href: "/dashboard/settings", icon: CogIcon, section: "admin" },
  { name: "Users & Roles", href: "/dashboard/admin/users", icon: UsersIcon, section: "admin", indent: true },
  { name: "Numbering Templates", href: "/dashboard/settings/numbering-templates", icon: DocumentTextIcon, section: "admin", indent: true },
  { name: "Default Rules", href: "/dashboard/admin/rules", icon: ClipboardDocumentListIcon, section: "admin", indent: true },
  { name: "PDF Templates", href: "/dashboard/admin/pdf-templates", icon: DocumentIcon, section: "admin", indent: true },
  { name: "Audit Log", href: "/dashboard/admin/audit", icon: ClipboardDocumentListIcon, section: "admin", indent: true },
  { name: "Ledger Edits", href: "/dashboard/admin/audit/ledger", icon: BookOpenIcon, section: "admin", indent: true },
  { name: "Suggestions Runs", href: "/dashboard/admin/audit/suggestions", icon: QueueListIcon, section: "admin", indent: true },
  { name: "Account Closure", href: "/dashboard/admin/closure", icon: XMarkIcon, section: "admin" },
  { name: "Close Account", href: "/dashboard/admin/closure/close", icon: XMarkIcon, section: "admin" },
  { name: "Reopen Account", href: "/dashboard/admin/closure/reopen", icon: UserIcon, section: "admin", indent: true },
]

// Map pathname prefix → page title for topbar
const pageTitleMap: Record<string, string> = {
  "/dashboard/customers/create": "New Customer",
  "/dashboard/customers/ledger": "Customer Ledger",
  "/dashboard/customers": "Customer Master",
  "/dashboard/accounts/create": "Create Account",
  "/dashboard/accounts": "Account Master",
  "/dashboard/deposits/fd/create": "Create Fixed Deposit",
  "/dashboard/deposits/fd/ledger": "FD Ledger",
  "/dashboard/deposits/fd": "Fixed Deposits",
  "/dashboard/deposits/rd/create": "Create Recurring Deposit",
  "/dashboard/deposits/rd/ledger": "RD Ledger",
  "/dashboard/deposits/rd": "Recurring Deposits",
  "/dashboard/loans/create": "Create Loan",
  "/dashboard/loans/emi": "EMI Entry",
  "/dashboard/loans/ledger": "Loan Ledger",
  "/dashboard/loans": "Loans",
  "/dashboard/ledger": "Ledger",
  "/dashboard/reports/customers": "Customer Report",
  "/dashboard/reports/fd": "FD Reports",
  "/dashboard/reports/rd": "RD Reports",
  "/dashboard/reports/loans": "Loan Reports",
  "/dashboard/reports/outstanding": "Outstanding / EMI Pending",
  "/dashboard/reports": "Reports",
  "/dashboard/operations/suggestions": "Suggestions Queue",
  "/dashboard/operations/generate-suggestions": "Generate Suggestions",
  "/dashboard/operations/pending": "Pending Approvals",
  "/dashboard/operations/rejected": "Rejected Log",
  "/dashboard/settings": "Settings",
  "/dashboard/users": "Users",
  "/dashboard": "Dashboard",
}

function getPageTitle(pathname: string): string {
  // Try exact match first, then prefix match (longest first)
  if (pageTitleMap[pathname]) return pageTitleMap[pathname]
  const sorted = Object.keys(pageTitleMap).sort((a, b) => b.length - a.length)
  for (const key of sorted) {
    if (pathname.startsWith(key)) return pageTitleMap[key]
  }
  return "Dashboard"
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isAdmin, logout } = useAuth()
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)

  const renderItems = (flatItems: any[]) => {
    const groupedItems: any[] = []
    let currentParent: any = null

    flatItems.forEach(item => {
      const isActive = pathname === item.href
      const itemWithActive = { ...item, current: isActive }

      if (item.indent && currentParent) {
        if (!currentParent.items) currentParent.items = []
        currentParent.items.push(itemWithActive)
      } else {
        currentParent = { ...itemWithActive, items: [] }
        groupedItems.push(currentParent)
      }
    })

    return (
      <SidebarMenu>
        {groupedItems.map((item) => {
          const hasChildren = item.items && item.items.length > 0
          const isParentActive = item.current || (hasChildren && item.items.some((i: any) => i.current))

          if (hasChildren) {
            return (
              <Collapsible
                key={item.name}
                asChild
                defaultOpen={isParentActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      isActive={isParentActive}
                      tooltip={item.name}
                      className={cn(
                        "rounded-lg transition-colors",
                        isParentActive
                          ? "bg-primary/8 text-primary border-l-[3px] border-l-primary font-medium pl-[calc(0.75rem-3px)]"
                          : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                      )}
                    >
                      <item.icon className={cn(
                        "h-4 w-4 flex-shrink-0",
                        isParentActive ? "text-primary" : "text-slate-400"
                      )} />
                      <span>{item.name}</span>
                      <ChevronRightIcon className="ml-auto h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-slate-400" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem: any) => (
                        <SidebarMenuSubItem key={subItem.name}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={subItem.current}
                            className={cn(
                              "rounded-lg transition-colors text-slate-500",
                              subItem.current
                                ? "bg-primary/8 text-primary border-l-[3px] border-l-primary font-medium pl-[calc(0.75rem-3px)]"
                                : "hover:bg-slate-50 hover:text-slate-800"
                            )}
                          >
                            <a href={subItem.href}>
                              <span>{subItem.name}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          }

          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                isActive={item.current}
                tooltip={item.name}
                className={cn(
                  "rounded-lg transition-colors",
                  item.current
                    ? "bg-primary/8 text-primary border-l-[3px] border-l-primary font-medium pl-[calc(0.75rem-3px)]"
                    : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                )}
              >
                <a href={item.href} className="flex items-center gap-2">
                  <item.icon className={cn(
                    "h-4 w-4 flex-shrink-0",
                    item.current ? "text-primary" : "text-slate-400"
                  )} />
                  <span>{item.name}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    )
  }

  return (
    <SidebarProvider>
      {/* Sidebar */}
      <Sidebar collapsible="icon">
        <SidebarHeader className="h-16 flex items-center justify-center border-b border-sidebar-border px-4 py-2">
          <div className="flex w-full items-center gap-2.5 overflow-hidden">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg finance-gradient-primary text-white flex-shrink-0">
              <BuildingLibraryIcon className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight overflow-hidden">
              <span className="truncate font-bold text-slate-900">BK Business</span>
              <span className="truncate text-xs text-slate-400 font-medium">Ventures</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="gap-0">
          {/* MAIN */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold px-3 py-2">
              Main
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {renderItems(navigation.filter(i => i.section === "main"))}
            </SidebarGroupContent>
          </SidebarGroup>

          {/* DEPOSITS */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold px-3 py-2">
              Deposits
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {renderItems(navigation.filter(i => i.section === "deposits"))}
            </SidebarGroupContent>
          </SidebarGroup>

          {/* LOANS */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold px-3 py-2">
              Loans
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {renderItems(navigation.filter(i => i.section === "loans"))}
            </SidebarGroupContent>
          </SidebarGroup>

          {/* OPERATIONS */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold px-3 py-2">
              Operations
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {renderItems(navigation.filter(i => i.section === "operations"))}
            </SidebarGroupContent>
          </SidebarGroup>

          {/* REPORTS */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold px-3 py-2">
              Reports
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {renderItems(navigation.filter(i => i.section === "reports"))}
            </SidebarGroupContent>
          </SidebarGroup>

          {/* ADMIN */}
          {isAdmin() && (
            <SidebarGroup className="border-t border-sidebar-border mt-2 pt-2">
              <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold px-3 py-2">
                Admin
              </SidebarGroupLabel>
              <SidebarGroupContent>
                {renderItems(adminSection)}
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>
      </Sidebar>

      {/* Main Content */}
      <SidebarInset className="flex flex-col h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-5 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="text-slate-400 hover:text-slate-700 transition-colors" />
            <div className="h-5 w-px bg-slate-200 hidden sm:block" />
            <span className="text-sm font-semibold text-slate-800 hidden sm:block tracking-tight">
              {pageTitle}
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Global search */}
            <div className="relative hidden md:block">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Quick search..."
                className="h-8 pl-9 pr-3 w-52 text-xs bg-slate-50 border-slate-200 rounded-lg focus:bg-white focus:w-64 transition-all duration-200"
              />
            </div>

            {/* Notification bell */}
            <Button variant="ghost" size="icon" className="relative h-8 w-8 text-slate-400 hover:text-slate-700 rounded-lg">
              <BellIcon className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-red-500" />
            </Button>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full ring-1 ring-slate-200 hover:ring-primary/30 transition-all p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-xl shadow-lg border border-slate-200" align="end">
                <DropdownMenuLabel className="font-normal px-3 py-2">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-semibold text-slate-900">{user?.name || "User"}</p>
                    <p className="text-xs text-slate-500">{user?.email || "user@example.com"}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer rounded-lg mx-1 text-slate-700">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer rounded-lg mx-1 text-slate-700">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer rounded-lg mx-1 mb-1"
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}