"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    console.log("[v0] Theme toggle clicked. Current:", theme, "New:", newTheme)
    setTheme(newTheme)
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
        <div className="w-4 h-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleThemeToggle}
      className="w-9 h-9 p-0 hover:bg-muted/50 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
      ) : (
        <Moon className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
      )}
    </Button>
  )
}
