"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { fetchWithAuth } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { 
  ArrowLeftIcon, 
  UserPlusIcon, 
  ShieldCheckIcon, 
  KeyIcon, 
  EnvelopeIcon, 
  UserIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline"

function CreateUserContent() {
  const router = useRouter()
  const { token } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'operator'
  })

  useEffect(() => { setMounted(true) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match. Please check and try again.')
      return
    }

    try {
      setSubmitting(true)
      const res = await fetchWithAuth('/api/auth/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        token,
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      })

      if (res.ok) {
        router.push('/dashboard/users')
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to create user account.')
      }
    } catch (error) {
      console.error(error)
      alert('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <PageHeader
        title="Create New User"
        subtitle="Add a new user account with appropriate access permissions"
        actions={
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/users')}
            className="h-9 border-slate-200 text-slate-700 rounded-xl px-4 hover:bg-slate-50 font-medium transition-all"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Users
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Form */}
        <div className="lg:col-span-7">
          <Card className="border-slate-200 shadow-sm overflow-hidden rounded-3xl">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6 px-8">
              <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
                <UserPlusIcon className="h-4 w-4 mr-3 text-primary" />
                User Account Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</Label>
                    <div className="relative">
                      <UserIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="pl-10 h-12 border-slate-200 bg-slate-50/50 rounded-2xl font-bold focus:bg-white transition-all shadow-none"
                        placeholder="John Q. Public"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</Label>
                    <div className="relative">
                      <EnvelopeIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-10 h-12 border-slate-200 bg-slate-50/50 rounded-2xl font-bold focus:bg-white transition-all shadow-none"
                        placeholder="secure@identity.net"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">User Role</Label>
                    <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                      <SelectTrigger className="h-12 border-slate-200 bg-slate-50/50 rounded-2xl font-bold shadow-none text-left">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-200">
                        <SelectItem value="operator">Operator (Standard Access)</SelectItem>
                        <SelectItem value="admin">Administrator (Full Access)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</Label>
                        <div className="relative">
                          <KeyIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <Input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="pl-10 h-12 border-slate-200 bg-slate-50/50 rounded-2xl font-bold focus:bg-white transition-all shadow-none"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm Password</Label>
                        <div className="relative">
                          <CheckCircleIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <Input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="pl-10 h-12 border-slate-200 bg-slate-50/50 rounded-2xl font-bold focus:bg-white transition-all shadow-none"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>
                   </div>
                </div>

                <div className="pt-6 flex justify-end">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-10 font-black uppercase text-[10px] tracking-widest shadow-xl transition-all active:scale-[0.98]"
                  >
                    {submitting ? 'Creating User...' : 'Create User'}
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
              <CardTitle className="text-white text-xl font-black tracking-tight flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-3 text-primary animate-pulse" />
                User Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <p className="text-xs text-slate-400 font-bold leading-relaxed border-b border-white/10 pb-4">
                Users created here will have access to the system based on their assigned role. Choose the appropriate role for each user.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center text-primary flex-shrink-0">
                    <CheckCircleIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Administrator</h5>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-1 leading-relaxed">Full access to all features including user management and system settings.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                    <CheckCircleIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Operator</h5>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-1 leading-relaxed">Standard access for daily operations like managing customers, accounts, and transactions.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <InformationCircleIcon className="h-4 w-4 text-primary" />
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">Important Note</span>
                </div>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">User accounts cannot be deleted once created. Please verify all information before submitting.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CreateUserPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <CreateUserContent />
      </Suspense>
    </DashboardLayout>
  )
}
