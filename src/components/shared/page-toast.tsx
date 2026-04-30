"use client"

import { useEffect } from "react"
import { toast } from "sonner"

interface PageToastProps {
  message: string
  type?: "success" | "info" | "error"
}

export function PageToast({ message, type = "success" }: PageToastProps) {
  useEffect(() => {
    toast[type](message)
  }, [message, type])

  return null
}
