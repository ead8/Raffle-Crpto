export interface Task {
  id: string
  title: string
  description: string
  type: "registration" | "deposit_volume" | "lottery_volume" | "referral" | "custom"
  bonusAmount: number
  requirement: {
    type: "deposit" | "lottery_spending" | "referrals" | "custom"
    amount?: number // For deposit/lottery spending requirements
    count?: number // For referral requirements
  }
  userTargeting: {
    type: "all" | "new_users" | "registered_after" | "specific_users"
    registeredAfter?: Date // For registered_after type
    userIds?: string[] // For specific_users type
  }
  conditions: string[]
  isActive: boolean
  validFrom?: Date
  validUntil?: Date
  durationDays?: number // Number of days the task is valid after user becomes eligible
  maxCompletions?: number // Maximum number of users who can complete this task
  currentCompletions: number
  createdAt: Date
  updatedAt: Date
}

// Initialize with default registration bonus task
function initializeDefaultTask(): void {
  const data = localStorage.getItem(TASKS_KEY)
  if (!data || JSON.parse(data).length === 0) {
    const defaultTask: Task = {
      id: "task-registration-bonus",
      title: "Bono de Registro",
      description: "Desbloquea tu bono de registro de 5 USDT",
      type: "registration",
      bonusAmount: 5,
      requirement: {
        type: "deposit",
        amount: 100, // Changed from 50 to 100 USDT
      },
      userTargeting: {
        type: "new_users",
      },
      conditions: [
        "El primer depósito debe ser de 100 USDT o más", // Updated condition
        "Si el primer depósito es menor a 100 USDT, no recibirás el bono",
        "Depósitos posteriores no califican para el bono",
        "El bono se acreditará automáticamente después del primer depósito válido",
        "El bono puede ser usado para comprar tickets de sorteos",
        "Esta oferta es válida solo para nuevos usuarios",
      ],
      isActive: true,
      currentCompletions: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    localStorage.setItem(TASKS_KEY, JSON.stringify([defaultTask]))
  }
}

const TASKS_KEY = "lottery_tasks"

export function getTasks(): Task[] {
  if (typeof window === "undefined") return []
  initializeDefaultTask()
  const data = localStorage.getItem(TASKS_KEY)
  if (!data) return []
  return JSON.parse(data).map((task: any) => ({
    ...task,
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
    validFrom: task.validFrom ? new Date(task.validFrom) : undefined,
    validUntil: task.validUntil ? new Date(task.validUntil) : undefined,
    userTargeting: task.userTargeting
      ? {
          type: task.userTargeting.type || "all",
          registeredAfter: task.userTargeting.registeredAfter
            ? new Date(task.userTargeting.registeredAfter)
            : undefined,
          userIds: task.userTargeting.userIds || undefined,
        }
      : {
          type: "all" as const,
        },
    type: task.type || "registration",
    requirement: task.requirement || {
      type: "deposit" as const,
      amount: task.requiredDeposit || 50,
    },
    currentCompletions: task.currentCompletions || 0,
  }))
}

export function getTask(id: string): Task | null {
  const tasks = getTasks()
  return tasks.find((task) => task.id === id) || null
}

export function createTask(taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "currentCompletions">): Task {
  const tasks = getTasks()
  const newTask: Task = {
    ...taskData,
    id: `task-${Date.now()}`,
    currentCompletions: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  tasks.push(newTask)
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))

  if (typeof window !== "undefined") {
    const event = new CustomEvent("storage-sync", {
      detail: { key: TASKS_KEY, value: tasks },
    })
    window.dispatchEvent(event)
  }

  return newTask
}

export function updateTask(
  id: string,
  updates: Partial<Omit<Task, "id" | "createdAt" | "currentCompletions">>,
): Task | null {
  const tasks = getTasks()
  const index = tasks.findIndex((task) => task.id === id)
  if (index === -1) return null

  tasks[index] = {
    ...tasks[index],
    ...updates,
    updatedAt: new Date(),
  }
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))

  if (typeof window !== "undefined") {
    const event = new CustomEvent("storage-sync", {
      detail: { key: TASKS_KEY, value: tasks },
    })
    window.dispatchEvent(event)
  }

  return tasks[index]
}

export function deleteTask(id: string): boolean {
  const tasks = getTasks()
  const filteredTasks = tasks.filter((task) => task.id !== id)
  if (filteredTasks.length === tasks.length) return false
  localStorage.setItem(TASKS_KEY, JSON.stringify(filteredTasks))

  if (typeof window !== "undefined") {
    const event = new CustomEvent("storage-sync", {
      detail: { key: TASKS_KEY, value: filteredTasks },
    })
    window.dispatchEvent(event)
  }

  return true
}

export function getActiveTask(): Task | null {
  const tasks = getTasks()
  return tasks.find((task) => task.isActive) || null
}

export function getTasksForUser(userId: string, userRegistrationDate: Date): Task[] {
  const tasks = getTasks()
  const now = new Date()

  return tasks.filter((task) => {
    // Check if task is active
    if (!task.isActive) return false

    // Check validity period
    if (task.validFrom && now < task.validFrom) return false
    if (task.validUntil && now > task.validUntil) return false

    // Check max completions
    if (task.maxCompletions && task.currentCompletions >= task.maxCompletions) return false

    // Check user targeting
    switch (task.userTargeting.type) {
      case "all":
        return true
      case "new_users":
        // Consider users registered in the last 30 days as new
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return userRegistrationDate >= thirtyDaysAgo
      case "registered_after":
        return task.userTargeting.registeredAfter && userRegistrationDate >= task.userTargeting.registeredAfter
      case "specific_users":
        return task.userTargeting.userIds?.includes(userId) || false
      default:
        return false
    }
  })
}

export interface TaskClaim {
  userId: string
  taskId: string
  completedAt: Date
  claimedAt?: Date
  expiresAt?: Date
}

export function isTaskExpired(task: Task, userEligibleDate: Date): boolean {
  const now = new Date()

  // Check global expiration
  if (task.validUntil && now > task.validUntil) return true

  // Check user-specific expiration based on duration
  if (task.durationDays) {
    const expirationDate = new Date(userEligibleDate)
    expirationDate.setDate(expirationDate.getDate() + task.durationDays)
    if (now > expirationDate) return true
  }

  return false
}

export function getTaskClaimStatus(userId: string, taskId: string): TaskClaim | null {
  const claimsKey = `task_claims_${userId}`
  const data = localStorage.getItem(claimsKey)
  if (!data) return null

  const claims: TaskClaim[] = JSON.parse(data).map((claim: any) => ({
    ...claim,
    completedAt: new Date(claim.completedAt),
    claimedAt: claim.claimedAt ? new Date(claim.claimedAt) : undefined,
    expiresAt: claim.expiresAt ? new Date(claim.expiresAt) : undefined,
  }))

  return claims.find((claim) => claim.taskId === taskId) || null
}

export function claimTaskReward(userId: string, taskId: string): boolean {
  const claimsKey = `task_claims_${userId}`
  const data = localStorage.getItem(claimsKey)
  const claims: TaskClaim[] = data ? JSON.parse(data) : []

  const claimIndex = claims.findIndex((claim) => claim.taskId === taskId)
  if (claimIndex === -1) return false

  const claim = claims[claimIndex]
  if (claim.claimedAt) return false // Already claimed
  if (claim.expiresAt && new Date() > new Date(claim.expiresAt)) return false // Expired

  // Mark as claimed
  claims[claimIndex] = {
    ...claim,
    claimedAt: new Date(),
  }

  localStorage.setItem(claimsKey, JSON.stringify(claims))

  // Add bonus to user wallet
  const { addTransaction } = require("./wallet")
  const task = getTask(taskId)
  if (task) {
    addTransaction(userId, {
      type: "prize_won",
      amount: task.bonusAmount,
      description: `Recompensa de tarea: ${task.title}`,
      status: "completed",
    })
  }

  if (typeof window !== "undefined") {
    const event = new CustomEvent("storage-sync", {
      detail: { key: claimsKey, value: claims },
    })
    window.dispatchEvent(event)
  }

  return true
}

export function completeTaskForUser(userId: string, taskId: string, userEligibleDate: Date): void {
  const claimsKey = `task_claims_${userId}`
  const data = localStorage.getItem(claimsKey)
  const claims: TaskClaim[] = data ? JSON.parse(data) : []

  // Check if already has a claim for this task
  if (claims.find((claim) => claim.taskId === taskId)) return

  const task = getTask(taskId)
  if (!task) return

  // Calculate expiration date if task has duration
  let expiresAt: Date | undefined
  if (task.durationDays) {
    expiresAt = new Date(userEligibleDate)
    expiresAt.setDate(expiresAt.getDate() + task.durationDays)
  } else if (task.validUntil) {
    expiresAt = task.validUntil
  }

  const newClaim: TaskClaim = {
    userId,
    taskId,
    completedAt: new Date(),
    expiresAt,
  }

  claims.push(newClaim)
  localStorage.setItem(claimsKey, JSON.stringify(claims))

  // Increment task completion count
  updateTask(taskId, { currentCompletions: task.currentCompletions + 1 })

  if (typeof window !== "undefined") {
    const event = new CustomEvent("storage-sync", {
      detail: { key: claimsKey, value: claims },
    })
    window.dispatchEvent(event)
  }
}

export function hasUserCompletedTask(userId: string, taskId: string): boolean {
  const claim = getTaskClaimStatus(userId, taskId)
  return claim !== null
}

export function getUserTaskClaims(userId: string): TaskClaim[] {
  const claimsKey = `task_claims_${userId}`
  const data = localStorage.getItem(claimsKey)
  if (!data) return []

  return JSON.parse(data).map((claim: any) => ({
    ...claim,
    completedAt: new Date(claim.completedAt),
    claimedAt: claim.claimedAt ? new Date(claim.claimedAt) : undefined,
    expiresAt: claim.expiresAt ? new Date(claim.expiresAt) : undefined,
  }))
}

export interface TaskEnrollment {
  userId: string
  taskId: string
  enrolledAt: Date
  eligibilityChecked: boolean
}

export function enrollUserInTask(
  userId: string,
  taskId: string,
  userRegistrationDate: Date,
): {
  success: boolean
  message?: string
} {
  const task = getTask(taskId)
  if (!task) return { success: false, message: "Tarea no encontrada" }

  // Check eligibility
  const isEligible = checkTaskEligibility(userId, task, userRegistrationDate)
  if (!isEligible.eligible) {
    return { success: false, message: isEligible.reason }
  }

  // Save enrollment
  const enrollmentsKey = `task_enrollments_${userId}`
  const data = localStorage.getItem(enrollmentsKey)
  const enrollments: TaskEnrollment[] = data ? JSON.parse(data) : []

  // Check if already enrolled
  if (enrollments.find((e) => e.taskId === taskId)) {
    return { success: true }
  }

  enrollments.push({
    userId,
    taskId,
    enrolledAt: new Date(),
    eligibilityChecked: true,
  })

  localStorage.setItem(enrollmentsKey, JSON.stringify(enrollments))

  if (typeof window !== "undefined") {
    const event = new CustomEvent("storage-sync", {
      detail: { key: enrollmentsKey, value: enrollments },
    })
    window.dispatchEvent(event)
  }

  return { success: true }
}

export function isUserEnrolledInTask(userId: string, taskId: string): boolean {
  const enrollmentsKey = `task_enrollments_${userId}`
  const data = localStorage.getItem(enrollmentsKey)
  if (!data) return false

  const enrollments: TaskEnrollment[] = JSON.parse(data)
  return enrollments.some((e) => e.taskId === taskId)
}

export function checkTaskEligibility(
  userId: string,
  task: Task,
  userRegistrationDate: Date,
): { eligible: boolean; reason?: string } {
  const now = new Date()

  // Check if task is active
  if (!task.isActive) {
    return { eligible: false, reason: "Esta tarea no está activa actualmente" }
  }

  // Check validity period
  if (task.validFrom && now < task.validFrom) {
    return { eligible: false, reason: "Esta tarea aún no ha comenzado" }
  }
  if (task.validUntil && now > task.validUntil) {
    return { eligible: false, reason: "Esta tarea ha expirado" }
  }

  // Check max completions
  if (task.maxCompletions && task.currentCompletions >= task.maxCompletions) {
    return { eligible: false, reason: "Esta tarea ha alcanzado el máximo de completaciones" }
  }

  // Check user targeting
  switch (task.userTargeting.type) {
    case "all":
      return { eligible: true }

    case "new_users": {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      if (userRegistrationDate < thirtyDaysAgo) {
        return {
          eligible: false,
          reason: "Esta tarea es solo para usuarios nuevos (registrados en los últimos 30 días)",
        }
      }
      return { eligible: true }
    }

    case "registered_after": {
      if (!task.userTargeting.registeredAfter || userRegistrationDate < task.userTargeting.registeredAfter) {
        const dateStr = task.userTargeting.registeredAfter?.toLocaleDateString() || ""
        return {
          eligible: false,
          reason: `Esta tarea es solo para usuarios registrados después del ${dateStr}`,
        }
      }
      return { eligible: true }
    }

    case "specific_users": {
      if (!task.userTargeting.userIds?.includes(userId)) {
        return { eligible: false, reason: "Esta tarea no está disponible para tu cuenta" }
      }
      return { eligible: true }
    }

    default:
      return { eligible: false, reason: "Configuración de tarea inválida" }
  }
}
