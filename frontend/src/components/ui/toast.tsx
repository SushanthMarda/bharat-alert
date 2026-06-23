"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle, Info, X, XCircle } from "lucide-react"

type ToastType = "success" | "error" | "info" | "warning"

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose?: () => void
  isVisible?: boolean
  className?: string
  positionClassName?: string
}

const toastIcons = {
  success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertCircle className="h-5 w-5 text-amber-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
}

const toastClasses = {
  success:
    "border-emerald-100 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950",
  error: "border-red-100 bg-red-50 dark:border-red-900 dark:bg-red-950",
  warning:
    "border-amber-100 bg-amber-50 dark:border-amber-900 dark:bg-amber-950",
  info: "border-blue-100 bg-blue-50 dark:border-blue-900 dark:bg-blue-950",
}

export function Toast({
  message,
  type = "info",
  duration = 3000,
  onClose,
  isVisible = true,
  className = "",
  positionClassName = "fixed top-4 right-4 z-50",
}: ToastProps) {
  const [visible, setVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(isVisible)

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true)
      const timer = setTimeout(() => {
        setVisible(true)
      }, 10)
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false)
        const closeTimer = setTimeout(() => {
          onClose?.()
        }, 300)
        return () => clearTimeout(closeTimer)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [visible, duration, onClose])

  if (!shouldRender) return null

  return (
    <div
      className={`${positionClassName} flex w-80 items-center gap-3 rounded-lg border p-4 shadow-lg ${
        toastClasses[type]
      } ${className} transition-all duration-300 ease-in-out ${
        visible
          ? "opacity-100 translate-x-0 scale-100"
          : "opacity-0 translate-x-12 scale-90"
      }`}
    >
      <div className="flex-shrink-0">{toastIcons[type]}</div>
      <p className="flex-1 text-sm">{message}</p>
      <button
        onClick={() => {
          setVisible(false)
          setTimeout(() => {
            onClose?.()
          }, 300)
        }}
        className="flex-shrink-0 rounded-full p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Toast context for global usage
import { createContext, useContext, ReactNode } from "react"

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<
    Array<{
      id: number
      message: string
      type: ToastType
      duration: number
    }>
  >([])

  const showToast = (
    message: string,
    type: ToastType = "info",
    duration: number = 3000
  ) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type, duration }])
  }

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
            positionClassName="relative"
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
