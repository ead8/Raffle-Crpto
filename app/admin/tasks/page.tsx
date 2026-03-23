"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getTasks, createTask, updateTask, deleteTask, type Task } from "@/lib/tasks"
import { useI18n } from "@/lib/i18n"
import { Gift, Plus, Edit, Trash2, X, Calendar, Users, Target } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const TaskDialog = ({
  open,
  onOpenChange,
  title,
  formData,
  setFormData,
  onSave,
  t,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  formData: any
  setFormData: (data: any) => void
  onSave: () => void
  t: (key: string) => string
}) => {
  const addCondition = () => {
    setFormData({
      ...formData,
      conditions: [...formData.conditions, ""],
    })
  }

  const updateCondition = (index: number, value: string) => {
    const newConditions = [...formData.conditions]
    newConditions[index] = value
    setFormData({ ...formData, conditions: newConditions })
  }

  const removeCondition = (index: number) => {
    const newConditions = formData.conditions.filter((_: any, i: number) => i !== index)
    setFormData({ ...formData, conditions: newConditions })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{t("admin.tasks.subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información Básica</h3>

            <div className="space-y-2">
              <Label htmlFor="title">{t("admin.tasks.taskTitle")}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t("admin.tasks.taskTitle")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("admin.tasks.description")}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t("admin.tasks.description")}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taskType">{t("admin.tasks.taskType")}</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as Task["type"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="registration">{t("admin.tasks.type.registration")}</SelectItem>
                    <SelectItem value="deposit_volume">{t("admin.tasks.type.deposit_volume")}</SelectItem>
                    <SelectItem value="lottery_volume">{t("admin.tasks.type.lottery_volume")}</SelectItem>
                    <SelectItem value="referral">{t("admin.tasks.type.referral")}</SelectItem>
                    <SelectItem value="custom">{t("admin.tasks.type.custom")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bonusAmount">{t("admin.tasks.bonusAmount")}</Label>
                <Input
                  id="bonusAmount"
                  type="number"
                  value={formData.bonusAmount}
                  onChange={(e) => setFormData({ ...formData, bonusAmount: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5" />
              Requisitos
            </h3>

            <div className="space-y-2">
              <Label htmlFor="requirementType">{t("admin.tasks.requirementType")}</Label>
              <Select
                value={formData.requirement.type}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    requirement: { ...formData.requirement, type: value as Task["requirement"]["type"] },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">{t("admin.tasks.requirement.deposit")}</SelectItem>
                  <SelectItem value="lottery_spending">{t("admin.tasks.requirement.lottery_spending")}</SelectItem>
                  <SelectItem value="referrals">{t("admin.tasks.requirement.referrals")}</SelectItem>
                  <SelectItem value="custom">{t("admin.tasks.requirement.custom")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.requirement.type === "deposit" || formData.requirement.type === "lottery_spending") && (
              <div className="space-y-2">
                <Label htmlFor="requirementAmount">{t("admin.tasks.requirementAmount")}</Label>
                <Input
                  id="requirementAmount"
                  type="number"
                  value={formData.requirement.amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requirement: { ...formData.requirement, amount: Number(e.target.value) },
                    })
                  }
                  min="0"
                  step="0.01"
                />
              </div>
            )}

            {formData.requirement.type === "referrals" && (
              <div className="space-y-2">
                <Label htmlFor="requirementCount">{t("admin.tasks.requirementCount")}</Label>
                <Input
                  id="requirementCount"
                  type="number"
                  value={formData.requirement.count}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requirement: { ...formData.requirement, count: Number(e.target.value) },
                    })
                  }
                  min="1"
                />
              </div>
            )}
          </div>

          {/* User Targeting */}
          <div className="space-y-4 p-4 rounded-lg bg-accent/5 border border-accent/20">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Target users
            </h3>

            <div className="space-y-2">
              <Label htmlFor="userTargeting">{t("admin.tasks.userTargeting")}</Label>
              <Select
                value={formData.userTargeting.type}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    userTargeting: { ...formData.userTargeting, type: value as Task["userTargeting"]["type"] },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("admin.tasks.targeting.all")}</SelectItem>
                  <SelectItem value="new_users">{t("admin.tasks.targeting.new_users")}</SelectItem>
                  <SelectItem value="registered_after">{t("admin.tasks.targeting.registered_after")}</SelectItem>
                  <SelectItem value="specific_users">{t("admin.tasks.targeting.specific_users")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.userTargeting.type === "registered_after" && (
              <div className="space-y-2">
                <Label htmlFor="registeredAfter">{t("admin.tasks.registeredAfter")}</Label>
                <Input
                  id="registeredAfter"
                  type="date"
                  value={formData.userTargeting.registeredAfter}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      userTargeting: { ...formData.userTargeting, registeredAfter: e.target.value },
                    })
                  }
                />
              </div>
            )}
          </div>

          {/* Validity Period */}
          <div className="space-y-4 p-4 rounded-lg bg-muted/50 border border-muted">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Período de Validez
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">{t("admin.tasks.validFrom")}</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validUntil">{t("admin.tasks.validUntil")}</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationDays">{t("admin.tasks.durationDays")}</Label>
              <Input
                id="durationDays"
                type="number"
                value={formData.durationDays || ""}
                onChange={(e) =>
                  setFormData({ ...formData, durationDays: e.target.value ? Number(e.target.value) : undefined })
                }
                placeholder={t("admin.tasks.noDuration")}
                min="1"
              />
              <p className="text-sm text-muted-foreground">{t("admin.tasks.durationDays.desc")}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxCompletions">{t("admin.tasks.maxCompletions")}</Label>
              <Input
                id="maxCompletions"
                type="number"
                value={formData.maxCompletions || ""}
                onChange={(e) =>
                  setFormData({ ...formData, maxCompletions: e.target.value ? Number(e.target.value) : undefined })
                }
                placeholder={t("admin.tasks.unlimited")}
                min="1"
              />
            </div>
          </div>

          {/* Conditions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>{t("admin.tasks.conditions")}</Label>
              <Button type="button" variant="outline" size="sm" onClick={addCondition}>
                <Plus className="w-4 h-4 mr-2" />
                {t("admin.tasks.addCondition")}
              </Button>
            </div>
            <div className="space-y-2">
              {formData.conditions.map((condition: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={condition}
                    onChange={(e) => updateCondition(index, e.target.value)}
                    placeholder={`${t("admin.tasks.conditions")} ${index + 1}`}
                  />
                  {formData.conditions.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeCondition(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div>
              <Label htmlFor="isActive" className="text-base">
                {t("admin.tasks.isActive")}
              </Label>
              <p className="text-sm text-muted-foreground">{t("admin.settings.enabled")}</p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("admin.tasks.cancel")}
          </Button>
          <Button onClick={onSave}>{t("admin.tasks.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminTasksPage() {
  const { t } = useI18n()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "registration" as Task["type"],
    bonusAmount: 5,
    requirement: {
      type: "deposit" as Task["requirement"]["type"],
      amount: 50,
      count: 1,
    },
    userTargeting: {
      type: "new_users" as Task["userTargeting"]["type"],
      registeredAfter: "",
      userIds: [] as string[],
    },
    conditions: [""],
    isActive: true,
    validFrom: "",
    validUntil: "",
    durationDays: undefined as number | undefined,
    maxCompletions: undefined as number | undefined,
  })

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = () => {
    setTasks(getTasks())
  }

  const handleCreate = () => {
    setFormData({
      title: "",
      description: "",
      type: "registration",
      bonusAmount: 5,
      requirement: {
        type: "deposit",
        amount: 50,
        count: 1,
      },
      userTargeting: {
        type: "new_users",
        registeredAfter: "",
        userIds: [],
      },
      conditions: [""],
      isActive: true,
      validFrom: "",
      validUntil: "",
      durationDays: undefined,
      maxCompletions: undefined,
    })
    setIsCreateDialogOpen(true)
  }

  const handleEdit = (task: Task) => {
    setSelectedTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      type: task.type,
      bonusAmount: task.bonusAmount,
      requirement: {
        type: task.requirement.type,
        amount: task.requirement.amount || 0,
        count: task.requirement.count || 1,
      },
      userTargeting: {
        type: task.userTargeting.type,
        registeredAfter: task.userTargeting.registeredAfter
          ? task.userTargeting.registeredAfter.toISOString().split("T")[0]
          : "",
        userIds: task.userTargeting.userIds || [],
      },
      conditions: task.conditions,
      isActive: task.isActive,
      validFrom: task.validFrom ? task.validFrom.toISOString().split("T")[0] : "",
      validUntil: task.validUntil ? task.validUntil.toISOString().split("T")[0] : "",
      durationDays: task.durationDays,
      maxCompletions: task.maxCompletions,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (task: Task) => {
    setSelectedTask(task)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedTask) {
      deleteTask(selectedTask.id)
      loadTasks()
      setIsDeleteDialogOpen(false)
      toast({
        title: t("admin.tasks.deleted"),
        description: t("admin.tasks.deleted.desc"),
      })
    }
  }

  const handleSave = () => {
    const filteredConditions = formData.conditions.filter((c) => c.trim() !== "")

    const taskData = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      bonusAmount: formData.bonusAmount,
      requirement: {
        type: formData.requirement.type,
        amount:
          formData.requirement.type === "deposit" || formData.requirement.type === "lottery_spending"
            ? formData.requirement.amount
            : undefined,
        count: formData.requirement.type === "referrals" ? formData.requirement.count : undefined,
      },
      userTargeting: {
        type: formData.userTargeting.type,
        registeredAfter: formData.userTargeting.registeredAfter
          ? new Date(formData.userTargeting.registeredAfter)
          : undefined,
        userIds: formData.userTargeting.userIds,
      },
      conditions: filteredConditions,
      isActive: formData.isActive,
      validFrom: formData.validFrom ? new Date(formData.validFrom) : undefined,
      validUntil: formData.validUntil ? new Date(formData.validUntil) : undefined,
      durationDays: formData.durationDays,
      maxCompletions: formData.maxCompletions,
    }

    if (isEditDialogOpen && selectedTask) {
      updateTask(selectedTask.id, taskData)
    } else {
      createTask(taskData)
    }

    loadTasks()
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    toast({
      title: t("admin.tasks.success"),
      description: t("admin.tasks.success.desc"),
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t("admin.tasks.title")}</h1>
          <p className="text-muted-foreground">{t("admin.tasks.subtitle")}</p>
        </div>
        <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          {t("admin.tasks.createTask")}
        </Button>
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <Card className="glass-card border-primary/20 p-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <Gift className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">{t("admin.tasks.noTasks")}</h3>
              <p className="text-muted-foreground">{t("admin.tasks.noTasks.desc")}</p>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              {t("admin.tasks.createTask")}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {tasks.map((task) => (
            <Card key={task.id} className="glass-card border-primary/20 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Gift className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-bold">{task.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          task.isActive ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                        }`}
                      >
                        {task.isActive ? t("admin.settings.enabled") : t("admin.settings.disabled")}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">
                        {t(`admin.tasks.type.${task.type}`)}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{task.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{t("admin.tasks.bonusAmount")}:</span>
                        <span className="font-semibold text-primary">{task.bonusAmount} USDT</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{t("admin.tasks.userTargeting")}:</span>
                        <span className="font-semibold">{t(`admin.tasks.targeting.${task.userTargeting.type}`)}</span>
                      </div>
                      {task.maxCompletions && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{t("admin.tasks.currentCompletions")}:</span>
                          <span className="font-semibold">
                            {task.currentCompletions} / {task.maxCompletions}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">{t("admin.tasks.conditions")}:</p>
                      <ul className="space-y-1">
                        {task.conditions.map((condition, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{condition}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(task)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(task)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <TaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        title={t("admin.tasks.createTask")}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        t={t}
      />

      {/* Edit Dialog */}
      <TaskDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title={t("admin.tasks.editTask")}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        t={t}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.tasks.confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>{t("admin.tasks.confirmDelete.desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.tasks.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              {t("admin.tasks.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
