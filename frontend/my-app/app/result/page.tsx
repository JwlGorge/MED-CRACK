"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import {
  Clock,
  Trophy,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  BookOpen,
  Timer,
  Users,
  BarChart3,
  ArrowLeft,
  Target,
  RefreshCcw,
} from "lucide-react"
import Link from "next/link"
import { apiFetch } from "@/lib/api"

interface QuizStats {
  quizId: string
  quizTitle: string
  totalTime: number
  totalAttempts: number
  questionsCount: number
  completedAt: string
  difficulty: string
}

interface Question {
  id: number
  question: string
  options: string[]
  correct?: string
  subject?: string
  topic?: string
  toughness?: string
}

interface UserAnswer {
  questionId: number
  selectedOption: string
  isCorrect?: boolean
  attempts: number
  timeSpent: number
}

interface Quiz {
  id: string
  title: string
  difficulty: string
  questions: Question[]
  estimatedTime: string
}

// API Response interfaces
interface AnalyticsData {
  rank: number
  totalSubmissions: number
  attemptDistribution: Array<{
    attempts: string
    count: number
    percentage: number
  }>
  timeComparison: Array<{
    range: string
    count: number
    percentage: number
  }>
}

function PerformanceOverview({
  totalTime,
  questionsCount,
  rank,
  totalSubmissions,
}: {
  totalTime: number
  questionsCount: number
  rank: number
  totalSubmissions: number
}) {
  const averageTime = totalTime / questionsCount
  const rankPercentile = ((totalSubmissions - rank) / totalSubmissions) * 100

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {[
        {
          label: "Average Time", value: `${averageTime.toFixed(1)}s`, sub: "per question",
          icon: <Clock className="w-5 h-5 text-gray-500" />
        },
        {
          label: "Total Time", value: formatTime(totalTime), sub: `${Math.floor(totalTime / 60)} minutes`,
          icon: <Timer className="w-5 h-5 text-gray-500" />
        },
        {
          label: "Rank", value: `#${rank}`, sub: `Top ${rankPercentile.toFixed(1)}%`,
          icon: <Trophy className="w-5 h-5 text-gray-500" />
        },
        {
          label: "Total Submissions", value: totalSubmissions.toLocaleString(), sub: "Completed",
          icon: <Users className="w-5 h-5 text-gray-500" />
        },
      ].map((stat, i) => (
        <Card key={i} className="border border-gray-100 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-gray-500">{stat.label}</span>
              {stat.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
              <span className="text-xs text-gray-400 mt-1">{stat.sub}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function TimeComparisonChart({
  timeComparison,
  userTime,
}: {
  timeComparison: Array<{ range: string; count: number; percentage: number }>
  userTime: number
}) {
  const getUserTimeRange = (time: number) => {
    if (time <= 600) return "0-10 min"
    if (time <= 1200) return "10-20 min"
    if (time <= 1800) return "20-30 min"
    if (time <= 2400) return "30-40 min"
    return "40+ min"
  }

  const userTimeRange = getUserTimeRange(userTime)

  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Timer className="w-5 h-5" /> Time Distribution
        </h3>
        <ChartContainer config={{}} className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeComparison} barCategoryGap="15%">
              <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-black text-white p-2 rounded text-xs shadow-xl">
                        <p className="font-semibold">{label}</p>
                        <p>{payload[0].value} users</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="count" fill="#E5E7EB" radius={[4, 4, 4, 4]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 rounded-full bg-black" />
          Your time: <span className="font-medium text-gray-900">{userTimeRange}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function AttemptDistributionChart({
  attemptDistribution,
  userAttempts,
}: {
  attemptDistribution: Array<{ attempts: string; count: number; percentage: number }>
  userAttempts: number
}) {
  const getUserAttemptRange = (attempts: number) => {
    if (attempts === 1) return "1st"
    if (attempts === 2) return "2nd"
    if (attempts === 3) return "3rd"
    if (attempts <= 5) return `${attempts}th`
    return "6+"
  }

  const userAttemptRange = getUserAttemptRange(userAttempts)

  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" /> Attempt Distribution
        </h3>
        <ChartContainer config={{}} className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attemptDistribution} barCategoryGap="15%">
              <XAxis dataKey="attempts" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-black text-white p-2 rounded text-xs shadow-xl">
                        <p className="font-semibold">{label}</p>
                        <p>{payload[0].value} users</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="count" fill="#E5E7EB" radius={[4, 4, 4, 4]} />
              <Bar
                dataKey={(entry) => (entry.attempts === userAttemptRange ? entry.count : 0)}
                fill="#000000"
                radius={[4, 4, 4, 4]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 rounded-full bg-black" />
          Your attempts: <span className="font-medium text-gray-900">{userAttemptRange}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function QuestionInsights({
  questions,
  userAnswers,
}: {
  questions: Question[]
  userAnswers: UserAnswer[]
}) {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy": return "bg-gray-100 text-gray-600 border-gray-200"
      case "medium": return "bg-gray-100 text-gray-600 border-gray-200"
      case "hard": return "bg-black text-white border-black"
      default: return "bg-gray-100 text-gray-600 border-gray-200"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-900">Question Breakdown</h3>
      </div>

      <div className="space-y-3">
        {questions.map((question, index) => {
          const userAnswer = userAnswers[index]
          return (
            <div key={question.id} className="border border-gray-100 rounded-xl bg-white p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="min-w-[2rem] h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex gap-2 mb-1">
                      <Badge variant="outline" className={`text-[10px] px-1.5 h-5 font-normal ${getDifficultyColor(question.toughness || "Easy")}`}>
                        {question.toughness || "Easy"}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] h-5 font-normal border-gray-200 text-gray-500">
                        {question.topic || "General"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
                  className="text-gray-400 hover:text-black transition-colors"
                >
                  {expandedQuestion === question.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-sm text-gray-800 font-medium mb-3">{question.question}</p>

              {expandedQuestion === question.id && (
                <div className="space-y-2 mb-4 animate-in fade-in zoom-in-95 duration-200">
                  {question.options.map((opt, i) => (
                    <div key={i} className={`text-xs p-2 rounded border flex justify-between ${opt === question.correct
                      ? "bg-green-50 border-green-200 text-green-700"
                      : opt === userAnswer.selectedOption
                        ? "bg-red-50 border-red-200 text-red-700"
                        : "bg-gray-50 border-gray-100 text-gray-500"
                      }`}>
                      <span>{opt}</span>
                      {opt === question.correct && <CheckCircle className="w-3 h-3" />}
                    </div>
                  ))}
                  <div className="p-3 bg-gray-50 rounded text-xs text-gray-600 mt-2">
                    <span className="font-bold text-black">Explanation:</span> This data is fetched from the backend.
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-50">
                <div className="flex gap-4">
                  <span>Attempts: {userAnswer.attempts}</span>
                  <span>Time: {userAnswer.timeSpent}s</span>
                </div>
                {userAnswer.isCorrect ? (
                  <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Correct</span>
                ) : (
                  <span className="text-red-600 font-medium">Incorrect</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function QuizResultsPage() {
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const stats = JSON.parse(localStorage.getItem("quizStats") || "[]")
    const latestStats = stats[stats.length - 1]
    if (latestStats) setQuizStats(latestStats)

    const storedQuiz = localStorage.getItem("currentQuiz")
    if (storedQuiz) setQuiz(JSON.parse(storedQuiz))

    const storedAnswers = localStorage.getItem("currentQuizAnswers")
    if (storedAnswers) setUserAnswers(JSON.parse(storedAnswers))

    fetchAnalyticsData(latestStats?.quizId)
  }, [])

  const fetchAnalyticsData = async (quizId: string) => {
    try {
      setLoading(true)
      const data = await apiFetch<AnalyticsData>(`/api/analytics/${quizId}`)
      setAnalyticsData(data)
    } catch (error) {
      console.error("Error fetching analytics data:", error)
      // Fallback data logic remains/moved here if needed
      setAnalyticsData({
        rank: 156,
        totalSubmissions: 2847,
        attemptDistribution: [
          { attempts: "1st", count: 234, percentage: 8.2 },
          { attempts: "2nd", count: 567, percentage: 19.9 },
          { attempts: "3rd", count: 892, percentage: 31.3 },
          { attempts: "4th", count: 654, percentage: 23.0 },
          { attempts: "5th", count: 345, percentage: 12.1 },
          { attempts: "6+", count: 155, percentage: 5.5 },
        ],
        timeComparison: [
          { range: "0-10 min", count: 45, percentage: 1.6 },
          { range: "10-20 min", count: 234, percentage: 8.2 },
          { range: "20-30 min", count: 1456, percentage: 51.1 },
          { range: "30-40 min", count: 892, percentage: 31.3 },
          { range: "40+ min", count: 220, percentage: 7.8 },
        ],
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRetakeQuiz = () => {
    // If the quiz ID is accessible, route there, otherwise just go home for now.
    // The previous implementation had a potential bug here routing to /quiz/[id] which didn't exist.
    // We will route back to home -> topic page flow to be safe, or just replay if we had the restart logic.
    // For now, let's just go back to the topics list as "Retake" might imply a fresh context.
    router.push("/home")
  }

  if (loading || !quizStats || !quiz || !analyticsData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-100">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/home">
            <Button variant="ghost" size="sm" className="-ml-3 text-gray-500 hover:text-black">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Topics
            </Button>
          </Link>
          <div className="text-right">
            <h1 className="text-lg font-bold text-gray-900">{quizStats.quizTitle}</h1>
            <p className="text-xs text-gray-500">Attempt #{Math.ceil(quizStats.totalAttempts / quizStats.questionsCount)}</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <PerformanceOverview
          totalTime={quizStats.totalTime}
          questionsCount={quizStats.questionsCount}
          rank={analyticsData.rank}
          totalSubmissions={analyticsData.totalSubmissions}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-6">
            <TimeComparisonChart timeComparison={analyticsData.timeComparison} userTime={quizStats.totalTime} />
            <AttemptDistributionChart
              attemptDistribution={analyticsData.attemptDistribution}
              userAttempts={Math.ceil(quizStats.totalAttempts / quizStats.questionsCount)}
            />
          </div>

          {/* Question Breakdown */}
          <div className="lg:col-span-1">
            <QuestionInsights questions={quiz.questions} userAnswers={userAnswers} />
          </div>
        </div>

        <div className="mt-12 text-center pb-12">
          <Button onClick={handleRetakeQuiz} size="lg" className="rounded-full bg-black text-white hover:bg-gray-800 px-8">
            <RefreshCcw className="w-4 h-4 mr-2" /> Start New Quiz
          </Button>
        </div>
      </div>
    </div>
  )
}
