import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ActiveExchangeCard } from "@/features/exchange-request/components/ActiveExchangeCard"
import { useActiveExchangeCount } from "@/features/exchange-request/hooks/useExchangeRequests"
import { useAuthStore } from "@/stores/authStore"

export default function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const { data: activeCount = 0, isLoading: activeCountLoading } =
    useActiveExchangeCount()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {user?.first_name}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here&apos;s your learning activity
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ActiveExchangeCard count={activeCount} loading={activeCountLoading} />
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">
              No upcoming sessions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">
              No unread messages
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
