"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RBACGuard } from "@/components/rbac-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/ui/page-header"
import {
  CogIcon, 
  UserGroupIcon, 
  DocumentTextIcon, 
  HashtagIcon,
  BuildingLibraryIcon, 
  ShieldCheckIcon,
  KeyIcon,
  BellIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  BoltIcon,
  CommandLineIcon
} from "@heroicons/react/24/outline"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

function SettingsSection({ title, icon, children, description }: { title: string; icon: any; children: React.ReactNode; description?: string }) {
  const Icon = icon
  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest leading-none">{title}</CardTitle>
            {description && <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-tight">{description}</p>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!user) router.push("/login")
  }, [user, router])

  if (!user || !mounted) return null

  return (
    <RBACGuard requireAdmin>
      <DashboardLayout>
        <div className="space-y-6 animate-fade-in-up pb-20">
          <PageHeader
            title="System Configuration"
            subtitle="Global administrative governance and operational parameters"
            actions={
              <Button className="h-9 finance-gradient-primary text-white rounded-xl px-6 font-bold transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]">
                Deploy Changes
              </Button>
            }
          />

          {/* Navigational Matrix */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "User Governance", icon: UserGroupIcon, href: "/dashboard/users", color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Numbering Protocols", icon: HashtagIcon, href: "/dashboard/settings/numbering", color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Audit Templates", icon: DocumentTextIcon, href: "/dashboard/settings/numbering-templates", color: "text-purple-600", bg: "bg-purple-50" },
              { label: "Terminal Access", icon: CommandLineIcon, href: "#", color: "text-slate-600", bg: "bg-slate-50" },
            ].map((item, idx) => {
              const Icon = item.icon
              return (
                <button
                  key={idx}
                  onClick={() => router.push(item.href)}
                  className="group flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-3xl hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className={`h-12 w-12 rounded-2xl ${item.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest text-center group-hover:text-primary transition-colors">{item.label}</span>
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sector 1: Global Logic */}
            <SettingsSection 
              title="Operational Defaults" 
              icon={BoltIcon}
              description="Standardized financial parameters for new instruments"
            >
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Threshold APY (%)</Label>
                    <Input placeholder="7.50" className="h-11 border-slate-200 bg-slate-50/50 rounded-xl font-black tracking-tight shadow-none" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Standard Tenure (M)</Label>
                    <Input placeholder="12" className="h-11 border-slate-200 bg-slate-50/50 rounded-xl font-black tracking-tight shadow-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Amortization Rounding</Label>
                  <Select defaultValue="nearest">
                    <SelectTrigger className="h-11 border-slate-200 bg-slate-50/50 rounded-xl font-bold shadow-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nearest">Nearest Integer Precision</SelectItem>
                      <SelectItem value="up">Systematic Ceiling</SelectItem>
                      <SelectItem value="down">Systematic Floor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button variant="outline" className="h-9 border-slate-200 text-slate-700 rounded-xl px-4 font-bold text-xs hover:bg-slate-50">Apply Logic</Button>
                </div>
              </div>
            </SettingsSection>

            {/* Sector 2: Identity & Security */}
            <SettingsSection 
              title="Security & Authorization" 
              icon={ShieldCheckIcon}
              description="Access control and system integrity protocols"
            >
              <div className="space-y-4">
                {[
                  { label: "Multi-Factor Authentication", desc: "Mandatory biometric/OTP for admin tiers", active: true },
                  { label: "Session Persistence", desc: "Auto-terminate cycles after 30M inactivity", active: true },
                  { label: "immutable Audit Logs", desc: "Block deletion of historical transaction records", active: true },
                  { label: "Developer Mode", desc: "Enable terminal access and debug logging", active: false }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-colors">
                    <div>
                      <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{item.label}</p>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">{item.desc}</p>
                    </div>
                    <Switch checked={item.active} className="data-[state=checked]:bg-primary" />
                  </div>
                ))}
              </div>
            </SettingsSection>

            {/* Sector 3: Localization */}
            <SettingsSection 
              title="Identity & Branding" 
              icon={PaintBrushIcon}
              description="Visual language and organizational identifiers"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Enterprise Identifier</Label>
                  <Input defaultValue="NakshtraSulakhe Portfolio Management" className="h-11 border-slate-200 bg-slate-50/50 rounded-xl font-bold shadow-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Primary Locale</Label>
                    <Select defaultValue="en-IN">
                      <SelectTrigger className="h-11 border-slate-200 bg-slate-50/50 rounded-xl font-bold shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-IN">India (English)</SelectItem>
                        <SelectItem value="en-US">US (English)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Currency Anchor</Label>
                    <Select defaultValue="INR">
                      <SelectTrigger className="h-11 border-slate-200 bg-slate-50/50 rounded-xl font-bold shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">₹ INR</SelectItem>
                        <SelectItem value="USD">$ USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </SettingsSection>

            {/* Sector 4: Protocol Updates */}
            <SettingsSection 
              title="System Pulse" 
              icon={BoltIcon}
              description="Real-time connectivity and versioning matrix"
            >
              <div className="p-4 bg-slate-900 rounded-2xl text-white relative h-full flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <GlobeAltIcon className="h-20 w-20" />
                </div>
                <div className="space-y-2 relative">
                  <Badge className="bg-emerald-500 text-white border-none font-bold text-[8px] uppercase tracking-widest">System Stable</Badge>
                  <h4 className="text-xl font-black tracking-tighter mt-2">V2.4.0-Production</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Build ID: 8829-AF2-00X</p>
                </div>
                <div className="mt-8 relative">
                   <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-black uppercase text-[10px] tracking-widest h-11 rounded-xl">Check for Protocol Updates</Button>
                </div>
              </div>
            </SettingsSection>
          </div>
        </div>
      </DashboardLayout>
    </RBACGuard>
  )
}
