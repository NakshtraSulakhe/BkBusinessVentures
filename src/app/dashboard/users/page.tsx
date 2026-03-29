"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
import { TableActions } from "@/components/ui/table-actions"
import {
  PlusIcon, 
  MagnifyingGlassIcon, 
  UserIcon, 
  CheckCircleIcon,
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  BoltIcon
} from "@heroicons/react/24/outline"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface User {
  id: string; 
  email: string; 
  name: string | null; 
  role: string; 
  isActive: boolean; 
  createdAt: string;
}

function UsersContent() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null)

  useEffect(() => { 
    setMounted(true)
    fetchUsers() 
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const res = await fetch('/api/auth/users', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      })
      if (res.ok) { 
        const d = await res.json()
        setUsers(d || []) 
      }
    } catch (e) { 
      console.error(e) 
    } finally { 
      setLoading(false) 
    }
  }

  const handleToggle = async (userId: string, current: boolean) => {
    try {
      const token = localStorage.getItem('auth_token')
      await fetch(`/api/auth/users/${userId}`, { 
        method: 'PATCH', 
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        }, 
        body: JSON.stringify({ isActive: !current }) 
      })
      fetchUsers()
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = (userId: string) => {
    setUserIdToDelete(userId)
    setIsConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!userIdToDelete) return
    try {
      const token = localStorage.getItem('auth_token')
      await fetch(`/api/auth/users/${userIdToDelete}`, { 
        method: 'DELETE', 
        headers: { 'Authorization': `Bearer ${token}` } 
      })
      fetchUsers()
    } catch (e) {
      console.error(e)
    } finally {
      setIsConfirmOpen(false)
      setUserIdToDelete(null)
    }
  }

  const filtered = users.filter(u => {
    const q = searchTerm.toLowerCase()
    return (u.name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
      (roleFilter === 'all' || u.role === roleFilter) &&
      (statusFilter === 'all' || (statusFilter === 'active' && u.isActive) || (statusFilter === 'inactive' && !u.isActive))
  })

  if (!mounted) return null

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <PageHeader
        title="User Management"
        subtitle="Manage user accounts and access permissions"
        actions={
          isAdmin() ? (
            <Button 
               onClick={() => router.push('/dashboard/users/create')} 
               className="h-9 bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 font-bold transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusIcon className="h-4 w-4 mr-2" /> Add New User
            </Button>
          ) : undefined
        }
      />

      {/* User Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total Users"
          value={users.length}
          icon={<UserGroupIcon />}
          trend={{ value: "All users", isPositive: true }}
          className="border-primary"
        />
        <StatCard
          title="Administrators"
          value={users.filter(u => u.role === 'admin').length}
          icon={<ShieldCheckIcon />}
          trend={{ value: "Full access", isPositive: true }}
          className="border-orange-500"
        />
        <StatCard
          title="Operators"
          value={users.filter(u => u.role === 'operator').length}
          icon={<BoltIcon />}
          trend={{ value: "Standard access", isPositive: true }}
          className="border-blue-500"
        />
        <StatCard
          title="Active Users"
          value={users.filter(u => u.isActive).length}
          icon={<CheckCircleIcon />}
          trend={{ value: "Currently active", isPositive: true }}
          className="border-emerald-500"
        />
      </div>

      {/* Filter Segment */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4">
          <div className="sm:col-span-2 lg:col-span-6 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by name or email..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="pl-10 h-11 border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl text-xs font-bold transition-all shadow-none" 
            />
          </div>
          <div className="lg:col-span-3">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="h-11 border-slate-200 bg-slate-50/50 rounded-xl text-xs font-bold shadow-none"><SelectValue placeholder="User Role" /></SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-200">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Administrators</SelectItem>
                <SelectItem value="operator">Operators</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="lg:col-span-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 border-slate-200 bg-slate-50/50 rounded-xl text-xs font-bold shadow-none"><SelectValue placeholder="Account Status" /></SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-200">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* User List & Management */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
            <UserIcon className="h-4 w-4 mr-2 text-primary" />
            User List
          </h2>
          <Badge className="bg-blue-50 text-blue-700 border-none font-bold text-[10px] uppercase">
            {filtered.length} USERS
          </Badge>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Users...</p>
            </div>
          ) : (
            <Table className="responsive-table">
              <TableHeader className="bg-slate-50/10">
                <TableRow>
                  <TableHead className="px-4 sm:px-8 text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest">User Information</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-center">Role</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-center">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-right hide-on-mobile">Joined Date</TableHead>
                  <TableHead className="px-4 sm:px-8 text-[10px] font-black uppercase text-slate-400 h-14 tracking-widest text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(u => (
                  <TableRow key={u.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 group">
                    <TableCell className="px-4 sm:px-8 py-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-white border border-slate-200 text-primary flex items-center justify-center flex-shrink-0 text-xs sm:text-sm font-black shadow-sm group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                          {(u.name || u.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors truncate max-w-[120px] sm:max-w-none">{u.name || 'No Name'}</div>
                          <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 mt-0.5 truncate max-w-[120px] sm:max-w-none">{u.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`uppercase font-black text-[8px] sm:text-[9px] tracking-widest px-2 sm:px-3 py-1 rounded-sm border ${u.role === 'admin' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`uppercase font-black text-[8px] sm:text-[9px] tracking-widest px-2 sm:px-3 py-1 rounded-sm border ${u.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                        {u.isActive ? 'Active' : 'Locked'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right hide-on-mobile">
                      <div className="text-xs font-black text-slate-900 tabular-nums tracking-tighter uppercase leading-none">
                        {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 sm:px-8 text-right">
                      {isAdmin() ? (
                        <TableActions actions={[
                          { label: "Edit User", icon: <PencilIcon />, onClick: () => router.push(`/dashboard/users/${u.id}/edit`) },
                          { label: u.isActive ? "Deactivate User" : "Activate User", icon: u.isActive ? <EyeSlashIcon /> : <EyeIcon />, onClick: () => handleToggle(u.id, u.isActive) },
                          { label: "Delete User", icon: <TrashIcon />, onClick: () => handleDelete(u.id), variant: "danger", separator: true },
                        ]} />
                      ) : <span className="text-slate-300">—</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is irreversible. The user will no longer be able to access the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function UsersPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <UsersContent />
      </Suspense>
    </DashboardLayout>
  )
}
