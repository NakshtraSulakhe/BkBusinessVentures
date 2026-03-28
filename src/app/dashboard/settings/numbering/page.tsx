"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  HashtagIcon, 
  ArrowPathIcon, 
  FingerPrintIcon, 
  CalendarDaysIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  PlusIcon,
  SparklesIcon,
  CommandLineIcon,
  InformationCircleIcon,
  CodeBracketIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { PageHeader } from "@/components/ui/page-header"

interface NumberingTemplate {
  id: string
  name: string
  template: string
  description: string | null
  isActive: boolean
  accountType: string
  sequenceStart: number
  currentSequence: number
  requiredVariables: any | null
}

function NumberingContent() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [templates, setTemplates] = useState<NumberingTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings/numbering')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Failed to fetch numbering templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (id: string, updates: Partial<NumberingTemplate>) => {
    try {
      setSaving(true)
      const response = await fetch(`/api/settings/numbering/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (response.ok) {
        fetchTemplates()
      }
    } catch (error) {
      console.error('Failed to update template:', error)
    } finally {
      setSaving(false)
    }
  }

  const formatPreview = (t: NumberingTemplate) => {
    const vars = {
      year: new Date().getFullYear().toString(),
      month: (new Date().getMonth() + 1).toString().padStart(2, '0'),
      seq: t.currentSequence + 1,
      branch: 'MAIN'
    }
    let res = t.template
    Object.entries(vars).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}(?::([^}]+))?\\}`, 'g')
      res = res.replace(regex, (match, format) => {
        const strValue = String(value)
        if (format && format.match(/^\d+$/)) return strValue.padStart(Number(format), '0')
        return strValue
      })
    })
    return res
  }

  if (!mounted) return null

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <PageHeader
        title="Numbering Protocols"
        subtitle="Configure dynamic identifier generation for institutional instruments"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/settings')}
              className="h-9 border-slate-200 text-slate-700 rounded-xl px-4 hover:bg-slate-50 font-medium"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Settings
            </Button>
            <Button 
               onClick={() => router.push('/dashboard/settings/numbering-templates')}
               className="h-9 finance-gradient-primary text-white rounded-xl px-4 font-bold transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Protocol
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Protocol Manager */}
        <div className="lg:col-span-8 space-y-6">
          {loading ? (
            <div className="py-24 text-center bg-white border border-slate-200 rounded-3xl shadow-sm">
              <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Protocols...</p>
            </div>
          ) : templates.length === 0 ? (
            <Card className="border-slate-200 shadow-sm border-dashed">
              <CardContent className="py-20 text-center">
                <CommandLineIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-sm font-black text-slate-900 uppercase">No active protocols</h3>
                <p className="text-xs text-slate-500 mt-2">Initialize a numbering protocol to begin automated instrument generation.</p>
              </CardContent>
            </Card>
          ) : (
            templates.map((template) => (
              <Card key={template.id} className="border-slate-200 shadow-sm overflow-hidden rounded-3xl group hover:border-primary/40 transition-all duration-300">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-5 px-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
                        <FingerPrintIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center">
                          {template.name}
                          <Badge className="ml-3 bg-blue-100 text-blue-700 border-none font-bold text-[8px] uppercase h-4 px-1">{template.accountType}</Badge>
                        </CardTitle>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-tight">Active Generation Logic</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Next Resolution</p>
                      <Badge className="bg-slate-900 text-white border-none font-black text-sm py-1 px-4 h-8 rounded-xl font-mono tracking-tighter">
                        {formatPreview(template)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-7 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1">
                          <CodeBracketIcon className="h-3 w-3" />
                          Template String
                        </Label>
                        <Input 
                          value={template.template}
                          onChange={(e) => handleUpdate(template.id, { template: e.target.value })}
                          className="h-12 font-mono text-lg font-black bg-slate-50/50 border-slate-200 rounded-2xl text-primary focus:bg-white transition-all shadow-none"
                        />
                        <div className="flex gap-2 flex-wrap pt-1">
                          {['year', 'month', 'branch', 'seq:6'].map(v => (
                            <code key={v} className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-tighter">{"{"}{v}{"}"}</code>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-5 grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sequence Start</Label>
                        <Input 
                          type="number"
                          value={template.sequenceStart}
                          onChange={(e) => handleUpdate(template.id, { sequenceStart: parseInt(e.target.value) })}
                          className="h-11 font-mono text-xl font-black bg-slate-50/50 border-slate-200 rounded-2xl text-center shadow-none"
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="text-[10px] font-black uppercase text-slate-400 ml-1">Live Logic Pulse</div>
                        <Switch checked={template.isActive} onCheckedChange={(v) => handleUpdate(template.id, { isActive: v })} className="scale-75 data-[state=checked]:bg-emerald-500" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Intelligence Sidebar */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          <Card className="bg-slate-900 border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-white text-xl font-black tracking-tight flex items-center">
                <SparklesIcon className="h-5 w-5 mr-3 text-primary animate-pulse" />
                Syntax Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <p className="text-xs text-slate-400 font-bold leading-relaxed border-b border-white/10 pb-4">
                Systematic identifiers are resolved using dynamic variable injection. Use the following tokens:
              </p>
              
              <div className="space-y-4">
                {[
                  { token: "{year}", desc: "Current calendar year (2026)" },
                  { token: "{month}", desc: "Zero-padded month (03)" },
                  { token: "{branch}", desc: "Main organizational ID" },
                  { token: "{seq:N}", desc: "Serial with N padding (seq:6 → 000001)" }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start group">
                    <code className="text-[10px] font-black bg-white/10 text-primary px-2 py-1 rounded-lg min-w-[60px] text-center">{item.token}</code>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1 group-hover:text-white transition-colors">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <CheckBadgeIcon className="h-4 w-4 text-emerald-400" />
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Protocol Verified</span>
                </div>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Generated identifiers must remain unique across the entire instrument portfolio to maintain audit integrity.</p>
              </div>
            </CardContent>
          </Card>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center">
              <InformationCircleIcon className="h-4 w-4 mr-2 text-primary" />
              Administrative Warning
            </h4>
            <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
              Modifying template strings or sequence counters mid-cycle may cause collisions with existing ledger records. Exercise extreme caution when deployments are live.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NumberingSettings() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading Protocols...</div>}>
        <NumberingContent />
      </Suspense>
    </DashboardLayout>
  )
}
