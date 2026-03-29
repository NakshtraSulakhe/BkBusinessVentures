"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/ui/page-header"
import { useAuth } from "@/contexts/auth-context"
import { fetchWithAuth } from "@/lib/api"
import { 
  Plus,
  Pencil,
  Trash2,
  FileText,
  CheckCircle2,
  XCircle,
  Settings
} from "lucide-react"

interface NumberingTemplate {
  id: string
  name: string
  template: string
  description?: string
  isActive: boolean
  accountType: string
  sequenceStart: number
  currentSequence: number
  requiredVariables?: string[]
  createdAt: string
  updatedAt: string
}

export default function NumberingTemplatesPage() {
  const { token } = useAuth()
  const [templates, setTemplates] = useState<NumberingTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<NumberingTemplate | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    template: '',
    description: '',
    accountType: 'all',
    sequenceStart: 1
  })

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetchWithAuth('/api/numbering-templates', { token })
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingTemplate 
        ? `/api/numbering-templates/${editingTemplate.id}`
        : '/api/numbering-templates'
      
      const response = await fetchWithAuth(url, {
        method: editingTemplate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        token,
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchTemplates()
        setShowCreateForm(false)
        setEditingTemplate(null)
        setFormData({
          name: '',
          template: '',
          description: '',
          accountType: 'all',
          sequenceStart: 1
        })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save template')
      }
    } catch (error) {
      console.error('Failed to save template:', error)
      alert('Failed to save template')
    }
  }

  const handleEdit = (template: NumberingTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      template: template.template,
      description: template.description || '',
      accountType: template.accountType,
      sequenceStart: template.sequenceStart
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return
    }

    try {
      const response = await fetchWithAuth(`/api/numbering-templates/${templateId}`, {
        method: 'DELETE',
        token
      })

      if (response.ok) {
        await fetchTemplates()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete template')
      }
    } catch (error) {
      console.error('Failed to delete template:', error)
      alert('Failed to delete template')
    }
  }

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'fd': return 'bg-blue-100 text-blue-700'
      case 'rd': return 'bg-green-100 text-green-700'
      case 'loan': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const validateTemplate = (template: string) => {
    const errors: string[] = []
    
    // Check for balanced braces
    const openBraces = (template.match(/\{/g) || []).length
    const closeBraces = (template.match(/\}/g) || []).length
    if (openBraces !== closeBraces) {
      errors.push('Unbalanced braces in template')
    }

    // Check for valid variable format
    const invalidVars = template.match(/\{[^}]*\}/g)?.filter(v => {
      const content = v.slice(1, -1)
      return !content.match(/^[a-zA-Z_][a-zA-Z0-9_]*(?::[^}]*)?$/)
    })

    if (invalidVars?.length) {
      errors.push(`Invalid variable format: ${invalidVars.join(', ')}`)
    }

    return errors
  }

  const templateErrors = formData.template ? validateTemplate(formData.template) : []

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up pb-20">
        <PageHeader
          title="Numbering Templates"
          subtitle="Manage account number generation templates"
          actions={
            <Button
              onClick={() => setShowCreateForm(true)}
              className="finance-gradient-primary shadow-lg h-10 px-5 rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          }
        />

        {/* Create/Edit Form */}
        {showCreateForm && (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
                <FileText className="h-4 w-4 mr-2 text-primary" />
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Template Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="FD Default"
                        required
                      />
                    </div>
                    <div>
                      <Label>Account Type</Label>
                      <Select
                        value={formData.accountType}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, accountType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="fd">Fixed Deposit Only</SelectItem>
                          <SelectItem value="rd">Recurring Deposit Only</SelectItem>
                          <SelectItem value="loan">Loan Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="template">Template Pattern</Label>
                    <Input
                      id="template"
                      value={formData.template}
                      onChange={(e) => setFormData(prev => ({ ...prev, template: e.target.value }))}
                      placeholder="FD-{branch}-{year}-{seq:6}"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Available variables: {'{branch}'}, {'{year}'}, {'{month}'}, {'{type}'}, {'{seq:6}'} (padded sequence)
                    </p>
                    {templateErrors.length > 0 && (
                      <div className="mt-2 text-sm text-red-600">
                        {templateErrors.map((error, index) => (
                          <div key={index}>• {error}</div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Default template for Fixed Deposit accounts"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sequenceStart">Sequence Start</Label>
                    <Input
                      id="sequenceStart"
                      type="number"
                      min="1"
                      value={formData.sequenceStart}
                      onChange={(e) => setFormData(prev => ({ ...prev, sequenceStart: parseInt(e.target.value) }))}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false)
                        setEditingTemplate(null)
                        setFormData({
                          name: '',
                          template: '',
                          description: '',
                          accountType: 'all',
                          sequenceStart: 1
                        })
                      }}
                      className="h-10 px-5 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={templateErrors.length > 0}
                      className="finance-gradient-primary h-10 px-5 rounded-xl"
                    >
                      {editingTemplate ? 'Update Template' : 'Create Template'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

        {/* Templates List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    {template.name}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {template.isActive ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Template Pattern</p>
                  <code className="block p-3 bg-slate-100 rounded-lg text-sm font-mono text-slate-800 mt-1">
                    {template.template}
                  </code>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Account Type</p>
                    <Badge className={getAccountTypeColor(template.accountType)}>
                      {template.accountType.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Current Sequence</p>
                    <p className="font-bold text-slate-900">{template.currentSequence}</p>
                  </div>
                </div>

                {template.description && (
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Description</p>
                    <p className="text-sm text-slate-600">{template.description}</p>
                  </div>
                )}

                <Separator />

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                    className="h-9 px-4 rounded-lg"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                    className="h-9 px-4 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {templates.length === 0 && !loading && (
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No templates found</h3>
              <p className="mt-2 text-sm text-slate-500">
                Create your first numbering template to get started.
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="mt-6 finance-gradient-primary h-11 px-6 rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Template
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
