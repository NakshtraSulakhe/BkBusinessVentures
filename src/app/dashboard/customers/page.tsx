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
  PlusIcon, MagnifyingGlassIcon, UserIcon, EnvelopeIcon, PhoneIcon,
  CurrencyDollarIcon, EyeIcon, TrashIcon, FunnelIcon, ArrowDownIcon,
  ArrowUpIcon, BuildingLibraryIcon, BanknotesIcon, CreditCardIcon,
} from "@heroicons/react/24/outline"

interface Customer {
  id: string; name: string; email: string; phone: string; address: string; city: string;
  state: string; zipCode: string; panNumber: string; aadhaarNumber: string;
  dateOfBirth: string; occupation: string; annualIncome: number;
  accountType: 'savings' | 'current' | 'fd' | 'rd' | 'loan'; purpose: string;
  createdAt: string; updatedAt: string;
}

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  savings: { label: "Savings",       cls: "badge-type badge-type-savings" },
  current: { label: "Current",       cls: "badge-type badge-type-current" },
  fd:      { label: "Fixed Deposit", cls: "badge-type badge-type-fd" },
  rd:      { label: "Recurring",     cls: "badge-type badge-type-rd" },
  loan:    { label: "Loan",          cls: "badge-type badge-type-loan" },
}

export default function CustomerMaster() {
  const router = useRouter()
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
      const res = await fetch('/api/customers')
      if (res.ok) { const d = await res.json(); setCustomers(d.customers) }
    } catch (e) { console.error(e) } finally { setLoading(false) }
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
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' })
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
        ? sortDir === 'asc' ? <ArrowUpIcon className="h-3 w-3 text-primary" /> : <ArrowDownIcon className="h-3 w-3 text-primary" />
        : <ArrowDownIcon className="h-3 w-3 text-slate-300 group-hover:text-slate-400" />
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
              <PlusIcon className="h-4 w-4 mr-2" /> New Customer
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard title="Total Customers" value={customers.length} subtitle="All registered" icon={<UserIcon />} iconVariant="primary" borderVariant="primary" />
          <StatCard title="Savings Accounts" value={customers.filter(c => c.accountType === 'savings').length} subtitle="Active savings" icon={<BanknotesIcon />} iconVariant="success" borderVariant="success" />
          <StatCard title="Current Accounts" value={customers.filter(c => c.accountType === 'current').length} subtitle="Business accounts" icon={<BuildingLibraryIcon />} iconVariant="info" borderVariant="info" />
          <StatCard title="Loan Accounts" value={customers.filter(c => c.accountType === 'loan').length} subtitle="Active loans" icon={<CreditCardIcon />} iconVariant="danger" borderVariant="danger" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search by name, email, phone, or city..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 h-10 border-slate-200 bg-slate-50 focus:bg-white rounded-lg text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[160px]">
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
                    <PlusIcon className="h-3.5 w-3.5 mr-1" /> Add Transaction
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
              <div className="h-14 w-14 rounded-2xl finance-icon-bg flex items-center justify-center mx-auto mb-4"><UserIcon className="h-7 w-7" /></div>
              <h3 className="text-sm font-semibold text-slate-800">No customers found</h3>
              <p className="text-xs text-slate-400 mt-1">{searchTerm || filterType !== 'all' ? 'Try adjusting your search or filter' : 'Get started by creating your first customer'}</p>
              {!searchTerm && filterType === 'all' && (
                <Button onClick={() => router.push('/dashboard/customers/create')} className="mt-5 finance-gradient-primary text-white h-8 px-4 text-xs rounded-lg">
                  <PlusIcon className="h-3.5 w-3.5 mr-1.5" /> New Customer
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/60 hover:bg-slate-50 border-slate-100">
                    <TableHead className="w-10 px-5">
                      <Checkbox checked={selected.length === filtered.length && filtered.length > 0} onCheckedChange={v => setSelected(v ? filtered.map(c => c.id) : [])} />
                    </TableHead>
                    <TableHead className="px-4 min-w-[200px]"><SortBtn field="name" label="Customer" /></TableHead>
                    <TableHead className="px-4 min-w-[180px]"><SortBtn field="email" label="Contact" /></TableHead>
                    <TableHead className="px-4 min-w-[140px]"><SortBtn field="accountType" label="Account Type" /></TableHead>
                    <TableHead className="px-4 min-w-[100px] text-right"><SortBtn field="annualIncome" label="Income" /></TableHead>
                    <TableHead className="px-4 min-w-[100px]"><SortBtn field="createdAt" label="Created" /></TableHead>
                    <TableHead className="px-4 w-14 text-right text-xs font-semibold text-slate-600">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(customer => {
                    const badge = TYPE_BADGE[customer.accountType] ?? { label: customer.accountType, cls: "badge-type" }
                    return (
                      <TableRow key={customer.id} className={`border-slate-100 transition-colors ${selected.includes(customer.id) ? 'bg-primary/5' : 'hover:bg-slate-50'}`}>
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
                            <div className="flex items-center gap-1.5 text-xs text-slate-600"><EnvelopeIcon className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" /><span className="truncate max-w-[150px]">{customer.email}</span></div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400"><PhoneIcon className="h-3.5 w-3.5 flex-shrink-0" />{customer.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3.5"><span className={badge.cls}>{badge.label}</span></TableCell>
                        <TableCell className="px-4 py-3.5 text-right">
                          <span className="text-sm font-semibold text-slate-800 tabular-nums">{customer.annualIncome ? `₹${(customer.annualIncome / 1000).toFixed(0)}K` : '—'}</span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <span className="text-xs text-slate-500">{new Date(customer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-right">
                          <TableActions actions={[
                            { label: "View Details", icon: <EyeIcon />, onClick: () => router.push(`/dashboard/customers/${customer.id}`) },
                            { label: "Add Transaction", icon: <PlusIcon />, onClick: () => router.push(`/dashboard/ledger?customerId=${customer.id}`) },
                            { label: "Delete", icon: <TrashIcon />, onClick: () => setDeleteDialog({ show: true, id: customer.id, name: customer.name }), variant: "danger", separator: true },
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
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-50 rounded-xl mb-4"><TrashIcon className="h-6 w-6 text-red-500" /></div>
            <h3 className="text-base font-semibold text-slate-900 text-center">Delete Customer?</h3>
            <p className="text-sm text-slate-500 text-center mt-2 mb-6">This will permanently delete <span className="font-semibold text-slate-700">{deleteDialog.name}</span> and all associated data.</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDeleteDialog({ show: false, id: '', name: '' })} className="flex-1 border-slate-200 rounded-xl h-10">Cancel</Button>
              <Button onClick={confirmDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl h-10"><TrashIcon className="h-4 w-4 mr-2" />Delete</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
