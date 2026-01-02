"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, BookOpen, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { apiFetch } from "@/lib/api"

import { Suspense } from "react"

function AuthPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Handle ?page=login or ?page=signup query params
  useEffect(() => {
    const page = searchParams.get("page")
    if (page === "signup") {
      setIsLogin(false)
    } else if (page === "login") {
      setIsLogin(true)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    const formData = new FormData(e.currentTarget)
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    try {
      if (isLogin) {
        const data = await apiFetch<{ access_token: string }>("/login", {
          method: "POST",
          body: JSON.stringify({ username, password }),
        })
        setSuccess("Access granted. Redirecting...")
        localStorage.setItem("token", data.access_token)
        setTimeout(() => router.push("/home"), 800)
      } else {
        await apiFetch<{ message: string; user_id: string }>("/signup", {
          method: "POST",
          body: JSON.stringify({ username, password }),
        })
        // Auto login
        const loginData = await apiFetch<{ access_token: string }>("/login", {
          method: "POST",
          body: JSON.stringify({ username, password }),
        })
        setSuccess("Account created successfully. Redirecting...")
        localStorage.setItem("token", loginData.access_token)
        setTimeout(() => router.push("/home"), 800)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Auth Error:", err)
      setError(err.message || "Authentication failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans selection:bg-gray-100">

      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-6">
        <Link href="/">
          <Button variant="ghost" className="text-gray-500 hover:text-black hover:bg-transparent pl-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">

          {/* Logo & Heading */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 bg-black rounded-xl flex items-center justify-center text-white">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {isLogin ? "Welcome back" : "Create an account"}
            </h1>
            <p className="text-gray-500 text-sm">
              {isLogin
                ? "Enter your credentials to access your dashboard"
                : "Join thousands of medical aspirants today"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  name="username"
                  type="text"
                  placeholder="Username"
                  required
                  disabled={isLoading}
                  className="h-12 border-gray-200 bg-gray-50 focus:bg-white focus:border-black focus:ring-black transition-all rounded-lg"
                />
              </div>

              <div className="space-y-2 relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  disabled={isLoading}
                  className="h-12 border-gray-200 bg-gray-50 focus:bg-white focus:border-black focus:ring-black transition-all rounded-lg pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Status Messages */}
            {isLoading && (
              <div className="flex items-center justify-center p-3 text-sm text-gray-500 bg-gray-50 rounded-lg animate-pulse">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>{success}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium rounded-lg shadow-sm transition-all text-base"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          {/* Footer / Toggle */}
          <div className="text-center text-sm text-gray-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError("")
                setSuccess("")
              }}
              className="font-semibold text-black hover:underline focus:outline-none"
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  )
}
