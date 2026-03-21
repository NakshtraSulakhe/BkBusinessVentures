export const APP_CONFIG = {
  name: 'BK Business Ventures',
  description: 'Financial Management Platform',
  version: '1.0.0',
} as const

export const SIDEBAR_ITEMS = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    title: 'Accounts',
    href: '/dashboard/accounts',
    icon: 'CreditCard',
  },
  {
    title: 'Transactions',
    href: '/dashboard/transactions',
    icon: 'ArrowUpDown',
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: 'BarChart3',
  },
  {
    title: 'Invoices',
    href: '/dashboard/invoices',
    icon: 'FileText',
  },
  {
    title: 'Reports',
    href: '/dashboard/reports',
    icon: 'FileBarChart',
  },
] as const

export const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'success', label: 'Success' },
] as const

export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
] as const

export const DATE_FORMATS = {
  short: 'MM/dd/yyyy',
  long: 'MMMM dd, yyyy',
  withTime: 'MM/dd/yyyy HH:mm',
  iso: 'yyyy-MM-dd',
} as const

export const PAGINATION = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
} as const

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const
