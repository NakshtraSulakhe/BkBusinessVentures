"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
  CalendarIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
  ArrowRightIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ChevronDownIcon,
  ChevronUpIcon
} from "@heroicons/react/24/outline"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  // Main Section
  { 
    name: "Dashboard", 
    href: "/dashboard", 
    icon: HomeIcon, 
    current: true,
    section: "main"
  },
  { 
    name: "Customer Master", 
    href: "/dashboard/customers", 
    icon: UsersIcon, 
    current: false,
    section: "main",
    indent: true
  },
  { 
    name: "Account Master", 
    href: "/dashboard/accounts", 
    icon: BuildingLibraryIcon, 
    current: false,
    section: "main",
    indent: true
  },
  { 
    name: "Ledger", 
    href: "/dashboard/ledger", 
    icon: DocumentTextIcon, 
    current: false,
    section: "main",
    indent: true
  },
  { 
    name: "Suggestions", 
    href: "/dashboard/suggestions", 
    icon: ClipboardDocumentListIcon, 
    current: false,
    section: "main",
    indent: true
  },
  { 
    name: "Users", 
    href: "/dashboard/users", 
    icon: UsersIcon, 
    current: false,
    section: "main",
    indent: true
  },
  { 
    name: "Customer Ledger View", 
    href: "/dashboard/customers/ledger", 
    icon: BookOpenIcon, 
    current: false,
    section: "main",
    indent: true
  },
  { 
    name: "Accounts Master", 
    href: "/dashboard/accounts", 
    icon: BanknotesIcon, 
    current: false,
    section: "main",
    indent: true
  },
  
  // Deposits Section
  { 
    name: "Fixed Deposits (FD)", 
    href: "/dashboard/deposits/fd", 
    icon: BuildingLibraryIcon, 
    current: false,
    section: "deposits"
  },
  { 
    name: "Create FD", 
    href: "/dashboard/deposits/fd/create", 
    icon: DocumentTextIcon, 
    current: false,
    section: "deposits",
    indent: true
  },
  { 
    name: "FD Ledger", 
    href: "/dashboard/deposits/fd/ledger", 
    icon: BookOpenIcon, 
    current: false,
    section: "deposits",
    indent: true
  },
  { 
    name: "Recurring Deposits (RD)", 
    href: "/dashboard/deposits/rd", 
    icon: CurrencyDollarIcon, 
    current: false,
    section: "deposits"
  },
  { 
    name: "Create RD", 
    href: "/dashboard/deposits/rd/create", 
    icon: DocumentTextIcon, 
    current: false,
    section: "deposits",
    indent: true
  },
  { 
    name: "RD Ledger", 
    href: "/dashboard/deposits/rd/ledger", 
    icon: BookOpenIcon, 
    current: false,
    section: "deposits",
    indent: true
  },
  
  // Loans Section
  { 
    name: "Loans", 
    href: "/dashboard/loans", 
    icon: ChartBarIcon, 
    current: false,
    section: "loans"
  },
  { 
    name: "Create Loan", 
    href: "/dashboard/loans/create", 
    icon: DocumentTextIcon, 
    current: false,
    section: "loans",
    indent: true
  },
  { 
    name: "EMI Entry", 
    href: "/dashboard/loans/emi", 
    icon: ReceiptPercentIcon, 
    current: false,
    section: "loans",
    indent: true
  },
  { 
    name: "Loan Ledger", 
    href: "/dashboard/loans/ledger", 
    icon: BookOpenIcon, 
    current: false,
    section: "loans",
    indent: true
  },
  
  // Operations Section
  { 
    name: "Suggestions Queue", 
    href: "/dashboard/operations/suggestions", 
    icon: QueueListIcon, 
    current: false,
    section: "operations"
  },
  { 
    name: "Generate Suggestions (Monthly)", 
    href: "/dashboard/operations/generate-suggestions", 
    icon: ArrowDownTrayIcon, 
    current: false,
    section: "operations",
    indent: true
  },
  { 
    name: "Pending Approvals", 
    href: "/dashboard/operations/pending", 
    icon: ClipboardDocumentListIcon, 
    current: false,
    section: "operations",
    indent: true
  },
  { 
    name: "Rejected Suggestions Log", 
    href: "/dashboard/operations/rejected", 
    icon: XMarkIcon, 
    current: false,
    section: "operations",
    indent: true
  },
  
  // Reports & Documents Section
  { 
    name: "Reports", 
    href: "/dashboard/reports", 
    icon: DocumentIcon, 
    current: false,
    section: "reports"
  },
  { 
    name: "Customer Report", 
    href: "/dashboard/reports/customers", 
    icon: UsersIcon, 
    current: false,
    section: "reports",
    indent: true
  },
  { 
    name: "FD Reports", 
    href: "/dashboard/reports/fd", 
    icon: BuildingLibraryIcon, 
    current: false,
    section: "reports",
    indent: true
  },
  { 
    name: "RD Reports", 
    href: "/dashboard/reports/rd", 
    icon: CurrencyDollarIcon, 
    current: false,
    section: "reports",
    indent: true
  },
  { 
    name: "Loan Reports", 
    href: "/dashboard/reports/loans", 
    icon: ChartBarIcon, 
    current: false,
    section: "reports",
    indent: true
  },
  { 
    name: "Outstanding / EMI Pending", 
    href: "/dashboard/reports/outstanding", 
    icon: ReceiptPercentIcon, 
    current: false,
    section: "reports",
    indent: true
  },
  { 
    name: "Invoices / Receipts", 
    href: "/dashboard/documents/invoices", 
    icon: DocumentTextIcon, 
    current: false,
    section: "reports"
  },
  { 
    name: "Generate Invoice / Receipt", 
    href: "/dashboard/documents/invoices/create", 
    icon: ArrowDownTrayIcon, 
    current: false,
    section: "reports",
    indent: true
  },
  { 
    name: "Invoice / Receipt History", 
    href: "/dashboard/documents/invoices/history", 
    icon: BookOpenIcon, 
    current: false,
    section: "reports",
    indent: true
  },
]

const adminSection = [
  { 
    name: "Settings", 
    href: "/dashboard/settings", 
    icon: CogIcon, 
    current: false,
    section: "admin"
  },
  { 
    name: "Users & Roles", 
    href: "/dashboard/admin/users", 
    icon: UsersIcon, 
    current: false,
    section: "admin",
    indent: true
  },
  { 
    name: "Numbering Templates", 
    href: "/dashboard/settings/numbering-templates", 
    icon: DocumentTextIcon, 
    current: false,
    section: "admin",
    indent: true
  },
  { 
    name: "Default Rules", 
    href: "/dashboard/admin/rules", 
    icon: ClipboardDocumentListIcon, 
    current: false,
    section: "admin",
    indent: true
  },
  { 
    name: "PDF Templates", 
    href: "/dashboard/admin/pdf-templates", 
    icon: DocumentIcon, 
    current: false,
    section: "admin",
    indent: true
  },
  { 
    name: "Audit Log", 
    href: "/dashboard/admin/audit", 
    icon: ClipboardDocumentListIcon, 
    current: false,
    section: "admin"
  },

function renderNavigationItems(items: any[]) {
  const { isAdmin } = useAuth()
  
  return items.map((item) => {
    // Hide admin-only items for non-admin users
    if (item.section === 'admin' && !isAdmin) {
      return null
    }
    
    return (
      <a
        key={item.name}
        href={item.href}
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
          item.indent ? "ml-4 lg:ml-0" : "",
          item.current
            ? "bg-blue-100 text-blue-700 border-l-4 border-blue-700"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        )}
      >
        <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
        <span className="truncate">{item.name}</span>
      </a>
    )
  })
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-50 lg:hidden transition-opacity duration-300",
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 max-w-xs sm:max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">BK Business Ventures</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-4rem)]">
            <SectionHeader title="Main" />
            {renderNavigationItems(navigation.filter(item => item.section === "main"))}
            
            <SectionHeader title="Deposits" />
            {renderNavigationItems(navigation.filter(item => item.section === "deposits"))}
            
            <SectionHeader title="Loans" />
            {renderNavigationItems(navigation.filter(item => item.section === "loans"))}
            
            <SectionHeader title="Operations" />
            {renderNavigationItems(navigation.filter(item => item.section === "operations"))}
            
            <SectionHeader title="Reports" />
            {renderNavigationItems(navigation.filter(item => item.section === "reports"))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-0 lg:z-40">
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
          <div className="flex items-center h-16 px-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">BK Business Ventures</h2>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            <SectionHeader title="Main" />
            {renderNavigationItems(navigation.filter(item => item.section === "main"))}
            
            <SectionHeader title="Deposits" />
            {renderNavigationItems(navigation.filter(item => item.section === "deposits"))}
            
            <SectionHeader title="Loans" />
            {renderNavigationItems(navigation.filter(item => item.section === "loans"))}
            
            <SectionHeader title="Operations" />
            {renderNavigationItems(navigation.filter(item => item.section === "operations"))}
            
            <SectionHeader title="Reports" />
            {renderNavigationItems(navigation.filter(item => item.section === "reports"))}
            
            <SectionHeader title="Admin" />
            {renderNavigationItems(adminSection)}
          </nav>
        </div>
      </div>

      {/* Main content area */}
      <div className="lg:pl-64 flex flex flex-col min-h-screen">
        {/* Top navigation bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        <header className="bg-white shadow-sm border-b hidden lg:block">
          <div className="flex items-center justify-between h-16 px-6">
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome back, {user?.name}
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
