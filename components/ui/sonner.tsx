"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, toast, type ToasterProps } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, InformationCircleIcon, Alert02Icon, MultiplicationSignCircleIcon, Loading03Icon } from "@hugeicons/core-free-icons"

const DismissibleIcon = ({ icon }: { icon: any }) => (
  <button
    type="button"
    onClick={() => toast.dismiss()}
    className="cursor-pointer hover:opacity-70 transition-opacity"
  >
    <HugeiconsIcon icon={icon} strokeWidth={2} className="size-4" />
  </button>
)

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <DismissibleIcon icon={CheckmarkCircle02Icon} />,
        info: <DismissibleIcon icon={InformationCircleIcon} />,
        warning: <DismissibleIcon icon={Alert02Icon} />,
        error: <DismissibleIcon icon={MultiplicationSignCircleIcon} />,
        loading: (
          <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
