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
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline"

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
      const response = await fetch('/api/numbering-templates')
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
      
      const response = await fetch(url, {
        method: editingTemplate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const response = await fetch(`/api/numbering-templates/${templateId}`, {
        method: 'DELETE'
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
      <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Numbering Templates
              </h1>
              <p className="text-gray-600 mt-2">
                Manage account number generation templates
              </p>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg h-12 px-6"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Template
            </Button>
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <Card className="bg-white/60 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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

                  <div className="flex justify-end space-x-4 pt-4">
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
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={templateErrors.length > 0}
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
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
              <Card key={template.id} className="bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 mr-2" />
                      {template.name}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {template.isActive ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-700">
                          <XCircleIcon className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Template Pattern</p>
                    <code className="block p-2 bg-gray-100 rounded text-sm">
                      {template.template}
                    </code>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Account Type</p>
                      <Badge className={getAccountTypeColor(template.accountType)}>
                        {template.accountType.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Current Sequence</p>
                      <p className="font-medium">{template.currentSequence}</p>
                    </div>
                  </div>

                  {template.description && (
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-sm">{template.description}</p>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(template)}
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {templates.length === 0 && !loading && (
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No templates found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Create your first numbering template to get started.
                </p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create First Template
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
