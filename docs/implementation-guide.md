# Professional UI Implementation Guide

## Quick Start

This guide provides practical examples for implementing the professional UI design system in your BK Business Ventures banking application.

## Component Usage Examples

### 1. Form with Professional Styling

```tsx
import { FormField, Input, Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui"

export function CustomerForm() {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Customer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          label="Customer Name"
          description="Enter the full legal name of the customer"
          required
        >
          <Input placeholder="John Doe" />
        </FormField>
        
        <FormField
          label="Email Address"
          description="For notifications and communications"
          required
        >
          <Input type="email" placeholder="john@example.com" />
        </FormField>
        
        <FormField
          label="Phone Number"
          description="10-digit mobile number"
          required
        >
          <Input type="tel" placeholder="9876543210" />
        </FormField>
        
        <div className="flex gap-4 pt-4">
          <Button variant="default">Create Customer</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

### 2. Professional Table with Status Badges

```tsx
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, StatusBadge, AmountDisplay } from "@/components/ui"

export function LoanLedger() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Loan Ledger</h2>
        <Button variant="accent">Export</Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Loan ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-mono">LN001</TableCell>
            <TableCell>John Doe</TableCell>
            <TableCell>
              <AmountDisplay amount={50000} size="sm" />
            </TableCell>
            <TableCell>
              <StatusBadge status="active">Active</StatusBadge>
            </TableCell>
            <TableCell>2024-12-15</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm">View</Button>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono">LN002</TableCell>
            <TableCell>Jane Smith</TableCell>
            <TableCell>
              <AmountDisplay amount={75000} size="sm" />
            </TableCell>
            <TableCell>
              <StatusBadge status="overdue">Overdue</StatusBadge>
            </TableCell>
            <TableCell>2024-11-30</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm">View</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
```

### 3. Dashboard Cards with Amounts

```tsx
import { Card, CardHeader, CardTitle, CardContent, AmountDisplay, Badge } from "@/components/ui"

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Deposits</p>
              <AmountDisplay amount={1250000} size="xl" weight="bold" />
            </div>
            <Badge variant="secondary">+12%</Badge>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Loans</p>
              <AmountDisplay amount={450000} size="xl" weight="bold" color="warning" />
            </div>
            <Badge variant="secondary">+8%</Badge>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Interest Earned</p>
              <AmountDisplay amount={125000} size="xl" weight="bold" color="success" />
            </div>
            <Badge variant="secondary">+15%</Badge>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <AmountDisplay amount={75000} size="xl" weight="bold" color="error" />
            </div>
            <Badge variant="secondary">-3%</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 4. Suggestions Queue Interface

```tsx
import { Card, CardHeader, CardTitle, CardContent, Button, StatusBadge, AmountDisplay, Badge } from "@/components/ui"

export function SuggestionsQueue() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Suggestions Queue</h2>
        <div className="flex gap-2">
          <Button variant="outline">Reject All</Button>
          <Button variant="default">Approve Selected</Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">Run #1234</Badge>
                  <StatusBadge status="pending">FD Interest</StatusBadge>
                  <span className="text-sm text-muted-foreground">FD-001</span>
                </div>
                
                <div className="space-y-1">
                  <p className="font-medium">Monthly Interest Credit</p>
                  <AmountDisplay amount={1250} size="lg" />
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Generated: Today, 10:30 AM</span>
                  <span>•</span>
                  <span>Account: John Doe</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="destructive" size="sm">Reject</Button>
                <Button variant="default" size="sm">Approve</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

## Layout Patterns

### 1. Standard Page Layout

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui"

export default function CustomersPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage customer accounts and information</p>
        </div>
        <Button variant="default">Add Customer</Button>
      </div>
      
      {/* Main Content */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer List</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Table or list content */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

### 2. Form Layout with Sections

```tsx
import { Card, CardHeader, CardTitle, CardContent, FormField, Input, Button } from "@/components/ui"

export function AccountCreationForm() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Create New Account</h1>
        <p className="text-muted-foreground">Set up a new customer account with rules and settings</p>
      </div>
      
      <div className="space-y-6">
        {/* Customer Details Section */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Customer Name" required>
              <Input placeholder="Enter customer name" />
            </FormField>
            <FormField label="Customer ID" required>
              <Input placeholder="Enter customer ID" />
            </FormField>
          </CardContent>
        </Card>
        
        {/* Account Rules Section */}
        <Card>
          <CardHeader>
            <CardTitle>Account Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Interest Rate (%)" description="Annual interest rate for this account">
              <Input type="number" placeholder="8.5" />
            </FormField>
            <FormField label="Minimum Balance" description="Minimum balance requirement">
              <Input type="number" placeholder="1000" />
            </FormField>
          </CardContent>
        </Card>
        
        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Button variant="outline">Cancel</Button>
          <Button variant="default">Create Account</Button>
        </div>
      </div>
    </div>
  )
}
```

## Spacing Guidelines in Practice

### 8px Grid System Usage

```tsx
// ✅ Correct: Using 8px multiples
<div className="space-y-6">  // 24px section spacing
  <div className="space-y-4"> // 16px form spacing
    <FormField className="space-y-2"> // 8px field spacing
      <Input className="h-10 px-3 py-2" /> // Consistent height
    </FormField>
  </div>
</div>

// ❌ Incorrect: Arbitrary spacing
<div className="space-y-5"> // Not on 8px grid
  <div className="gap-7"> // Not on 8px grid
```

## Color Usage Patterns

### Primary Actions
```tsx
<Button variant="default">Primary Action</Button>  // Navy background
<StatusBadge status="active">Active</StatusBadge> // Uses accent color
```

### Status Indicators
```tsx
<StatusBadge status="paid">Paid</StatusBadge>      // Green
<StatusBadge status="pending">Pending</StatusBadge> // Amber
<StatusBadge status="overdue">Overdue</StatusBadge> // Red
```

### Financial Amounts
```tsx
<AmountDisplay amount={1000} color="success" />  // Positive amounts
<AmountDisplay amount={-500} color="error" />    // Negative amounts
<AmountDisplay amount={750} color="default" />   // Neutral amounts
```

## Typography Hierarchy

```tsx
// Page Title
<h1 className="text-2xl font-bold">Dashboard</h1>

// Section Title
<h2 className="text-xl font-semibold">Recent Transactions</h2>

// Card Title
<h3 className="text-lg font-semibold">Account Balance</h3>

// Body Text
<p className="text-sm text-muted-foreground">Description text</p>

// Labels
<label className="text-sm font-medium">Customer Name</label>
```

## Responsive Patterns

### Mobile-First Tables
```tsx
<div className="overflow-x-auto">
  <Table>
    {/* Table content that scrolls horizontally on mobile */}
  </Table>
</div>
```

### Responsive Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Cards that stack on mobile, 2 on tablet, 4 on desktop */}
</div>
```

## Best Practices

### 1. Consistency
- Always use the design system components
- Follow the 8px spacing grid
- Maintain consistent typography hierarchy
- Use semantic color coding

### 2. Accessibility
- All interactive elements have focus states
- Forms have proper labels and descriptions
- Color contrast meets WCAG standards
- Keyboard navigation works

### 3. Performance
- Use proper loading states
- Implement pagination for large tables
- Debounce search inputs
- Optimize re-renders

### 4. Error Handling
- Show inline validation errors
- Provide clear error messages
- Include recovery actions
- Maintain form state on errors

This implementation guide should help you apply the professional UI design system consistently across your banking application.
