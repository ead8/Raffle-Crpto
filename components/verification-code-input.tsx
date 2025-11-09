"use client"

import { useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from "react"
import { Input } from "@/components/ui/input"

interface VerificationCodeInputProps {
  length?: number
  onComplete: (code: string) => void
  value: string
  onChange: (value: string) => void
}

export function VerificationCodeInput({ length = 6, onComplete, value, onChange }: VerificationCodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    // Check if code is complete
    if (value.length === length) {
      onComplete(value)
    }
  }, [value, length, onComplete])

  const handleChange = (index: number, digit: string) => {
    // Only allow digits
    if (digit && !/^\d$/.test(digit)) return

    const newValue = value.split("")
    newValue[index] = digit
    const newCode = newValue.join("")

    onChange(newCode)

    // Move to next input if digit was entered
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault()
      const newValue = value.split("")

      if (newValue[index]) {
        // Clear current input
        newValue[index] = ""
        onChange(newValue.join(""))
      } else if (index > 0) {
        // Move to previous input and clear it
        newValue[index - 1] = ""
        onChange(newValue.join(""))
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    // Only accept digits
    const digits = pastedData.replace(/\D/g, "").slice(0, length)

    if (digits) {
      onChange(digits)
      // Focus the last filled input or the next empty one
      const nextIndex = Math.min(digits.length, length - 1)
      inputRefs.current[nextIndex]?.focus()
    }
  }

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-2xl font-bold bg-secondary/50 border-primary/20 focus:border-primary"
        />
      ))}
    </div>
  )
}
