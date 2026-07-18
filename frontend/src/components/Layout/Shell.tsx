import React, { useEffect } from "react"
import { useThemeStore } from "@/stores/themeStore"
import { Sun, Moon, Rocket, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { auth, isDemoMode } from "@/firebase/config"
import { signInAnonymously, onAuthStateChanged, User as FirebaseUser } from "firebase/auth"
import { useAuthStore } from "@/stores/authStore"

interface ShellProps {
  children: React.ReactNode
}

import { useLocation } from "react-router-dom"

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const { theme, toggleTheme } = useThemeStore()
  const { user, setUser } = useAuthStore()
  const location = useLocation()

  const isFullFitPage = location.pathname.startsWith("/problems/") || location.pathname === "/"

  useEffect(() => {
    if (isDemoMode) return
    return onAuthStateChanged(auth, (u) => setUser(u))
  }, [setUser])

  const handleLogin = async () => {
    if (isDemoMode) {
      setUser({
        uid: "demo-user",
        isAnonymous: true,
        displayName: "Guest Developer",
        email: "demo@example.com"
      } as FirebaseUser)
      return
    }

    try {
      await signInAnonymously(auth)
    } catch (error) {
      console.error("Login failed:", error)
    }
  }

  // Initialize theme on mount
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [theme])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Glassmorphic Navbar */}
      <nav className={cn(
        "z-50 shrink-0 border-b border-border/40 bg-background/60 backdrop-blur-md supports-[backdrop-filter]:bg-background/60",
        isFullFitPage ? "px-4" : ""
      )}>
        <div className={cn(
          "flex h-16 items-center justify-between",
          isFullFitPage ? "w-full" : "container mx-auto"
        )}>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Rocket className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text">
              Antigravity
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-muted/50 transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-yellow-500 transition-all hover:rotate-45" />
              ) : (
                <Moon className="h-5 w-5 text-slate-700 transition-all -rotate-12 hover:rotate-0" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {user ? (
              <div className="flex items-center gap-2 pl-4 border-l border-border/40">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/30 ring-2 ring-primary/10">
                  {user.isAnonymous ? "DEV" : user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:flex flex-col">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest leading-none mb-0.5",
                    theme === "dark" ? "text-white/40" : "text-slate-400"
                  )}>
                    Reviewer
                  </span>
                  <span className={cn(
                    "text-xs font-semibold leading-none",
                    theme === "dark" ? "text-white/70" : "text-slate-900"
                  )}>
                    {user.isAnonymous ? "Guest Developer" : user.displayName}
                  </span>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogin}
                className="gap-2 border-border/40 hover:bg-muted/50"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 overflow-hidden",
        isFullFitPage ? "p-4" : "container mx-auto py-8"
      )}>
        <div className={cn(
          "h-full w-full transition-all duration-300",
          isFullFitPage ? "" : "rounded-xl border p-6 bg-card shadow-sm"
        )}>
          {children}
        </div>
      </main>
    </div>
  );
};
