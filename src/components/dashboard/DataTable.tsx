'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn, formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { ArrowUpDown, MoreHorizontal, Eye, Download } from 'lucide-react'

interface Column<T> {
  key: keyof T
  title: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  title?: string
  className?: string
  actions?: (row: T) => React.ReactNode
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  className,
  actions
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null
    direction: 'asc' | 'desc'
  }>({ key: null, direction: 'asc' })

  const handleSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedData = React.useMemo(() => {
    let sortableData = [...data]
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key!]
        const bValue = b[sortConfig.key!]
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }
    return sortableData
  }, [data, sortConfig])

  const renderCell = (column: Column<T>, row: T) => {
    const value = row[column.key]
    
    if (column.render) {
      return column.render(value, row)
    }

    // Default renderers for common types
    if (column.key === 'amount' || column.key.toString().toLowerCase().includes('amount')) {
      return (
        <span className={cn(
          "font-medium tabular-nums",
          typeof value === 'number' && value > 0 ? "text-emerald-600" : 
          typeof value === 'number' && value < 0 ? "text-red-600" : 
          "text-gray-900"
        )}>
          {typeof value === 'number' ? formatCurrency(value) : value}
        </span>
      )
    }

    if (column.key === 'status') {
      return (
        <Badge variant="secondary" className={getStatusColor(value)}>
          {value}
        </Badge>
      )
    }

    if (column.key === 'date' || column.key.toString().toLowerCase().includes('date')) {
      return formatDate(value)
    }

    return value
  }

  return (
    <Card className={className}>
      {(title || actions) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          {title && <CardTitle className="text-lg font-semibold">{title}</CardTitle>}
          {actions && (
            <div className="flex items-center space-x-2">
              {actions(data[0])}
            </div>
          )}
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                {columns.map((column) => (
                  <TableHead key={String(column.key)} className="font-medium text-gray-700">
                    {column.sortable ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort(column.key)}
                      >
                        {column.title}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      column.title
                    )}
                  </TableHead>
                ))}
                {actions && <TableHead className="w-[100px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((row, index) => (
                <TableRow 
                  key={index} 
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {columns.map((column) => (
                    <TableCell key={String(column.key)} className="py-3">
                      {renderCell(column, row)}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="py-3">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
