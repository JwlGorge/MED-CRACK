"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowRight, BookOpen, CheckCircle, Users, Zap } from "lucide-react"

// Types for API responses
interface SubjectStat {
  subject: string
  questionCount: number
}

export default function LandingPage() {
  const [subjectStats, setSubjectStats] = useState<SubjectStat[]>([])
  const [activeUsers, setActiveUsers] = useState<number>(103)
  const [totalQuestions, setTotalQuestions] = useState<number>(0)
  const router = useRouter()

  useEffect(() => {
    // Fetch subject stats and active users from backend
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/stats")
        const data = await res.json()
        setSubjectStats(data.subjectStats)
        setTotalQuestions(data.totalQuestions)
        setActiveUsers(data.activeUsers || 103)
      } catch {
        // fallback demo data
        setSubjectStats([
          { subject: "Biology", questionCount: 1200 },
          { subject: "Physics", questionCount: 900 },
          { subject: "Chemistry", questionCount: 1100 },
        ])
        setTotalQuestions(3200)
        setActiveUsers(103)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-100">
      {/* Top Banner */}
      <div className="bg-black text-white text-xs font-medium py-2 text-center tracking-wide">
        🚀 APPLICATION UNDER ACTIVE DEVELOPMENT — EARLY PREVIEW
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-black" />
            <span className="text-xl font-bold tracking-tight">MED-CRACK</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-black hover:bg-gray-50 text-sm font-medium"
              onClick={() => router.push("/auth?page=login")}
            >
              Log in
            </Button>
            <Button
              className="bg-black text-white hover:bg-gray-800 text-sm font-medium px-5 rounded-full"
              onClick={() => router.push("/auth?page=signup")}
            >
              Sign up free
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="container mx-auto px-6 text-center z-10 relative">
            <div className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-600 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
              New Questions Added Weekly
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 max-w-4xl mx-auto leading-tight">
              Master Your Medical <br />
              <span className="text-gray-400">Entrance With Precision.</span>
            </h1>

            <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              Minimalist, data-driven practice for serious aspirants.
              Track real-time progress, solve thousands of questions, and crack NEET with confidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button
                size="lg"
                className="bg-black text-white hover:bg-gray-800 rounded-full px-8 h-12 text-base shadow-lg hover:shadow-xl transition-all"
                onClick={() => router.push("/auth?page=signup")}
              >
                Start Practicing Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 h-12 text-base border-gray-200 hover:bg-gray-50 text-gray-700"
                onClick={() => router.push("/home")}
              >
                Explore Topics
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {subjectStats.map((stat) => (
                <div key={stat.subject} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">{stat.subject}</div>
                  <div className="text-4xl font-extrabold text-gray-900 mb-1">{stat.questionCount.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 font-medium">Questions Available</div>
                </div>
              ))}
            </div>

            <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-center gap-12 text-center text-gray-500">
              <div className="flex flex-col items-center">
                <Users className="w-6 h-6 mb-2 text-gray-900" />
                <span className="text-2xl font-bold text-gray-900">{activeUsers}+</span>
                <span className="text-xs uppercase tracking-wide">Active Aspirants</span>
              </div>
              <div className="w-px h-12 bg-gray-200 hidden md:block"></div>
              <div className="flex flex-col items-center">
                <CheckCircle className="w-6 h-6 mb-2 text-gray-900" />
                <span className="text-2xl font-bold text-gray-900">95%</span>
                <span className="text-xs uppercase tracking-wide">Success Rate</span>
              </div>
              <div className="w-px h-12 bg-gray-200 hidden md:block"></div>
              <div className="flex flex-col items-center">
                <Zap className="w-6 h-6 mb-2 text-gray-900" />
                <span className="text-2xl font-bold text-gray-900">{totalQuestions.toLocaleString()}</span>
                <span className="text-xs uppercase tracking-wide">Total Questions</span>
              </div>
            </div>

          </div>

          {/* Decorative background gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[800px] h-[800px] opacity-30 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full blur-3xl"></div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <span className="font-semibold text-gray-900">MED-CRACK</span>
            <span className="text-gray-300">|</span>
            <span>Excellence in Medical Entrance</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              v0.9 Beta
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
