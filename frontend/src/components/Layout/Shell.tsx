import React, { useEffect } from "react"
import { useThemeStore } from "@/stores/themeStore"
import { Sun, Moon, Rocket, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ShellProps {
  children: React.ReactNode
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const { theme, toggleTheme } = useThemeStore()

  // Initialize theme on mount
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [theme])

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Glassmorphic Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Rocket className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">Antigravity Review</span>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-yellow-500 transition-all" />
              ) : (
                <Moon className="h-5 w-5 text-slate-700 transition-all" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
              <User className="h-4 w-4" />
              Login
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="container pt-24 pb-12">
        <div className={cn(
          "relative min-h-[calc(100vh-9rem)] rounded-xl border border-border/40 bg-card/30 p-6 shadow-2xl backdrop-blur-sm",
          "after:absolute after:inset-0 after:-z-10 after:rounded-xl after:bg-gradient-to-br after:from-primary/5 after:to-secondary/5"
        )}>
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-sm text-muted-foreground">
        <p>© 2026 Antigravity Review Platform. All rights reserved.</p>
      </footer>
    </div>
  )
}
