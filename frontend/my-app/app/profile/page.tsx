"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Bell,
  User,
  MessageCircle,
  Star,
  Calendar,
  List,
  FileText,
  Users,
  Target,
  ArrowLeft,
  Award,
  ChevronRight,
  LogOut,
  Settings
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"

// Mock data - replace with real data from your API
interface ProfileData {
  username: string
  displayName: string
  rank: number
  badgeLevel: string
  experiencePoints: number
  nextLevelPoints: number
  activeDays: number
  totalSubmissions: number
  problemStats: {
    easy: { solved: number; total: number }
    medium: { solved: number; total: number }
    hard: { solved: number; total: number }
  }
  stats: {
    discussions: number
    reputation: number
  }
  acceptance: number
}

function NavigationHeader() {
  const router = useRouter()
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/home">
            <Button variant="ghost" size="sm" className="-ml-3 text-gray-500 hover:text-black hover:bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-black">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

function ProfileSidebar({ data }: { data: ProfileData }) {
  const router = useRouter()
  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/auth")
  }

  return (
    <Card className="border border-gray-100 shadow-sm bg-white overflow-hidden">
      <div className="h-24 bg-gray-50 border-b border-gray-100"></div>
      <CardContent className="px-6 pb-6 relative">
        <div className="absolute -top-12 left-6">
          <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-sm flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-black text-white flex items-center justify-center text-2xl font-bold">
              {data.displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <div className="mt-14 mb-6">
          <h2 className="text-xl font-bold text-gray-900">{data.displayName}</h2>
          <p className="text-sm text-gray-500">@{data.username}</p>
          <div className="flex gap-2 mt-3">
            <Badge variant="outline" className="font-normal border-gray-200 text-gray-600 bg-gray-50">
              Rank #{data.rank.toLocaleString()}
            </Badge>
            <Badge variant="outline" className="font-normal border-gray-200 text-gray-600 bg-gray-50">
              {data.activeDays} Active Days
            </Badge>
          </div>
        </div>

        <Button
          className="w-full mb-4 bg-black text-white hover:bg-gray-800 rounded-lg justify-start"
          variant="default"
        >
          Edit Profile
        </Button>
        <Button
          className="w-full border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200 justify-start"
          variant="outline"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </CardContent>
    </Card>
  )
}

function StatsCircle({ data }: { data: ProfileData }) {
  const { totalSubmissions, problemStats } = data
  const totalSolved = (problemStats?.easy?.solved || 0) + (problemStats?.medium?.solved || 0) + (problemStats?.hard?.solved || 0)
  const totalEasy = problemStats?.easy?.total || 100
  const totalMedium = problemStats?.medium?.total || 100
  const totalHard = problemStats?.hard?.total || 100
  const totalProblems = totalEasy + totalMedium + totalHard

  const acceptance = totalSubmissions > 0 ? (totalSolved / totalSubmissions) * 100 : 0

  return (
    <Card className="border border-gray-100 shadow-sm bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Target className="w-5 h-5" />
          Progress Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Circular Progress */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="40"
                  stroke="#f3f4f6" strokeWidth="6" fill="none"
                />
                <circle
                  cx="50" cy="50" r="40"
                  stroke="currentColor" strokeWidth="6" fill="none"
                  strokeDasharray={`${acceptance * 2.51} 251.2`}
                  className="text-black transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-extrabold text-gray-900">{Math.round(acceptance)}%</span>
                <span className="text-xs text-gray-500 uppercase tracking-widest mt-1">Acceptance</span>
              </div>
            </div>
          </div>

          {/* Stats Bars */}
          <div className="space-y-6 w-full">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">{totalSolved}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Solved</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">{totalSubmissions}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Submissions</div>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: "Easy", current: problemStats.easy.solved, total: totalEasy, color: "bg-gray-300" },
                { label: "Medium", current: problemStats.medium.solved, total: totalMedium, color: "bg-gray-500" },
                { label: "Hard", current: problemStats.hard.solved, total: totalHard, color: "bg-black" }
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-gray-700">{stat.label}</span>
                    <span className="text-gray-500">{stat.current} / {stat.total}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${stat.color}`}
                      style={{ width: `${(stat.current / stat.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BadgesSidebar({ data }: { data: ProfileData }) {
  const progressToNext = (data.experiencePoints / data.nextLevelPoints) * 100

  return (
    <Card className="border border-gray-100 shadow-sm bg-white h-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Award className="w-5 h-5" />
          Current Level
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 text-center mb-6">
          <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto text-2xl mb-3 shadow-lg">
            {data.badgeLevel === 'Rookie' ? '🌱' : data.badgeLevel === 'Experienced' ? '⭐' : '🏆'}
          </div>
          <h3 className="font-bold text-gray-900">{data.badgeLevel}</h3>
          <p className="text-xs text-gray-500 mt-1">Keep learning to level up!</p>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-xs font-medium text-gray-600">
            <span>XP Progress</span>
            <span>{data.experiencePoints} / {data.nextLevelPoints}</span>
          </div>
          <Progress value={progressToNext} className="h-2 bg-gray-100" />
          {/* Note: Ideally custom class for black progress bar or use `className="[&>div]:bg-black"` if supported */}
        </div>

        <div className="pt-6 border-t border-gray-100 space-y-4">
          <div className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-gray-600" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">Discussions</p>
                <p className="text-xs text-gray-500">{data.stats.discussions} posts</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-black" />
          </div>

          <div className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Star className="w-4 h-4 text-gray-600" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">Reputation</p>
                <p className="text-xs text-gray-500">{data.stats.reputation} points</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-black" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BottomTabs() {
  const [activeTab, setActiveTab] = useState("recent")

  const tabs = [
    { id: "recent", label: "Activity", icon: Calendar },
    { id: "list", label: "Lists", icon: List },
    { id: "solutions", label: "Solutions", icon: FileText },
  ]

  return (
    <Card className="border border-gray-100 shadow-sm bg-white">
      <div className="flex border-b border-gray-100 px-2 pt-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${activeTab === tab.id
              ? "border-black text-black"
              : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-t-lg"
              }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <CardContent className="p-8">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <div className="text-gray-300">
              {activeTab === 'recent' && <Calendar className="w-6 h-6" />}
              {activeTab === 'list' && <List className="w-6 h-6" />}
              {activeTab === 'solutions' && <FileText className="w-6 h-6" />}
            </div>
          </div>
          <p className="text-gray-900 font-medium">No {activeTab} yet</p>
          <p className="text-sm text-gray-500 mt-1">Your activity will appear here once you start using the platform.</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiFetch<ProfileData>("/api/user/profile")
        setProfileData(data)
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!profileData) {
    // Fallback for demo when no token/backend connection
    // You might want to remove this or handle it differently
    return (
      <div className="min-h-screen bg-white flex items-center justify-center flex-col gap-4">
        <h2 className="text-xl font-bold">Please Sign In</h2>
        <Link href="/auth">
          <Button className="bg-black text-white px-8">Go to Login</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-gray-100 pb-20">
      <NavigationHeader />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <ProfileSidebar data={profileData} />
            <div className="hidden lg:block">
              <BadgesSidebar data={profileData} />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-8">
            <StatsCircle data={profileData} />
            <BottomTabs />

            {/* Mobile-only badges section at bottom */}
            <div className="lg:hidden">
              <BadgesSidebar data={profileData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
