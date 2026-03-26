"use client"

import { useState, useEffect } from "react"
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
  CheckCircleIcon
} from "@heroicons/react/24/outline"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

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

export default function NumberingSettings() {
  const router = useRouter()
  const [templates, setTemplates] = useState<NumberingTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings/numbering')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates)
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
    // Basic preview logic consistent with lib/numbering
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

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/20">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-slate-900 flex items-center">
                <Cog6ToothIcon className="h-8 w-8 mr-3 text-emerald-600" />
                Numbering Templates
              </h1>
              <p className="text-slate-500">Define dynamic templates (e.g. &#123;year&#125;-&#123;seq:6&#125;) for account and receipt IDs.</p>
            </div>
          </div>

          <div className="grid gap-6">
            {loading ? (
              <div className="py-24 text-center">
                <ArrowPathIcon className="h-8 w-8 animate-spin text-emerald-600 mx-auto" />
                <p className="mt-4 font-medium text-slate-600">Loading templates...</p>
              </div>
            ) : templates.map((template) => (
              <Card key={template.id} className="border-slate-200 overflow-hidden shadow-sm group hover:shadow-md transition-shadow">
                <CardHeader className="bg-slate-50 border-b border-slate-200 py-4 px-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
                      <FingerPrintIcon className="h-5 w-5 mr-2 text-emerald-600" />
                      {template.name}
                      <Badge variant="outline" className="ml-3 text-[10px] uppercase font-bold text-emerald-600 border-emerald-100">
                        {template.accountType}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center space-x-2 text-slate-500">
                      <p className="text-sm font-medium pr-2">Next Preview:</p>
                      <Badge className="bg-emerald-100 text-emerald-800 font-mono text-lg py-1 px-4 border-emerald-200">
                        {formatPreview(template)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label className="text-slate-600 uppercase text-[10px] tracking-widest font-bold">Template String</Label>
                      <Input 
                        value={template.template}
                        onChange={(e) => handleUpdate(template.id, { template: e.target.value })}
                        className="h-11 font-mono text-lg bg-slate-50/50"
                        placeholder="REC-{year}-{seq:6}"
                      />
                      <p className="text-[10px] text-slate-400">Variables supported: &#123;year&#125;, &#123;month&#125;, &#123;branch&#125;, &#123;seq:padding&#125;</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-600 uppercase text-[10px] tracking-widest font-bold">Start Sequence</Label>
                        <Input 
                          type="number"
                          value={template.sequenceStart}
                          onChange={(e) => handleUpdate(template.id, { sequenceStart: parseInt(e.target.value) })}
                          className="h-11 font-mono text-lg bg-slate-50/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 uppercase text-[10px] tracking-widest font-bold">Current Seq</Label>
                        <Input 
                          type="number"
                          value={template.currentSequence}
                          disabled
                          className="h-11 font-mono text-lg bg-slate-100 opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end p-6 bg-slate-100 rounded-3xl border border-slate-200 shadow-inner">
             <p className="text-slate-500 font-medium italic">All changes are saved automatically on update.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
