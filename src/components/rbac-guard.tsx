"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface RBACGuardProps {
  children: React.ReactNode
  requiredRole?: string
  requireAdmin?: boolean
  fallback?: React.ReactNode
}

export function RBACGuard({ 
  children, 
  requiredRole, 
  requireAdmin = false,
  fallback = <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h2 className="text-2xl font-semibold text-gray-900">Access Denied</h2>
      <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
    </div>
  </div>
}: RBACGuardProps) {
  const { user, isLoading, hasRole, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (requireAdmin && !isAdmin()) {
    return fallback
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return fallback
  }

  return <>{children}</>
}
