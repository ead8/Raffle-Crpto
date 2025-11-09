"use client"

import { useAuth } from "@/components/auth-provider"
import { useI18n } from "@/lib/i18n"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Gift, CheckCircle2, ArrowRight, TrendingUp, Users, Ticket, Clock, XCircle, Wallet } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import {
  getTasksForUser,
  getTaskClaimStatus,
  claimTaskReward,
  getUserTaskClaims,
  enrollUserInTask,
  isUserEnrolledInTask,
  type Task,
  type TaskClaim,
} from "@/lib/tasks"
import { getTransactions } from "@/lib/wallet"
import { useSync } from "@/hooks/use-sync"
import { useToast } from "@/hooks/use-toast"

export default function TasksPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskProgress, setTaskProgress] = useState<Record<string, number>>({})
  const [taskClaims, setTaskClaims] = useState<TaskClaim[]>([])
  const [enrolledTasks, setEnrolledTasks] = useState<Set<string>>(new Set())
  const [historyFilter, setHistoryFilter] = useState<"claimed" | "expired">("claimed")
  const [, setCountdownTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownTick((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const calculateTaskProgress = useCallback(
    (task: Task): number => {
      if (!user) return 0

      const claim = getTaskClaimStatus(user.id, task.id)
      if (claim) return 100

      const transactions = getTransactions(user.id)

      switch (task.requirement.type) {
        case "deposit": {
          const totalDeposits = transactions
            .filter((tx) => tx.type === "deposit" && tx.status === "completed")
            .reduce((sum, tx) => sum + tx.amount, 0)
          const required = task.requirement.amount || 0
          return Math.min((totalDeposits / required) * 100, 100)
        }

        case "lottery_spending": {
          const totalSpending = transactions
            .filter((tx) => tx.type === "ticket_purchase" && tx.status === "completed")
            .reduce((sum, tx) => sum + tx.amount, 0)
          const required = task.requirement.amount || 0
          return Math.min((totalSpending / required) * 100, 100)
        }

        case "referrals": {
          return 0
        }

        default:
          return 0
      }
    },
    [user],
  )

  const loadTasks = useCallback(() => {
    if (!user) return

    const eligibleTasks = getTasksForUser(user.id, new Date(user.createdAt))
    setTasks(eligibleTasks)

    const progress: Record<string, number> = {}
    eligibleTasks.forEach((task) => {
      progress[task.id] = calculateTaskProgress(task)
    })
    setTaskProgress(progress)

    const claims = getUserTaskClaims(user.id)
    setTaskClaims(claims)

    const enrolled = new Set<string>()
    eligibleTasks.forEach((task) => {
      if (isUserEnrolledInTask(user.id, task.id)) {
        enrolled.add(task.id)
      }
    })
    setEnrolledTasks(enrolled)
  }, [user, calculateTaskProgress])

  useSync("lottery_tasks", loadTasks)

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const handleEnrollTask = async (taskId: string) => {
    if (!user) return

    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const result = enrollUserInTask(user.id, taskId, new Date(user.createdAt))

    if (result.success) {
      toast({
        title: t("tasks.enrollSuccess"),
        description: t("tasks.enrollSuccess.desc"),
      })
      loadTasks()
    } else {
      toast({
        title: t("tasks.enrollError"),
        description: result.message || t("tasks.enrollError"),
        variant: "destructive",
      })
    }
  }

  const handleClaimReward = async (taskId: string) => {
    if (!user) return

    const success = claimTaskReward(user.id, taskId)
    if (success) {
      const task = tasks.find((t) => t.id === taskId)
      toast({
        title: t("tasks.claimSuccess"),
        description: t("tasks.claimSuccess.desc", { amount: task?.bonusAmount || 0 }),
      })
      loadTasks()
    } else {
      toast({
        title: t("tasks.claimError"),
        description: t("tasks.claimError.desc"),
        variant: "destructive",
      })
    }
  }

  const getTaskIcon = (type: Task["type"]) => {
    switch (type) {
      case "registration":
        return Gift
      case "deposit_volume":
        return TrendingUp
      case "lottery_volume":
        return Ticket
      case "referral":
        return Users
      default:
        return Gift
    }
  }

  const getRequirementText = (task: Task): string => {
    switch (task.requirement.type) {
      case "deposit":
        return `Deposita ${task.requirement.amount} USDT`
      case "lottery_spending":
        return `Gasta ${task.requirement.amount} USDT en sorteos`
      case "referrals":
        return `Refiere ${task.requirement.count} usuarios`
      default:
        return task.description
    }
  }

  const getCurrentAmount = (task: Task): string => {
    if (!user) return "0"

    const transactions = getTransactions(user.id)

    switch (task.requirement.type) {
      case "deposit": {
        const total = transactions
          .filter((tx) => tx.type === "deposit" && tx.status === "completed")
          .reduce((sum, tx) => sum + tx.amount, 0)
        return `${total} / ${task.requirement.amount} USDT`
      }

      case "lottery_spending": {
        const total = transactions
          .filter((tx) => tx.type === "ticket_purchase" && tx.status === "completed")
          .reduce((sum, tx) => sum + tx.amount, 0)
        return `${total} / ${task.requirement.amount} USDT`
      }

      case "referrals": {
        return `0 / ${task.requirement.count} usuarios`
      }

      default:
        return "0"
    }
  }

  const getTimeRemaining = (expiresAt: Date): string => {
    const now = new Date()
    const diff = expiresAt.getTime() - now.getTime()

    if (diff <= 0) return "Expirado"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const getActionButton = (task: Task) => {
    switch (task.requirement.type) {
      case "deposit":
        return (
          <Link href="/dashboard/wallet">
            <Button size="lg" className="w-full md:w-auto">
              <Wallet className="w-5 h-5 mr-2" />
              {t("tasks.goToDeposit")}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        )
      case "lottery_spending":
        return (
          <Link href="/dashboard/lottery">
            <Button size="lg" className="w-full md:w-auto">
              <Ticket className="w-5 h-5 mr-2" />
              {t("tasks.goToLottery")}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        )
      default:
        return null
    }
  }

  if (!user) return null

  const activeTasks = tasks.filter((task) => {
    const claim = getTaskClaimStatus(user.id, task.id)
    if (claim?.claimedAt) return false
    if (task.validUntil && new Date() > task.validUntil) return false
    return true
  })

  const claimedTasks = taskClaims.filter((claim) => claim.claimedAt)
  const expiredTasks = taskClaims.filter((claim) => !claim.claimedAt && claim.expiresAt && new Date() > claim.expiresAt)

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t("tasks.title")}</h1>
        <p className="text-muted-foreground">{t("tasks.subtitle")}</p>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">{t("tasks.filter.active")}</TabsTrigger>
          <TabsTrigger value="history">{t("tasks.history")}</TabsTrigger>
        </TabsList>

        {/* Active Tasks */}
        <TabsContent value="active" className="space-y-6">
          {activeTasks.length === 0 ? (
            <Card className="glass-card border-primary/20 p-8 text-center">
              <Gift className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">{t("tasks.noTasks")}</h3>
              <p className="text-muted-foreground">
                No tienes tareas disponibles en este momento. Vuelve más tarde para ver nuevas oportunidades.
              </p>
            </Card>
          ) : (
            activeTasks.map((task) => {
              const Icon = getTaskIcon(task.type)
              const progress = taskProgress[task.id] || 0
              const claim = getTaskClaimStatus(user.id, task.id)
              const isEnrolled = enrolledTasks.has(task.id)
              const isCompleted = progress >= 100
              const canClaim = isCompleted && !claim?.claimedAt && isEnrolled

              return (
                <Card key={task.id} className="glass-card border-primary/20 p-6 md:p-8">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center ${
                            canClaim ? "bg-green-500/20" : "bg-primary/20"
                          }`}
                        >
                          {canClaim ? (
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                          ) : (
                            <Icon className="w-8 h-8 text-primary" />
                          )}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold">{task.title}</h2>
                          <p className="text-3xl font-bold text-primary mt-1">{task.bonusAmount} USDT</p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {canClaim ? (
                          <Badge variant="default" className="text-sm bg-green-500">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Lista para reclamar
                          </Badge>
                        ) : isEnrolled ? (
                          isCompleted ? (
                            <Badge variant="secondary" className="text-sm">
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              {t("tasks.completed")}
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="text-sm bg-blue-500/20 text-blue-500 border-blue-500/30"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              {t("tasks.enrolled")}
                            </Badge>
                          )
                        ) : null}
                        {task.validUntil && !claim?.claimedAt && (
                          <Badge variant="outline" className="text-sm">
                            <Clock className="w-4 h-4 mr-2" />
                            {t("tasks.timeRemaining")}: {getTimeRemaining(task.validUntil)}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground">{task.description}</p>

                    {/* Progress - only show if enrolled */}
                    {isEnrolled && !isCompleted && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{t("tasks.progress")}</span>
                          <span className="font-semibold">{getCurrentAmount(task)}</span>
                        </div>
                        <Progress value={progress} className="h-3" />
                      </div>
                    )}

                    {/* Requirement */}
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-base leading-relaxed font-semibold">{getRequirementText(task)}</p>
                    </div>

                    {/* Conditions */}
                    {task.conditions.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold">Condiciones</h3>
                        <ul className="space-y-2">
                          {task.conditions.map((condition, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{condition}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 flex-wrap">
                      {!isEnrolled ? (
                        <Button size="lg" className="w-full md:w-auto" onClick={() => handleEnrollTask(task.id)}>
                          <Gift className="w-5 h-5 mr-2" />
                          {t("tasks.register")}
                        </Button>
                      ) : canClaim ? (
                        <Button size="lg" className="w-full md:w-auto" onClick={() => handleClaimReward(task.id)}>
                          <Gift className="w-5 h-5 mr-2" />
                          {t("tasks.claim")}
                        </Button>
                      ) : !isCompleted ? (
                        getActionButton(task)
                      ) : null}
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </TabsContent>

        {/* Task History */}
        <TabsContent value="history" className="space-y-6">
          <Tabs value={historyFilter} onValueChange={(v) => setHistoryFilter(v as "claimed" | "expired")}>
            <TabsList>
              <TabsTrigger value="claimed">
                {t("tasks.filter.claimed")} ({claimedTasks.length})
              </TabsTrigger>
              <TabsTrigger value="expired">
                {t("tasks.filter.expired")} ({expiredTasks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="claimed" className="space-y-4 mt-6">
              {claimedTasks.length === 0 ? (
                <Card className="glass-card border-primary/20 p-8 text-center">
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">{t("tasks.noHistory")}</h3>
                  <p className="text-muted-foreground">No has reclamado ninguna tarea todavía</p>
                </Card>
              ) : (
                claimedTasks.map((claim) => {
                  const task = tasks.find((t) => t.id === claim.taskId)
                  if (!task) return null

                  return (
                    <Card key={claim.taskId} className="glass-card border-primary/20 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold">{task.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Reclamada el {claim.claimedAt?.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-500">+{task.bonusAmount} USDT</p>
                          <Badge variant="default" className="mt-2 bg-green-500">
                            {t("tasks.claimed")}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  )
                })
              )}
            </TabsContent>

            <TabsContent value="expired" className="space-y-4 mt-6">
              {expiredTasks.length === 0 ? (
                <Card className="glass-card border-primary/20 p-8 text-center">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No hay tareas caducadas</h3>
                  <p className="text-muted-foreground">Las tareas que no reclames a tiempo aparecerán aquí</p>
                </Card>
              ) : (
                expiredTasks.map((claim) => {
                  const task = tasks.find((t) => t.id === claim.taskId)
                  if (!task) return null

                  return (
                    <Card key={claim.taskId} className="glass-card border-red-500/20 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                            <XCircle className="w-6 h-6 text-red-500" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold">{task.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Expiró el {claim.expiresAt?.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-red-500">{task.bonusAmount} USDT</p>
                          <Badge variant="destructive" className="mt-2">
                            {t("tasks.expired")}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  )
                })
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  )
}
