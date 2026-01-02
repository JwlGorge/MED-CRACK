"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, BookOpen, TrendingUp, ArrowRight, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"

// Types for API responses
interface Subject {
  id: string
  name: string
  isActive?: boolean
}

interface Topic {
  id: string
  name: string
  difficulty: "Easy" | "Medium" | "Hard"
  questionCount: number
  subject: string
  description?: string
}

interface ImportantTopic {
  id: string
  name: string
  subject: string
  priority: number
}

export default function HomePage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [importantTopics, setImportantTopics] = useState<ImportantTopic[]>([])
  const [activeSubject, setActiveSubject] = useState<string>("All Topics")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Fetch subjects from backend
  useEffect(() => {
    // Static mock for now as per previous implementation, but ready for API
    setSubjects([
      { id: "all", name: "All Topics", isActive: true },
      { id: "biology", name: "Biology", isActive: true },
      { id: "physics", name: "Physics", isActive: true },
      { id: "chemistry", name: "Chemistry", isActive: true },
    ])
  }, [])

  // Fetch topics based on active subject and search query
  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoading(true)
      try {
        const data = await apiFetch<Topic[]>("/topic")

        // Filter based on active subject and search
        let filteredTopics = data
        if (activeSubject !== "All Topics") {
          filteredTopics = filteredTopics.filter((topic) => topic.subject === activeSubject)
        }
        if (searchQuery) {
          filteredTopics = filteredTopics.filter(
            (topic) =>
              topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              topic.description?.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        }

        setTopics(filteredTopics)
      } catch (error) {
        console.error("Failed to fetch topics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopics()
  }, [activeSubject, searchQuery])

  // Fetch important topics for sidebar
  useEffect(() => {
    const fetchImportantTopics = async () => {
      try {
        const data = await apiFetch<ImportantTopic[]>("/important")

        let filteredImportantTopics = data
        if (activeSubject !== "All Topics") {
          filteredImportantTopics = filteredImportantTopics.filter(
            (topic: ImportantTopic) => topic.subject === activeSubject
          )
        }

        setImportantTopics(filteredImportantTopics)
      } catch (error) {
        console.error("Failed to fetch important topics:", error)
      }
    }

    fetchImportantTopics()
  }, [activeSubject])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "Medium":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "Hard":
        return "bg-black text-white border-black"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Handle topic click - navigate to topic detail page
  const handleTopicClick = (topicId: string) => {
    router.push(`/topic/${topicId}`)
  }

  // Handle important topic click
  const handleImportantTopicClick = (topicId: string) => {
    router.push(`/topic/${topicId}`)
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2" onClick={() => router.push("/")} style={{ cursor: 'pointer' }}>
            <BookOpen className="h-6 w-6 text-black" />
            <span className="text-xl font-bold tracking-tight">MED-CRACK</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/profile">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-50">
                <User className="h-5 w-5 text-gray-600" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Sidebar (Left) - Filters & Important */}
          <div className="lg:col-span-3 space-y-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Subjects</h3>
              <div className="flex flex-col space-y-2">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => setActiveSubject(subject.name)}
                    className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeSubject === subject.name
                      ? "bg-black text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-50 hover:text-black"
                      }`}
                  >
                    {subject.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden lg:block">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Priority Topics
              </h3>
              <div className="space-y-2">
                {importantTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="p-3 rounded-lg border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group bg-white"
                    onClick={() => handleImportantTopicClick(topic.name)}
                  >
                    <p className="text-sm font-medium text-gray-900 group-hover:underline decoration-1 underline-offset-2">
                      {topic.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{topic.subject}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content (Right) */}
          <div className="lg:col-span-9">
            {/* Header Area */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">{activeSubject}</h2>
              <p className="text-gray-500">Explore curated questions to boost your preparation.</p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8 max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 text-base rounded-full border-gray-200 focus:border-black focus:ring-black bg-gray-50 focus:bg-white transition-all"
              />
            </div>

            {/* Topics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading ? (
                // Skeleton Loading
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-gray-50 rounded-xl animate-pulse border border-gray-100"></div>
                ))
              ) : topics.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No topics found matching your criteria</p>
                </div>
              ) : (
                topics.map((topic) => (
                  <Card
                    key={topic.id}
                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:border-black/10 rounded-xl overflow-hidden"
                    onClick={() => handleTopicClick(topic.name)}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors duration-300">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className={`font-normal ${getDifficultyColor(topic.difficulty)}`}>
                          {topic.difficulty}
                        </Badge>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {topic.name}
                      </h3>

                      {topic.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{topic.description}</p>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {topic.questionCount} Questions
                        </span>
                        <span className="group-hover:translate-x-1 transition-transform duration-300">
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-black" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
