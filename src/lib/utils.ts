import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Hydration-safe date formatting - uses fixed format to avoid SSR mismatches
export function formatDateSafe(date: string | Date | null | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  
  // Use fixed format: DD MMM YYYY (e.g., 12 Apr 2025)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const day = d.getDate()
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  
  return `${day} ${month} ${year}`
}

// Hydration-safe time formatting - uses fixed format to avoid SSR mismatches
export function formatTimeSafe(date: string | Date | null | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  
  // Use fixed format: HH:MM (e.g., 14:30)
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  
  return `${hours}:${minutes}`
}

// Hydration-safe short date format (e.g., 01 Apr)
export function formatShortDate(date: string | Date | null | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const day = d.getDate().toString().padStart(2, '0')
  const month = months[d.getMonth()]
  
  return `${day} ${month}`
}

// Currency formatting for Indian Rupees
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '0'
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
