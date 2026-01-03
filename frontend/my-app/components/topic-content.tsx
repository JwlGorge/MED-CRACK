"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
    ChevronDown,
    ChevronUp,
    ArrowLeft,
    Clock,
    Target,
    BookOpen,
    Brain,
    Stethoscope,
    CheckCircle,
    ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"

interface Question {
    id: string
    question: string
    options: string[]
    correctAnswer?: string
    correct: number
    subject?: string
    topic?: string
    difficulty: "Easy" | "Medium" | "Hard"
}

interface Quiz {
    id: string
    title: string
    difficulty: "Easy" | "Medium" | "Hard"
    questions: Question[]
    isCompleted: boolean
    estimatedTime: string
}

interface TopicData {
    title: string
    icon: string
    questions: Question[]
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
    const getVariant = (diff: string) => {
        switch (diff.toLowerCase()) {
            case "easy":
                return "bg-gray-100 text-gray-700 border-gray-200"
            case "medium":
                return "bg-gray-100 text-gray-700 border-gray-200"
            case "hard":
                return "bg-black text-white border-black"
            default:
                return "bg-gray-100 text-gray-700 border-gray-200"
        }
    }

    return <Badge variant="outline" className={`${getVariant(difficulty)} font-normal px-2.5`}>{difficulty}</Badge>
}

function QuizCard({ quiz, onStartQuiz }: { quiz: Quiz; onStartQuiz: (quizId: string) => void }) {
    return (
        <Card
            className={`group transition-all duration-300 cursor-pointer border border-gray-200 hover:border-black hover:shadow-md ${quiz.isCompleted ? "bg-gray-50 opacity-80" : "bg-white"
                }`}
            onClick={() => !quiz.isCompleted && onStartQuiz(quiz.id)}
        >
            <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <DifficultyBadge difficulty={quiz.difficulty} />
                    {quiz.isCompleted && (
                        <div className="flex items-center text-green-600 text-xs font-semibold uppercase tracking-wide">
                            <CheckCircle className="w-3 h-3 mr-1" /> Completed
                        </div>
                    )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {quiz.title}
                </h3>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-6 font-medium">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {quiz.estimatedTime}</span>
                    <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {quiz.questions.length} Qs</span>
                </div>

                <Button
                    className={`w-full h-10 rounded-lg text-sm font-medium transition-all ${quiz.isCompleted
                        ? "bg-gray-200 text-gray-500 hover:bg-gray-200 cursor-default"
                        : "bg-black text-white hover:bg-gray-800"
                        }`}
                    disabled={quiz.isCompleted}
                >
                    {quiz.isCompleted ? "Completed" : "Start Quiz"}
                    {!quiz.isCompleted && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
            </CardContent>
        </Card>
    )
}

function DifficultySection({
    difficulty,
    quizzes,
    isOpen,
    onToggle,
    onStartQuiz,
}: {
    difficulty: string
    quizzes: Quiz[]
    isOpen: boolean
    onToggle: () => void
    onStartQuiz: (quizId: string) => void
}) {
    const availableQuizzes = quizzes.filter((quiz) => !quiz.isCompleted)
    const completedCount = quizzes.filter((quiz) => quiz.isCompleted).length
    const totalQuestions = quizzes.reduce((total, quiz) => total + quiz.questions.length, 0)

    return (
        <Collapsible open={isOpen} onOpenChange={onToggle} className="border border-gray-100 rounded-xl bg-white overflow-hidden shadow-sm">
            <CollapsibleTrigger asChild>
                <div className="w-full p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${difficulty === 'Hard' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {difficulty === 'Easy' && <BookOpen className="w-5 h-5" />}
                            {difficulty === 'Medium' && <Brain className="w-5 h-5" />}
                            {difficulty === 'Hard' && <Stethoscope className="w-5 h-5" />}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{difficulty} Level</h2>
                            <p className="text-sm text-gray-500">
                                {availableQuizzes.length} available • {completedCount} completed
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:inline-block">
                            {totalQuestions} Questions
                        </span>
                        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </div>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="p-5 pt-0 bg-gray-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        {availableQuizzes.slice(0, 3).map((quiz) => (
                            <QuizCard key={quiz.id} quiz={quiz} onStartQuiz={onStartQuiz} />
                        ))}
                    </div>
                    {availableQuizzes.length === 0 && (
                        <div className="text-center py-8">
                            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                            <p className="text-gray-900 font-medium">All clear!</p>
                            <p className="text-sm text-gray-500">You&apos;ve mastered this difficulty level.</p>
                        </div>
                    )}
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}

interface TopicContentProps {
    topicId: string
}

export default function TopicContent({ topicId }: TopicContentProps) {
    const [topicData, setTopicData] = useState<TopicData | null>(null)
    const [quizzes, setQuizzes] = useState<Quiz[]>([])
    const [loading, setLoading] = useState(true)
    const [completedQuizzes, setCompletedQuizzes] = useState<Set<string>>(new Set())
    const router = useRouter()

    const [isGuest, setIsGuest] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem(`completed-quizzes-${topicId}`)
        if (saved) {
            setCompletedQuizzes(new Set(JSON.parse(saved)))
        }
        const token = localStorage.getItem("token")
        setIsGuest(!token)
    }, [topicId])

    useEffect(() => {
        localStorage.setItem(`completed-quizzes-${topicId}`, JSON.stringify([...completedQuizzes]))
    }, [completedQuizzes, topicId])

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true)
                // apiFetch handles token automatically from localStorage if present
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const rawQuestions = await apiFetch<any[]>(`/questions/${topicId}`)

                if (!Array.isArray(rawQuestions)) return;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const questions: Question[] = rawQuestions.map((q: any) => ({
                    id: String(q.id),
                    question: q.question,
                    options: q.options,
                    correct: q.correct,
                    correctAnswer: q.options[q.correct],
                    difficulty: q.toughness ? (q.toughness.charAt(0).toUpperCase() + q.toughness.slice(1).toLowerCase() as "Easy" | "Medium" | "Hard") : "Medium",
                    subject: q.subject,
                }))

                setTopicData({
                    title: topicId.charAt(0).toUpperCase() + topicId.slice(1),
                    icon: "📚",
                    questions,
                })

                const groupedQuestions = questions.reduce(
                    (acc, question) => {
                        if (!acc[question.difficulty]) acc[question.difficulty] = []
                        acc[question.difficulty].push(question)
                        return acc
                    },
                    {} as Record<string, Question[]>,
                )

                const createdQuizzes: Quiz[] = []
                Object.entries(groupedQuestions).forEach(([difficulty, difficultyQuestions]) => {
                    const chunks = []
                    for (let i = 0; i < difficultyQuestions.length; i += 5) {
                        chunks.push(difficultyQuestions.slice(i, i + 5))
                    }
                    chunks.forEach((chunk, index) => {
                        const quizId = `${difficulty.toLowerCase()}-quiz-${index + 1}`
                        createdQuizzes.push({
                            id: quizId,
                            title: `${difficulty} Quiz ${index + 1}`,
                            difficulty: difficulty as "Easy" | "Medium" | "Hard",
                            questions: chunk,
                            isCompleted: completedQuizzes.has(quizId),
                            estimatedTime: `${Math.ceil(chunk.length * 2)} min`,
                        })
                    })
                })
                setQuizzes(createdQuizzes)
            } catch (error) {
                console.error("Error fetching questions:", error)
            } finally {
                setLoading(false)
            }
        }

        if (topicId) fetchQuestions()
    }, [topicId, completedQuizzes, router])

    const handleStartQuiz = (quizId: string) => {
        const quiz = quizzes.find(q => q.id === quizId)
        if (!quiz) return
        localStorage.setItem("currentQuiz", JSON.stringify(quiz))
        setCompletedQuizzes((prev) => new Set([...prev, quizId]))
        router.push(`/quizpage`)
    }

    const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
        Easy: true, Medium: true, Hard: false,
    })

    const toggleSection = (difficulty: string) => {
        setOpenSections((prev) => ({ ...prev, [difficulty]: !prev[difficulty] }))
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
        )
    }

    if (!topicData) return null

    const groupedQuizzes = quizzes.reduce(
        (acc, quiz) => {
            if (!acc[quiz.difficulty]) acc[quiz.difficulty] = []
            acc[quiz.difficulty].push(quiz)
            return acc
        },
        {} as Record<string, Quiz[]>,
    )

    const totalQuestions = topicData.questions.length
    const completedQuizzesCount = completedQuizzes.size

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-100">

            {isGuest && (
                <div className="bg-black text-white text-center py-2 px-4 text-sm font-medium">
                    You are viewing a public preview. <Link href="/auth?page=login" className="underline hover:text-gray-200">Log in</Link> to access 1000+ questions and track your progress.
                </div>
            )}

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/home">
                            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-black hover:bg-transparent">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{topicData.title}</h1>
                            <p className="text-xs text-gray-500">Topic Overview</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden sm:block text-right">
                            <span className="block text-lg font-bold text-black">{totalQuestions}</span>
                            <span className="text-xs text-gray-400 uppercase tracking-wider">Questions</span>
                        </div>
                        <div className="hidden sm:block text-right">
                            <span className="block text-lg font-bold text-green-600">{completedQuizzesCount}</span>
                            <span className="text-xs text-gray-400 uppercase tracking-wider">Completed</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-screen-lg mx-auto px-4 py-8">
                <div className="space-y-6">
                    {["Easy", "Medium", "Hard"].map((difficulty) => {
                        const difficultyQuizzes = groupedQuizzes[difficulty] || []
                        if (difficultyQuizzes.length === 0) return null
                        return (
                            <DifficultySection
                                key={difficulty}
                                difficulty={difficulty}
                                quizzes={difficultyQuizzes}
                                isOpen={openSections[difficulty]}
                                onToggle={() => toggleSection(difficulty)}
                                onStartQuiz={handleStartQuiz}
                            />
                        )
                    })}
                </div>

                {quizzes.length === 0 && (
                    <div className="text-center py-20">
                        <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">No quizzes available</h3>
                        <p className="text-gray-500 mt-2">Check back soon for new content.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
