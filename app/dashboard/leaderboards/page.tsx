"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getTopWinners,
  getTopSpenders,
  getTopReferrers,
  getTopActiveUsers,
  getUserRank,
  type TopWinner,
  type TopSpender,
  type TopReferrer,
  type TopActiveUser,
} from "@/lib/leaderboards"
import { useAuth } from "@/components/auth-provider"
import { Trophy, DollarSign, Users, Activity, Medal, Award, TrendingUp } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function LeaderboardsPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const [topWinners, setTopWinners] = useState<TopWinner[]>([])
  const [topSpenders, setTopSpenders] = useState<TopSpender[]>([])
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([])
  const [topActiveUsers, setTopActiveUsers] = useState<TopActiveUser[]>([])
  const [userWinnerRank, setUserWinnerRank] = useState(0)
  const [userSpenderRank, setUserSpenderRank] = useState(0)
  const [userReferrerRank, setUserReferrerRank] = useState(0)
  const [userActiveRank, setUserActiveRank] = useState(0)

  useEffect(() => {
    loadLeaderboards()
  }, [])

  const loadLeaderboards = () => {
    const winners = getTopWinners(20)
    const spenders = getTopSpenders(20)
    const referrers = getTopReferrers(20)
    const activeUsers = getTopActiveUsers(20)

    setTopWinners(winners)
    setTopSpenders(spenders)
    setTopReferrers(referrers)
    setTopActiveUsers(activeUsers)

    if (user) {
      setUserWinnerRank(getUserRank(user.id, winners))
      setUserSpenderRank(getUserRank(user.id, spenders))
      setUserReferrerRank(getUserRank(user.id, referrers))
      setUserActiveRank(getUserRank(user.id, activeUsers))
    }
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "🥇"
    if (rank === 2) return "🥈"
    if (rank === 3) return "🥉"
    return `#${rank}`
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500"
    if (rank === 2) return "text-gray-400"
    if (rank === 3) return "text-orange-600"
    return "text-muted-foreground"
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Leaderboards</h1>
        <p className="text-sm sm:text-base text-muted-foreground">See who's leading the platform</p>
      </div>

      <Tabs defaultValue="winners" className="space-y-6">
        <TabsList className="glass-card border-primary/20 w-full sm:w-auto">
          <TabsTrigger value="winners" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Top Winners
          </TabsTrigger>
          <TabsTrigger value="spenders" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Top Spenders
          </TabsTrigger>
          <TabsTrigger value="referrers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Top Referrers
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Most Active
          </TabsTrigger>
        </TabsList>

        <TabsContent value="winners" className="space-y-6">
          {userWinnerRank > 0 && userWinnerRank <= 20 && (
            <Card className="glass-card border-primary/30 p-4 bg-primary/5">
              <div className="flex items-center gap-3">
                <Medal className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Your Rank: #{userWinnerRank}</p>
                  <p className="text-xs text-muted-foreground">You're in the top winners!</p>
                </div>
              </div>
            </Card>
          )}

          <Card className="glass-card border-primary/20 p-4 sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold mb-2">Top Winners</h2>
              <p className="text-sm text-muted-foreground">Users with the highest total winnings</p>
            </div>

            {topWinners.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No winners yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topWinners.map((entry) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                      entry.userId === user?.id
                        ? "bg-primary/10 border-primary/30"
                        : "bg-secondary/30 border-primary/10 hover:border-primary/20"
                    }`}
                  >
                    <div className={`text-2xl font-bold ${getRankColor(entry.rank)}`}>
                      {getRankBadge(entry.rank)}
                    </div>
                    <Avatar className="h-10 w-10 border-2 border-primary/30">
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {entry.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{entry.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.winsCount} win{entry.winsCount !== 1 ? "s" : ""} • Avg: ${entry.averageWin.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-chart-2">${entry.totalWon.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Total Won</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="spenders" className="space-y-6">
          {userSpenderRank > 0 && userSpenderRank <= 20 && (
            <Card className="glass-card border-primary/30 p-4 bg-primary/5">
              <div className="flex items-center gap-3">
                <Medal className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Your Rank: #{userSpenderRank}</p>
                  <p className="text-xs text-muted-foreground">You're in the top spenders!</p>
                </div>
              </div>
            </Card>
          )}

          <Card className="glass-card border-primary/20 p-4 sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold mb-2">Top Spenders</h2>
              <p className="text-sm text-muted-foreground">Users who have spent the most on tickets</p>
            </div>

            {topSpenders.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No spending data yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topSpenders.map((entry) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                      entry.userId === user?.id
                        ? "bg-primary/10 border-primary/30"
                        : "bg-secondary/30 border-primary/10 hover:border-primary/20"
                    }`}
                  >
                    <div className={`text-2xl font-bold ${getRankColor(entry.rank)}`}>
                      {getRankBadge(entry.rank)}
                    </div>
                    <Avatar className="h-10 w-10 border-2 border-primary/30">
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {entry.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{entry.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.ticketsPurchased} tickets • {entry.lotteriesParticipated} lotteries
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">${entry.totalSpent.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Total Spent</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="referrers" className="space-y-6">
          {userReferrerRank > 0 && userReferrerRank <= 20 && (
            <Card className="glass-card border-primary/30 p-4 bg-primary/5">
              <div className="flex items-center gap-3">
                <Medal className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Your Rank: #{userReferrerRank}</p>
                  <p className="text-xs text-muted-foreground">You're in the top referrers!</p>
                </div>
              </div>
            </Card>
          )}

          <Card className="glass-card border-primary/20 p-4 sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold mb-2">Top Referrers</h2>
              <p className="text-sm text-muted-foreground">Users who have earned the most from referrals</p>
            </div>

            {topReferrers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No referral data yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topReferrers.map((entry) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                      entry.userId === user?.id
                        ? "bg-primary/10 border-primary/30"
                        : "bg-secondary/30 border-primary/10 hover:border-primary/20"
                    }`}
                  >
                    <div className={`text-2xl font-bold ${getRankColor(entry.rank)}`}>
                      {getRankBadge(entry.rank)}
                    </div>
                    <Avatar className="h-10 w-10 border-2 border-primary/30">
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {entry.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{entry.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.completedReferrals}/{entry.totalReferrals} completed •{" "}
                        {entry.conversionRate.toFixed(1)}% conversion
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-chart-4">${entry.totalEarned.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Total Earned</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          {userActiveRank > 0 && userActiveRank <= 20 && (
            <Card className="glass-card border-primary/30 p-4 bg-primary/5">
              <div className="flex items-center gap-3">
                <Medal className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Your Rank: #{userActiveRank}</p>
                  <p className="text-xs text-muted-foreground">You're one of the most active users!</p>
                </div>
              </div>
            </Card>
          )}

          <Card className="glass-card border-primary/20 p-4 sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold mb-2">Most Active Users</h2>
              <p className="text-sm text-muted-foreground">Users with the most platform activity</p>
            </div>

            {topActiveUsers.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No activity data yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topActiveUsers.map((entry) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                      entry.userId === user?.id
                        ? "bg-primary/10 border-primary/30"
                        : "bg-secondary/30 border-primary/10 hover:border-primary/20"
                    }`}
                  >
                    <div className={`text-2xl font-bold ${getRankColor(entry.rank)}`}>
                      {getRankBadge(entry.rank)}
                    </div>
                    <Avatar className="h-10 w-10 border-2 border-primary/30">
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {entry.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{entry.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        Last active: {new Date(entry.lastActivityDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-accent">{entry.totalTransactions}</p>
                      <p className="text-xs text-muted-foreground">Transactions</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

