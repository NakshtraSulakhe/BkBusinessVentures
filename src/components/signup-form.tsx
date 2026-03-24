"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('All fields are required')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name: `${firstName} ${lastName}`.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store token and redirect using correct keys
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('auth_user', JSON.stringify(data.user))
        window.location.href = '/dashboard'
      } else {
        setError(data.error || 'Failed to create account')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 shadow-2xl card-hover animate-fade-in-up max-w-6xl mx-auto">
        <CardContent className="grid p-0 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
          <div className="relative hidden bg-muted md:block animate-slide-in-left h-[600px] lg:h-[700px]">
            <img
              src="/financial-hero.svg"
              alt="Financial Management - RD, FD, Loans"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-blue-800/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white p-8 lg:p-12">
                <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 lg:mb-6">Start Your Financial Journey</h2>
                <p className="text-lg lg:text-xl xl:text-2xl mb-6 lg:mb-8">Join thousands managing their wealth smarter</p>
                <div className="grid grid-cols-3 gap-4 lg:gap-6 text-sm lg:text-base">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 lg:p-4 xl:p-5">
                    <div className="text-2xl lg:text-3xl xl:text-4xl mb-1 lg:mb-2">📈</div>
                    <div className="text-xs lg:text-sm xl:text-base">Grow Wealth</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 lg:p-4 xl:p-5">
                    <div className="text-2xl lg:text-3xl xl:text-4xl mb-1 lg:mb-2">🔒</div>
                    <div className="text-xs lg:text-sm xl:text-base">Secure Banking</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 lg:p-4 xl:p-5">
                    <div className="text-2xl lg:text-3xl xl:text-4xl mb-1 lg:mb-2">🎯</div>
                    <div className="text-xs lg:text-sm xl:text-base">Smart Goals</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="p-6 md:p-8 lg:p-10 xl:p-12 animate-slide-in-right h-[600px] lg:h-[700px] overflow-y-auto">
            <FieldGroup>
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 lg:w-12 lg:h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Create Account</h1>
                <p className="text-lg lg:text-xl text-balance text-muted-foreground">
                  Start managing your finances with BK Business Ventures
                </p>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="firstName" className="flex items-center gap-2 text-lg lg:text-xl">
                    <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    First Name
                  </FieldLabel>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    required
                    className="h-12 lg:h-14 text-lg lg:text-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 input-enhanced"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName" className="flex items-center gap-2 text-lg lg:text-xl">
                    <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Last Name
                  </FieldLabel>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    required
                    className="h-12 lg:h-14 text-lg lg:text-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 input-enhanced"
                  />
                </Field>
              </div>
              
              <Field>
                <FieldLabel htmlFor="email" className="flex items-center gap-2 text-lg lg:text-xl">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                  className="h-12 lg:h-14 text-lg lg:text-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 input-enhanced"
                />
              </Field>
              
              <Field>
                <FieldLabel htmlFor="phone" className="flex items-center gap-2 text-lg lg:text-xl">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Phone Number
                </FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  required
                  className="h-12 lg:h-14 text-lg lg:text-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 input-enhanced"
                />
              </Field>
              
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password" className="flex items-center gap-2 text-lg lg:text-xl">
                    <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Password
                  </FieldLabel>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Create a strong password"
                  required 
                  className="h-12 lg:h-14 text-lg lg:text-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 input-enhanced"
                />
              </Field>
              
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="confirmPassword" className="flex items-center gap-2 text-lg lg:text-xl">
                    <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Confirm Password
                  </FieldLabel>
                </div>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="Confirm your password"
                  required 
                  className="h-12 lg:h-14 text-lg lg:text-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 input-enhanced"
                />
              </Field>
              
              <Field>
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the <a href="#" className="text-blue-600 hover:text-blue-800 underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:text-blue-800 underline">Privacy Policy</a>
                  </label>
                </div>
              </Field>
              
              <Field>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full btn-primary text-white font-semibold py-4 lg:py-5 px-4 lg:px-6 rounded-lg text-lg lg:text-xl transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 input-enhanced disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-6 w-6 lg:w-7 lg:h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Create Account
                    </>
                  )}
                </Button>
              </Field>
              
              <FieldDescription className="text-center text-lg lg:text-xl">
                Already have an account? <a href="/login" className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors duration-200">Sign in</a>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
