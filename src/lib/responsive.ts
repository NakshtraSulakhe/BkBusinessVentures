/**
 * Responsive Design Utilities
 * Helper functions and constants for responsive design
 */

import { useState, useEffect } from 'react'

// Breakpoints
export const breakpoints = {
  xs: '0px',      // 0px - 639px
  sm: '640px',    // 640px - 1023px
  md: '768px',    // 768px - 1279px
  lg: '1024px',   // 1024px - 1535px
  xl: '1280px',   // 1280px - 1919px
  '2xl': '1536px'  // 1536px+
} as const

// Media query helpers
export const mediaQueries = {
  xs: `(max-width: ${breakpoints.xs})`,
  sm: `(max-width: ${breakpoints.sm})`,
  md: `(max-width: ${breakpoints.md})`,
  lg: `(max-width: ${breakpoints.lg})`,
  xl: `(max-width: ${breakpoints.xl})`,
  '2xl': `(max-width: ${breakpoints['2xl']})`,
  
  // Min-width queries
  smMin: `(min-width: ${breakpoints.sm})`,
  mdMin: `(min-width: ${breakpoints.md})`,
  lgMin: `(min-width: ${breakpoints.lg})`,
  xlMin: `(min-width: ${breakpoints.xl})`,
  '2xlMin': `(min-width: ${breakpoints['2xl']})`,
} as const

// Responsive utility functions
export const isMobile = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < parseInt(breakpoints.sm)
}

export const isTablet = () => {
  if (typeof window === 'undefined') return false
  const width = window.innerWidth
  return width >= parseInt(breakpoints.sm) && width < parseInt(breakpoints.lg)
}

export const isDesktop = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= parseInt(breakpoints.lg)
}

// Tailwind CSS classes for responsive design
export const responsiveClasses = {
  // Container
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  containerFluid: 'w-full px-4 sm:px-6 lg:px-8',
  
  // Grid layouts
  grid: {
    cols1: 'grid-cols-1',
    cols2: 'grid-cols-1 sm:grid-cols-2',
    cols3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    cols4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    responsive: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  },
  
  // Flex layouts
  flex: {
    col: 'flex flex-col',
    row: 'flex flex-row',
    colReverse: 'flex flex-col-reverse',
    rowReverse: 'flex flex-row-reverse',
    wrap: 'flex flex-wrap',
    wrapReverse: 'flex flex-wrap-reverse',
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    around: 'flex items-center justify-around',
    evenly: 'flex items-center justify-evenly',
    responsive: 'flex flex-col sm:flex-row'
  },
  
  // Spacing
  spacing: {
    xs: 'p-2 sm:p-4',
    sm: 'p-3 sm:p-6',
    md: 'p-4 sm:p-6 lg:p-8',
    lg: 'p-6 sm:p-8 lg:p-12',
    responsive: 'p-4 sm:p-6 lg:p-8'
  },
  
  // Text sizes
  text: {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
    responsive: 'text-sm sm:text-base md:text-lg'
  },
  
  // Button sizes
  button: {
    xs: 'h-8 w-16 text-xs',
    sm: 'h-10 w-20 text-sm',
    base: 'h-12 w-24 text-base',
    lg: 'h-14 w-32 text-lg',
    responsive: 'h-10 w-20 sm:h-12 sm:w-24'
  },
  
  // Card layouts
  card: {
    base: 'bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6',
    compact: 'bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4',
    responsive: 'bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8'
  },
  
  // Form layouts
  form: {
    base: 'space-y-4 sm:space-y-6',
    compact: 'space-y-3 sm:space-y-4',
    responsive: 'space-y-4 sm:space-y-6 lg:space-y-8'
  },
  
  // Navigation
  nav: {
    base: 'hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-0 lg:z-40',
    mobile: 'fixed inset-0 z-50 lg:hidden',
    mobileOverlay: 'fixed inset-0 bg-gray-600 bg-opacity-75 lg:hidden',
    mobileMenu: 'fixed inset-y-0 left-0 w-64 max-w-xs sm:max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out'
  },
  
  // Tables
  table: {
    base: 'min-w-full divide-y divide-gray-200',
    responsive: 'min-w-full divide-y divide-gray-200 overflow-x-auto'
  },
  
  // Sidebar
  sidebar: {
    base: 'hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-0 lg:z-40 lg:bg-white lg:border-r lg:border-gray-200',
    mobile: 'fixed inset-y-0 left-0 w-64 max-w-xs sm:max-w-md bg-white overflow-y-auto',
    responsive: 'hidden lg:flex lg:flex-col lg:w-64 lg:bg-white lg:border-r lg:border-gray-200 lg:overflow-y-auto'
  }
}

// Hook for responsive design
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>('lg')
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < parseInt(breakpoints.sm)) {
        setScreenSize('xs')
      } else if (width < parseInt(breakpoints.md)) {
        setScreenSize('sm')
      } else if (width < parseInt(breakpoints.lg)) {
        setScreenSize('md')
      } else if (width < parseInt(breakpoints.xl)) {
        setScreenSize('lg')
      } else if (width < parseInt(breakpoints['2xl'])) {
        setScreenSize('xl')
      } else {
        setScreenSize('2xl')
      }
    }
    
    window.addEventListener('resize', handleResize)
    handleResize()
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  
  return {
    screenSize,
    isMobile: screenSize === 'xs' || screenSize === 'sm',
    isTablet: screenSize === 'md',
    isDesktop: screenSize === 'lg' || screenSize === 'xl' || screenSize === '2xl',
    breakpoints
  }
}

// Common responsive patterns
export const responsivePatterns = {
  // Mobile-first card layout
  mobileCard: 'block w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:hidden lg:block lg:w-auto lg:p-8',
  
  // Responsive grid
  responsiveGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8',
  
  // Responsive text
  responsiveText: 'text-sm sm:text-base md:text-lg lg:text-xl',
  
  // Responsive spacing
  responsivePadding: 'p-4 sm:p-6 lg:p-8',
  
  // Hide on mobile, show on desktop
  desktopOnly: 'hidden lg:block',
  mobileOnly: 'block lg:hidden',
  
  // Responsive sidebar
  responsiveSidebar: 'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:hidden lg:translate-x-full lg:translate-x-0 lg:static lg:inset-0 lg:flex lg:w-64'
}
