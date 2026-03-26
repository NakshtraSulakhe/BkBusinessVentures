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
  CreditCardIcon,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  // Main Section
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon, current: true, section: "main" },
  { name: "Customer Master", href: "/dashboard/customers", icon: UsersIcon, current: false, section: "main", indent: true },
  { name: "Account Master", href: "/dashboard/accounts", icon: BuildingLibraryIcon, current: false, section: "main", indent: true },
  { name: "Ledger", href: "/dashboard/ledger", icon: DocumentTextIcon, current: false, section: "main", indent: true },
  { name: "Suggestions", href: "/dashboard/suggestions", icon: ClipboardDocumentListIcon, current: false, section: "main", indent: true },
  { name: "Users", href: "/dashboard/users", icon: UsersIcon, current: false, section: "main", indent: true },
  { name: "Customer Ledger View", href: "/dashboard/customers/ledger", icon: BookOpenIcon, current: false, section: "main", indent: true },
  // { name: "Accounts Master", href: "/dashboard/accounts", icon: BanknotesIcon, current: false, section: "main", indent: true },  

  // Deposits Section
  { name: "Fixed Deposits (FD)", href: "/dashboard/deposits/fd", icon: BuildingLibraryIcon, current: false, section: "deposits" },
  { name: "Create FD", href: "/dashboard/deposits/fd/create", icon: DocumentTextIcon, current: false, section: "deposits", indent: true },
  { name: "FD Ledger", href: "/dashboard/deposits/fd/ledger", icon: BookOpenIcon, current: false, section: "deposits", indent: true },
  { name: "Recurring Deposits (RD)", href: "/dashboard/deposits/rd", icon: CurrencyDollarIcon, current: false, section: "deposits" },
  { name: "Create RD", href: "/dashboard/deposits/rd/create", icon: DocumentTextIcon, current: false, section: "deposits", indent: true },
  { name: "RD Ledger", href: "/dashboard/deposits/rd/ledger", icon: BookOpenIcon, current: false, section: "deposits", indent: true },

  // Loans Section
  { name: "Loans", href: "/dashboard/loans", icon: ChartBarIcon, current: false, section: "loans" },
  { name: "Create Loan", href: "/dashboard/loans/create", icon: DocumentTextIcon, current: false, section: "loans", indent: true },
  { name: "EMI Entry", href: "/dashboard/loans/emi", icon: ReceiptPercentIcon, current: false, section: "loans", indent: true },
  { name: "Loan Ledger", href: "/dashboard/loans/ledger", icon: BookOpenIcon, current: false, section: "loans", indent: true },

  // Operations Section
  { name: "Suggestions Queue", href: "/dashboard/operations/suggestions", icon: QueueListIcon, current: false, section: "operations" },
  { name: "Generate Suggestions (Monthly)", href: "/dashboard/operations/generate-suggestions", icon: ArrowDownTrayIcon, current: false, section: "operations", indent: true },
  { name: "Pending Approvals", href: "/dashboard/operations/pending", icon: ClipboardDocumentListIcon, current: false, section: "operations", indent: true },
  { name: "Rejected Suggestions Log", href: "/dashboard/operations/rejected", icon: XMarkIcon, current: false, section: "operations", indent: true },

  // Reports & Documents Section
  { name: "Reports", href: "/dashboard/reports", icon: DocumentIcon, current: false, section: "reports" },
  { name: "Customer Report", href: "/dashboard/reports/customers", icon: UsersIcon, current: false, section: "reports", indent: true },
  { name: "FD Reports", href: "/dashboard/reports/fd", icon: BuildingLibraryIcon, current: false, section: "reports", indent: true },
  { name: "RD Reports", href: "/dashboard/reports/rd", icon: CurrencyDollarIcon, current: false, section: "reports", indent: true },
  { name: "Loan Reports", href: "/dashboard/reports/loans", icon: ChartBarIcon, current: false, section: "reports", indent: true },
  { name: "Outstanding / EMI Pending", href: "/dashboard/reports/outstanding", icon: ReceiptPercentIcon, current: false, section: "reports", indent: true },
  { name: "Invoices / Receipts", href: "/dashboard/documents/invoices", icon: DocumentTextIcon, current: false, section: "reports" },
  { name: "Generate Invoice / Receipt", href: "/dashboard/documents/invoices/create", icon: ArrowDownTrayIcon, current: false, section: "reports", indent: true },
  { name: "Invoice / Receipt History", href: "/dashboard/documents/invoices/history", icon: BookOpenIcon, current: false, section: "reports", indent: true },
]

const adminSection = [
  { name: "Settings", href: "/dashboard/settings", icon: CogIcon, current: false, section: "admin" },
  { name: "Users & Roles", href: "/dashboard/admin/users", icon: UsersIcon, current: false, section: "admin", indent: true },
  { name: "Numbering Templates", href: "/dashboard/settings/numbering-templates", icon: DocumentTextIcon, current: false, section: "admin", indent: true },
  { name: "Default Rules", href: "/dashboard/admin/rules", icon: ClipboardDocumentListIcon, current: false, section: "admin", indent: true },
  { name: "PDF Templates", href: "/dashboard/admin/pdf-templates", icon: DocumentIcon, current: false, section: "admin", indent: true },
  { name: "Audit Log", href: "/dashboard/admin/audit", icon: ClipboardDocumentListIcon, current: false, section: "admin", indent: true },
  { name: "Ledger Edits", href: "/dashboard/admin/audit/ledger", icon: BookOpenIcon, current: false, section: "admin", indent: true },
  { name: "Suggestions Runs", href: "/dashboard/admin/audit/suggestions", icon: QueueListIcon, current: false, section: "admin", indent: true },
  { name: "Account Closure", href: "/dashboard/admin/closure", icon: XMarkIcon, current: false, section: "admin" },
  { name: "Close Account", href: "/dashboard/admin/closure/close", icon: XMarkIcon, current: false, section: "admin" },
  { name: "Reopen Account", href: "/dashboard/admin/closure/reopen", icon: UserIcon, current: false, section: "admin", indent: true },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isAdmin, logout } = useAuth()

  const pathname = usePathname()

  const renderItems = (flatItems: any[]) => {
    // Group items into parents and children based on the `indent` field
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
                      className={cn(isParentActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium")}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                      <ChevronRightIcon className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem: any) => (
                        <SidebarMenuSubItem key={subItem.name}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={subItem.current}
                            className={cn(subItem.current && "bg-sidebar-accent text-sidebar-accent-foreground font-medium")}
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

          // Render normal item without children
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                isActive={item.current}
                tooltip={item.name}
                className={cn(item.current && "bg-sidebar-accent text-sidebar-accent-foreground font-medium")}
              >
                <a href={item.href} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
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
          <div className="flex w-full items-center gap-2 overflow-hidden">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-sidebar-primary-foreground">
              <BuildingLibraryIcon className="size-4 text-white" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-foreground">BK Business</span>
              <span className="truncate text-xs text-muted-foreground">Ventures</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>

          {/* MAIN */}
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarGroupContent>
              {renderItems(navigation.filter(i => i.section === "main"))}
            </SidebarGroupContent>
          </SidebarGroup>

          {/* DEPOSITS */}
          <SidebarGroup>
            <SidebarGroupLabel>Deposits</SidebarGroupLabel>
            <SidebarGroupContent>
              {renderItems(navigation.filter(i => i.section === "deposits"))}
            </SidebarGroupContent>
          </SidebarGroup>

          {/* LOANS */}
          <SidebarGroup>
            <SidebarGroupLabel>Loans</SidebarGroupLabel>
            <SidebarGroupContent>
              {renderItems(navigation.filter(i => i.section === "loans"))}
            </SidebarGroupContent>
          </SidebarGroup>

          {/* OPERATIONS */}
          <SidebarGroup>
            <SidebarGroupLabel>Operations</SidebarGroupLabel>
            <SidebarGroupContent>
              {renderItems(navigation.filter(i => i.section === "operations"))}
            </SidebarGroupContent>
          </SidebarGroup>

          {/* REPORTS */}
          <SidebarGroup>
            <SidebarGroupLabel>Reports</SidebarGroupLabel>
            <SidebarGroupContent>
              {renderItems(navigation.filter(i => i.section === "reports"))}
            </SidebarGroupContent>
          </SidebarGroup>

          {/* ADMIN */}
          {isAdmin() && (
            <SidebarGroup>
              <SidebarGroupLabel>Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                {renderItems(adminSection)}
              </SidebarGroupContent>
            </SidebarGroup>
          )}

        </SidebarContent>
      </Sidebar>

      {/* Main Content */}
      <SidebarInset>
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
            <div className="h-6 w-px bg-border hidden sm:block" />
            <h1 className="text-lg font-semibold tracking-tight text-foreground sm:block hidden">
              Dashboard Overview
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-background" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-1 ring-border focus-visible:ring-2 focus-visible:ring-offset-2">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-500 focus:text-red-500 cursor-pointer">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}