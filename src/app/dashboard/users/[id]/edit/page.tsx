"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/contexts/auth-context"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { 
  ArrowLeftIcon, 
  PencilSquareIcon, 
  ShieldCheckIcon, 
  FingerPrintIcon, 
  EnvelopeIcon, 
  UserIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline"

function EditUserContent() {
  const router = useRouter()
  const { id } = useParams()
  const { token } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    isActive: true
  })

  useEffect(() => { 
    setMounted(true)
    fetchUser()
  }, [id])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const res = await fetchWithAuth(`/api/auth/users`, { token })
      if (res.ok) {
        const users = await res.json()
        const user = users.find((u: any) => u.id === id)
        if (user) {
          setFormData({
            name: user.name || '',
            role: user.role,
            isActive: user.isActive
          })
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const res = await fetchWithAuth(`/api/auth/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        token,
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        router.push('/dashboard/users')
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to update user.')
      }
    } catch (error) {
      console.error(error)
      alert('Network or security error.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted) return null

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Loading User Data...</p>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <PageHeader
        title="Edit User Details"
        subtitle={`Update permissions and profile for user ${id?.slice(0, 8)}`}
        actions={
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/users')}
            className="h-9 border-slate-200 text-slate-700 rounded-xl px-4 hover:bg-slate-50 font-medium transition-all"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Form */}
        <div className="lg:col-span-7">
          <Card className="border-slate-200 shadow-sm overflow-hidden rounded-3xl">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6 px-8">
              <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
                <FingerPrintIcon className="h-4 w-4 mr-3 text-primary" />
                User Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</Label>
                  <div className="relative">
                    <UserIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10 h-12 border-slate-200 bg-slate-50/50 rounded-2xl font-bold focus:bg-white transition-all shadow-none italic"
                      placeholder="Enter Full Name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">User Role</Label>
                    <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                      <SelectTrigger className="h-12 border-slate-200 bg-slate-50/50 rounded-2xl font-bold shadow-none text-left">
                        <SelectValue placeholder="Select Tier" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-200">
                        <SelectItem value="operator">Standard Operator</SelectItem>
                        <SelectItem value="admin">System Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Account Status</Label>
                    <Select value={formData.isActive.toString()} onValueChange={(v) => setFormData({ ...formData, isActive: v === 'true' })}>
                      <SelectTrigger className="h-12 border-slate-200 bg-slate-50/50 rounded-2xl font-bold shadow-none text-left">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-200">
                        <SelectItem value="true">State: Active</SelectItem>
                        <SelectItem value="false">State: Locked/Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-6 flex justify-end">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-10 font-black uppercase text-[10px] tracking-widest shadow-xl transition-all active:scale-[0.98]"
                  >
                    {submitting ? 'Updating...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Intelligence Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-slate-900 border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-white text-xl font-black italic tracking-tight flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-3 text-primary animate-pulse" />
                Security Notice
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <p className="text-xs text-slate-400 font-bold leading-relaxed italic border-b border-white/10 pb-4">
                All changes to user accounts are logged for security. Changing the account status will immediately affect the user's ability to log in.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="h-8 w-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 flex-shrink-0">
                    <InformationCircleIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Account Locking</h5>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-1 leading-relaxed">Locking an account will log the user out of all active sessions.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                    <ArrowPathIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Data Consistency</h5>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-1 leading-relaxed">User profile updates will reflect across all their past activities.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 text-center">
                <Badge className="bg-white/5 text-slate-400 border-white/10 uppercase font-black text-[8px] tracking-widest mb-4">Secure Connection</Badge>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  <div className="h-1 w-1 rounded-full bg-primary opacity-50" />
                  <div className="h-1 w-1 rounded-full bg-primary opacity-25" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function EditUserPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <EditUserContent />
      </Suspense>
    </DashboardLayout>
  )
}
