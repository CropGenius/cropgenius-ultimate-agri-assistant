
"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:animate-in group-[.toaster]:fade-in-50 group-[.toaster]:slide-in-from-top-full group-[.toaster]:duration-300",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:shadow-sm",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton:
            "group-[.toast]:text-foreground/50 group-[.toast]:hover:text-foreground",
          success: 
            "group-[.toast]:border-green-500/30 group-[.toast]:bg-green-500/10 dark:group-[.toast]:bg-green-900/20",
          error:
            "group-[.toast]:border-red-500/30 group-[.toast]:bg-red-500/10 dark:group-[.toast]:bg-red-900/20",
          warning:
            "group-[.toast]:border-amber-500/30 group-[.toast]:bg-amber-500/10 dark:group-[.toast]:bg-amber-900/20",
          info:
            "group-[.toast]:border-blue-500/30 group-[.toast]:bg-blue-500/10 dark:group-[.toast]:bg-blue-900/20",
        },
        duration: 5000,
        unstyled: false,
      }}
      {...props}
    />
  )
}

export { Toaster }
