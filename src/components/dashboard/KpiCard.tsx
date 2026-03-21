import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
  }
  description?: string
  icon?: React.ReactNode
  className?: string
}

export function KpiCard({ 
  title, 
  value, 
  change, 
  description, 
  icon, 
  className 
}: KpiCardProps) {
  const getTrendIcon = () => {
    switch (change?.type) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-emerald-600" />
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = () => {
    switch (change?.type) {
      case 'increase':
        return 'text-emerald-600 bg-emerald-50'
      case 'decrease':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {typeof value === 'number' && title.toLowerCase().includes('currency') 
            ? formatCurrency(value) 
            : value}
        </div>
        
        {change && (
          <div className="flex items-center mt-2 space-x-2">
            <Badge 
              variant="secondary" 
              className={cn("text-xs", getTrendColor())}
            >
              {getTrendIcon()}
              <span className="ml-1">
                {change.type === 'increase' ? '+' : ''}{formatPercent(Math.abs(change.value))}
              </span>
            </Badge>
            {description && (
              <span className="text-xs text-gray-500">{description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
