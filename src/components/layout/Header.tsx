'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Search, 
  Bell, 
  Settings, 
  User,
  Moon,
  Sun,
  Menu,
  ChevronDown
} from 'lucide-react'

interface HeaderProps {
  onMobileMenuOpen: () => void
  isDarkMode: boolean
  onToggleDarkMode: () => void
}

export function Header({ onMobileMenuOpen, isDarkMode, onToggleDarkMode }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMobileMenuOpen}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions, accounts..."
            className="w-64 pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-3">
        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleDarkMode}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>

        {/* User menu */}
        <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-gray-900">John Doe</div>
            <div className="text-xs text-gray-500">john@example.com</div>
          </div>
          <div className="relative">
            <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all">
              <AvatarImage src="/avatars/01.png" alt="John Doe" />
              <AvatarFallback className="bg-blue-600 text-white">
                JD
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="absolute -bottom-1 -right-1 h-3 w-3 text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  )
}
