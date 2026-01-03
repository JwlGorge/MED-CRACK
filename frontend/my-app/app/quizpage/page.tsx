"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Timer, X, Flag } from "lucide-react"

/* ================= TYPES ================= */

interface Question {
  id: number
  question: string
  options: string[]
  correct: number
  subject?: string
  topic?: string
  toughness?: string
}

interface Quiz {
  id: string
  title: string
  difficulty: string
  questions: Question[]
  estimatedTime: string
}

interface UserAnswer {
  questionId: number
  selectedOption: number | null
  isCorrect?: boolean
  attempts: number
  timeSpent: number
}

interface QuizStats {
  quizId: string
  quizTitle: string
  totalTime: number
  totalAttempts: number
  questionsCount: number
  completedAt: string
  difficulty: string
}

/* ================= UI COMPONENTS ================= */

function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerChange,
  onFlag,
  showIncorrect = false,
  isFlagged = false,
}: {
  question: Question
  questionNumber: number
  totalQuestions: number
  selectedAnswer: string
  onAnswerChange: (value: string) => void
  onFlag: () => void
  showIncorrect?: boolean
  isFlagged?: boolean
}) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-500 uppercase tracking-widest">
            Question {questionNumber} / {totalQuestions}
          </span>
          <div className="flex items-center gap-3">
            {showIncorrect && (
              <span className="text-xs font-bold text-red-600 animate-pulse flex items-center gap-1 bg-red-50 px-2 py-1 rounded">
                <X className="w-3 h-3" /> Incorrect
              </span>
            )}
            <button
              onClick={onFlag}
              className={`text-gray-400 hover:text-red-500 transition-colors ${isFlagged ? 'text-red-500' : ''}`}
              title="Report issue"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
          {question.question}
        </h2>
      </div>

      <RadioGroup value={selectedAnswer} onValueChange={onAnswerChange} className="space-y-4">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === option
          return (
            <label
              key={index}
              className={`flex items-center p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${isSelected
                ? "border-black bg-gray-50"
                : "border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                }`}
            >
              <RadioGroupItem value={option} id={`opt-${index}`} className="hidden" />
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0 transition-colors ${isSelected ? "border-black bg-black" : "border-gray-300 group-hover:border-gray-400"
                }`}>
                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <span className={`text-base md:text-lg font-medium ${isSelected ? "text-gray-900" : "text-gray-600"}`}>
                {option}
              </span>
            </label>
          )
        })}
      </RadioGroup>
    </div>
  )
}

function QuestionIndicators({
  totalQuestions,
  currentQuestionIndex,
  userAnswers,
  showIncorrectFeedback,
  quiz,
  onQuestionClick,
}: {
  totalQuestions: number
  currentQuestionIndex: number
  userAnswers: UserAnswer[]
  showIncorrectFeedback: boolean
  quiz: Quiz
  onQuestionClick: (index: number) => void
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
      {Array.from({ length: totalQuestions }, (_, index) => {
        const question = quiz.questions[index]
        const selectedOption = userAnswers[index]?.selectedOption
        const isIncorrect = showIncorrectFeedback && userAnswers[index]?.selectedOption !== question.correct
        const isCurrent = index === currentQuestionIndex
        const isAnswered = selectedOption !== null && selectedOption !== undefined

        let baseClasses = "w-2.5 h-2.5 rounded-full transition-all duration-300"
        let colorClasses = "bg-gray-200"

        if (isCurrent) {
          baseClasses = "w-8 h-2.5 rounded-full"
          colorClasses = "bg-black"
        } else if (isIncorrect) {
          colorClasses = "bg-red-500"
        } else if (isAnswered) {
          colorClasses = "bg-gray-400"
        }

        return (
          <button
            key={index}
            onClick={() => onQuestionClick(index)}
            className={`${baseClasses} ${colorClasses} hover:bg-gray-800`}
            aria-label={`Go to question ${index + 1}`}
          />
        )
      })}
    </div>
  )
}

/* ================= MAIN PAGE ================= */

export default function QuizPage() {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showIncorrectFeedback, setShowIncorrectFeedback] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set())
  // Track mistakes from the VERY FIRST submission attempt
  const [firstAttemptMistakes, setFirstAttemptMistakes] = useState<any[] | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedQuiz = localStorage.getItem("currentQuiz")
    if (!storedQuiz) {
      router.push("/home")
      return
    }
    const parsedQuiz = JSON.parse(storedQuiz)
    setQuiz(parsedQuiz)
    setUserAnswers(
      parsedQuiz.questions.map((q: Question) => ({
        questionId: q.id,
        selectedOption: null,
        attempts: 0,
        timeSpent: 0,
      }))
    )
  }, [router])

  useEffect(() => {
    const timer = setInterval(() => setTimeElapsed((t) => t + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleAnswerChange = (value: string) => {
    const index = quiz?.questions[currentQuestionIndex].options.indexOf(value) ?? -1
    setUserAnswers((prev) =>
      prev.map((a, i) => i === currentQuestionIndex ? { ...a, selectedOption: index } : a)
    )
  }

  const handleFlagQuestion = async () => {
    if (!quiz) return
    const currentQ = quiz.questions[currentQuestionIndex]
    if (flaggedQuestions.has(currentQ.id)) return

    try {
      const token = localStorage.getItem("token")
      if (token) {
        await apiFetch("/api/report-error", {
          method: "POST",
          body: JSON.stringify({ questionId: String(currentQ.id), subject: currentQ.subject || "Unknown", quizId: quiz.id })
        })
        setFlaggedQuestions(prev => new Set([...prev, currentQ.id]))
      }
    } catch (error) { console.error("Failed to report error", error) }
  }

  const handleSubmitQuiz = async () => {
    if (!quiz) return
    setIsSubmitting(true)

    const results = userAnswers.map((answer, index) => {
      const q = quiz.questions[index]
      const selectedIndex = answer.selectedOption
      const correctIndex = q.correct
      return {
        ...answer,
        isCorrect: selectedIndex === correctIndex,
        attempts: answer.attempts + 1,
      }
    })

    // Capture mistakes on the FIRST attempt only
    if (firstAttemptMistakes === null) {
      const initialMistakes = results
        .filter(r => !r.isCorrect)
        .map((r) => {
          // Find original question because filter/map index might mismatch if not careful, 
          // but here we map from 'results' which is full length.
          // However, relying on quiz.questions.find is safer.
          const originalQ = quiz.questions.find(q => q.id === r.questionId);
          return {
            questionId: String(r.questionId),
            subject: originalQ?.subject || "Unknown",
            isCorrect: false
          }
        });
      setFirstAttemptMistakes(initialMistakes);
    }

    if (results.some((a) => !a.isCorrect)) {
      setUserAnswers(results)
      setShowIncorrectFeedback(true)
      setIsSubmitting(false)
      return
    }

    localStorage.setItem("currentQuizAnswers", JSON.stringify(results))

    const currentStats: QuizStats = {
      quizId: quiz.id,
      quizTitle: quiz.title,
      totalTime: timeElapsed,
      totalAttempts: results.reduce((acc, curr) => acc + curr.attempts, 0),
      questionsCount: quiz.questions.length,
      completedAt: new Date().toISOString(),
      difficulty: quiz.difficulty,
    }

    const existingStats = JSON.parse(localStorage.getItem("quizStats") || "[]")
    localStorage.setItem("quizStats", JSON.stringify([...existingStats, currentStats]))

    const token = localStorage.getItem("token")
    if (token) {
      try {
        const correctCount = results.filter(a => a.isCorrect).length
        const submissionResults = results.map((r, i) => ({
          questionId: String(quiz.questions[i].id),
          subject: quiz.questions[i].subject || "Unknown",
          isCorrect: r.isCorrect || false
        }))

        // Use the captured first-attempt mistakes. 
        // If they got everything right on first try, this will be empty (from the logic above).
        // If captured is null (shouldn't happen due to logic above), fallback to empty.
        const mistakesToSend = firstAttemptMistakes || [];
        // Edge case: If they got 100% on first try, firstAttemptMistakes is set to [] above.
        // If they failed first try, firstAttemptMistakes has items.
        // On subsequent retries, firstAttemptMistakes is NOT updated (kept as is).

        // Wait! logical race: setFirstAttemptMistakes is async. 
        // But we calculated 'initialMistakes' locally in this closure. use that if first time.

        let finalMistakes = firstAttemptMistakes;
        if (finalMistakes === null) {
          // This means this is the very first attempt AND it was perfect (since we passed the filtering check)
          // Or we just calculated it. Let's recalculate locally to be safe or use the variable.
          finalMistakes = results
            .filter(r => !r.isCorrect)
            .map(r => {
              const originalQ = quiz.questions.find(q => q.id === Number(r.questionId));
              return {
                questionId: String(r.questionId),
                subject: originalQ?.subject || "Unknown",
                isCorrect: false
              }
            });
        }

        await apiFetch("/api/quiz/submit", {
          method: "POST",
          body: JSON.stringify({
            quizId: quiz.id,
            difficulty: quiz.difficulty,
            questionsCount: quiz.questions.length,
            correctCount: correctCount,
            timeSpent: timeElapsed,
            results: submissionResults,
            mistakes: finalMistakes
          })
        })
      } catch (e) { console.error("Failed to submit quiz stats", e) }
    }
    router.push("/result")
  }

  if (!quiz) return null

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const selectedIndex = userAnswers[currentQuestionIndex]?.selectedOption
  const currentAnswer = selectedIndex !== null && selectedIndex !== undefined
    ? quiz.questions[currentQuestionIndex].options[selectedIndex]
    : ""
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-100 flex flex-col">
      {/* Quiz Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 h-16">
        <div className="max-w-5xl mx-auto px-4 h-full flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push("/home")} className="text-gray-500 hover:text-black">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit
          </Button>

          <div className="flex-1 max-w-md mx-4 hidden sm:block">
            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-sm font-medium">
            <Timer className="w-4 h-4" />
            {formatTime(timeElapsed)}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-32 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={quiz.questions.length}
          selectedAnswer={currentAnswer}
          onAnswerChange={handleAnswerChange}
          onFlag={handleFlagQuestion}
          showIncorrect={showIncorrectFeedback}
          isFlagged={flaggedQuestions.has(currentQuestion.id)}
        />
      </main>

      {/* Footer Controls */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="lg"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((i) => i - 1)}
              className="w-32 rounded-full border-gray-200"
            >
              Previous
            </Button>

            <div className="hidden sm:block">
              <QuestionIndicators
                totalQuestions={quiz.questions.length}
                currentQuestionIndex={currentQuestionIndex}
                userAnswers={userAnswers}
                showIncorrectFeedback={showIncorrectFeedback}
                quiz={quiz}
                onQuestionClick={setCurrentQuestionIndex}
              />
            </div>

            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button
                size="lg"
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="w-32 rounded-full bg-black text-white hover:bg-gray-900"
              >
                Submit
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => setCurrentQuestionIndex((i) => i + 1)}
                className="w-32 rounded-full bg-black text-white hover:bg-gray-900"
              >
                Next
              </Button>
            )}
          </div>

          {/* Mobile Indicators */}
          <div className="sm:hidden w-full flex justify-center pb-2">
            <QuestionIndicators
              totalQuestions={quiz.questions.length}
              currentQuestionIndex={currentQuestionIndex}
              userAnswers={userAnswers}
              showIncorrectFeedback={showIncorrectFeedback}
              quiz={quiz}
              onQuestionClick={setCurrentQuestionIndex}
            />
          </div>
        </div>
      </footer>
    </div>
  )
}
