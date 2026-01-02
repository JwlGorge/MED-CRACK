"use client"

import { AuthGuard } from "../../components/ui/auth-guard"
import Button from "../../components/ui/button"
import Card from "../../components/ui/card"
import { CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { useRouter } from "next/navigation"

function DashboardContent() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/auth")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={handleLogout} variant="ghost">
            Logout
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome!</CardTitle>
            <CardDescription>You have successfully authenticated with FastAPI</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              This is a protected page that requires authentication. Your FastAPI backend is handling the authentication
              flow.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}
