"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
import { TableActions } from "@/components/ui/table-actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui"
import {
  Plus,
  Search,
  User,
  Mail,
  Phone,
  DollarSign,
  Eye,
  Trash2,
  Filter,
  ArrowUp,
  ArrowDown,
  Building2,
  Banknote,
  CreditCard
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { fetchWithAuth } from "@/lib/api"

interface Customer {
  id: string; name: string; email: string; phone: string; address: string; city: string;
  state: string; zipCode: string; panNumber: string; aadhaarNumber: string;
  dateOfBirth: string; occupation: string; annualIncome: number;
  accountType: 'savings' | 'current' | 'fd' | 'rd' | 'loan'; purpose: string;
  isActive: boolean;
  createdAt: string; updatedAt: string;
}

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  savings: { label: "Savings",       cls: "badge-type badge-type-savings" },
  current: { label: "Current",       cls: "badge-type badge-type-current" },
  fd:      { label: "Fixed Deposit", cls: "badge-type badge-type-fd" },
  rd:      { label: "Recurring",     cls: "badge-type badge-type-rd" },
  loan:    { label: "Loan",          cls: "badge-type badge-type-loan" },
}

const STATUS_BADGE: Record<boolean, { label: string; cls: string }> = {
  true:  { label: "Active",   cls: "px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200" },
  false: { label: "Inactive", cls: "px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200" },
}

export default function CustomerMaster() {
  const router = useRouter()
  const { token } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof Customer>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [filterType, setFilterType] = useState('all')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [deleteDialog, setDeleteDialog] = useState<{ show: boolean; id: string; name: string }>({ show: false, id: '', name: '' })

  useEffect(() => { fetchCustomers() }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching customers with token:', token ? 'present' : 'missing')
      const res = await fetchWithAuth('/api/customers', { token })
      console.log('📡 Customer API response status:', res.status)
      
      if (res.ok) { 
        const d = await res.json(); 
        console.log('✅ Customers data received:', d.customers?.length || 0, 'customers')
        setCustomers(d.customers) 
      } else {
        const errorData = await res.json().catch(() => ({}))
        console.error('❌ Customer API error:', res.status, errorData)
        showMsg(errorData.error || 'Failed to fetch customers', 'error')
      }
    } catch (e) { 
      console.error('💥 Fetch customers error:', e)
      showMsg('Network error while fetching customers', 'error')
    } finally { 
      setLoading(false) 
    }
  }

  const showMsg = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type }); setTimeout(() => setMessage(null), 5000)
  }

  const handleSort = (field: keyof Customer) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const confirmDelete = async () => {
    const { id, name } = deleteDialog
    setDeleteDialog({ show: false, id: '', name: '' })
    try {
      const res = await fetchWithAuth(`/api/customers/${id}`, { method: 'DELETE', token })
      if (res.ok) { showMsg(`${name} deleted`, 'success'); setCustomers(c => c.filter(x => x.id !== id)) }
      else { const e = await res.json(); showMsg(e.error || 'Failed', 'error') }
    } catch { showMsg('Failed to delete', 'error') }
  }

  const filtered = customers
    .filter(c => {
      const q = searchTerm.toLowerCase()
      return (c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) ||
        c.phone.includes(q) || c.city.toLowerCase().includes(q)) &&
        (filterType === 'all' || c.accountType === filterType)
    })
    .sort((a, b) => {
      const av = a[sortField], bv = b[sortField]
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  const SortBtn = ({ field, label }: { field: keyof Customer; label: string }) => (
    <button onClick={() => handleSort(field)} className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-primary transition-colors group">
      {label}
      {sortField === field
        ? sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-primary" />
        : <ArrowDown className="h-3 w-3 text-slate-300 group-hover:text-slate-400" />
      }
    </button>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        {message && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <span className="flex-1">{message.text}</span>
            <button onClick={() => setMessage(null)} className="opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        <PageHeader
          title="Customer Management"
          subtitle="Manage customer information and accounts"
          actions={
            <Button onClick={() => router.push('/dashboard/customers/create')} className="finance-gradient-primary text-white h-9 px-4 rounded-xl font-medium shadow-sm">
              <Plus className="h-4 w-4 mr-2" /> New Customer
            </Button>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <StatCard title="Total Customers" value={customers.length} subtitle="All registered" icon={<User />} iconVariant="primary" borderVariant="primary" className="p-4 sm:p-6" />
          <StatCard title="Savings Accounts" value={customers.filter(c => c.accountType === 'savings').length} subtitle="Active savings" icon={<Banknote />} iconVariant="success" borderVariant="success" className="p-4 sm:p-6" />
          <StatCard title="Current Accounts" value={customers.filter(c => c.accountType === 'current').length} subtitle="Business accounts" icon={<Building2 />} iconVariant="info" borderVariant="info" className="p-4 sm:p-6" />
          <StatCard title="Loan Accounts" value={customers.filter(c => c.accountType === 'loan').length} subtitle="Active loans" icon={<CreditCard />} iconVariant="danger" borderVariant="danger" className="p-4 sm:p-6" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search by name, email, phone, or city..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 h-10 border-slate-200 bg-slate-50 focus:bg-white rounded-lg text-sm" />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 w-full sm:min-w-[160px]">
                <option value="all">All Account Types</option>
                <option value="savings">Savings</option>
                <option value="current">Current</option>
                <option value="fd">Fixed Deposit</option>
                <option value="rd">Recurring Deposit</option>
                <option value="loan">Loan</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">Customers <span className="ml-1 text-xs font-normal text-slate-400">({filtered.length})</span></h2>
            {selected.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">{selected.length} selected</span>
                {selected.length === 1 && (
                  <Button size="sm" onClick={() => router.push(`/dashboard/ledger?customerId=${selected[0]}`)} className="h-7 px-3 text-xs finance-gradient-primary text-white rounded-lg">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Transaction
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setSelected([])} className="h-7 px-3 text-xs rounded-lg">Clear</Button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <div className="h-5 w-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-slate-400">Loading customers...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-14 w-14 rounded-2xl finance-icon-bg flex items-center justify-center mx-auto mb-4"><User className="h-7 w-7" /></div>
              <h3 className="text-sm font-semibold text-slate-800">No customers found</h3>
              <p className="text-xs text-slate-400 mt-1">{searchTerm || filterType !== 'all' ? 'Try adjusting your search or filter' : 'Get started by creating your first customer'}</p>
              {!searchTerm && filterType === 'all' && (
                <Button onClick={() => router.push('/dashboard/customers/create')} className="mt-5 finance-gradient-primary text-white h-8 px-4 text-xs rounded-lg">
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> New Customer
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-hidden">
              <Table className="responsive-table">
                <TableHeader>
                  <TableRow className="bg-slate-50/60 hover:bg-slate-50 border-slate-100">
                    <TableHead className="w-10 px-4 sm:px-5">
                      <Checkbox checked={selected.length === filtered.length && filtered.length > 0} onCheckedChange={v => setSelected(v ? filtered.map(c => c.id) : [])} />
                    </TableHead>
                    <TableHead className="px-3 sm:px-4 min-w-[160px] sm:min-w-[200px]"><SortBtn field="name" label="Customer" /></TableHead>
                    <TableHead className="px-3 sm:px-4 min-w-[150px] sm:min-w-[180px] hide-on-mobile"><SortBtn field="email" label="Contact" /></TableHead>
                    <TableHead className="px-3 sm:px-4 min-w-[100px] sm:min-w-[140px]"><SortBtn field="isActive" label="Status" /></TableHead>
                    <TableHead className="px-3 sm:px-4 min-w-[80px] sm:min-w-[100px] text-right"><SortBtn field="annualIncome" label="Income" /></TableHead>
                    <TableHead className="px-3 sm:px-4 min-w-[90px] sm:min-w-[100px] hide-on-tablet"><SortBtn field="createdAt" label="Created" /></TableHead>
                    <TableHead className="px-3 sm:px-4 w-12 sm:w-14 text-right text-[10px] font-black uppercase text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(customer => {
                    const statusBadge = STATUS_BADGE[customer.isActive] ?? { label: customer.isActive ? 'Active' : 'Inactive', cls: "badge-type" }
                    return (
                      <TableRow key={customer.id} className={`border-slate-100 transition-colors ${selected.includes(customer.id) ? 'bg-primary/5' : 'hover:bg-slate-50'} ${!customer.isActive ? 'opacity-60' : ''}`}>
                        <TableCell className="px-5 py-3.5 w-10">
                          <Checkbox checked={selected.includes(customer.id)} onCheckedChange={v => setSelected(prev => v ? [...prev, customer.id] : prev.filter(i => i !== customer.id))} />
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg finance-gradient-primary text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                              {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-slate-900 truncate">{customer.name}</div>
                              <div className="text-xs text-slate-400 truncate">{customer.occupation || '—'}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-slate-600"><Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" /><span className="truncate max-w-[150px]">{customer.email}</span></div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400"><Phone className="h-3.5 w-3.5 flex-shrink-0" />{customer.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3.5"><span className={statusBadge.cls}>{statusBadge.label}</span></TableCell>
                        <TableCell className="px-4 py-3.5 text-right">
                          <span className="text-sm font-semibold text-slate-800 tabular-nums">{customer.annualIncome ? `₹${(customer.annualIncome / 1000).toFixed(0)}K` : '—'}</span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <span className="text-xs text-slate-500">{new Date(customer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-right">
                          <TableActions actions={[
                            { label: "View Details", icon: <Eye />, onClick: () => router.push(`/dashboard/customers/${customer.id}`) },
                            { label: "Add Transaction", icon: <Plus />, onClick: () => router.push(`/dashboard/ledger?customerId=${customer.id}`) },
                            { label: "Delete", icon: <Trash2 />, onClick: () => setDeleteDialog({ show: true, id: customer.id, name: customer.name }), variant: "danger", separator: true },
                          ]} />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {deleteDialog.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteDialog({ show: false, id: '', name: '' })} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full mx-4 p-6 animate-fade-in-up">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-50 rounded-xl mb-4"><Trash2 className="h-6 w-6 text-red-500" /></div>
            <h3 className="text-base font-semibold text-slate-900 text-center">Delete Customer?</h3>
            <p className="text-sm text-slate-500 text-center mt-2 mb-6">This will permanently delete <span className="font-semibold text-slate-700">{deleteDialog.name}</span> and all associated data.</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDeleteDialog({ show: false, id: '', name: '' })} className="flex-1 border-slate-200 rounded-xl h-10">Cancel</Button>
              <Button onClick={confirmDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl h-10"><Trash2 className="h-4 w-4 mr-2" />Delete</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
