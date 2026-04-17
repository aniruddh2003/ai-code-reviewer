import React, { useEffect, useState } from "react"
import { useThemeStore } from "@/stores/themeStore"
import { Sun, Moon, Rocket, User, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { auth, isDemoMode } from "@/firebase/config"
import { signInAnonymously, onAuthStateChanged, User as FirebaseUser } from "firebase/auth"
import { useAuthStore } from "@/stores/authStore"

interface ShellProps {
  children: React.ReactNode
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const { theme, toggleTheme } = useThemeStore()
  const { user, setUser } = useAuthStore()

  useEffect(() => {
    if (isDemoMode) return
    return onAuthStateChanged(auth, (u) => setUser(u))
  }, [setUser])

  const handleLogin = async () => {
    if (isDemoMode) {
      // Instant mock login for Demo Mode
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

            {user ? (
              <div className="flex items-center gap-2 pl-4 border-l border-white/10">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/30">
                  {user.isAnonymous ? "DEV" : user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest leading-none mb-0.5",
                    theme === "dark" ? "text-white/40" : "text-slate-400"
                  )}>
                    Logged In
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
                className="gap-2 border-white/10 hover:bg-white/5"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="container pt-24 pb-12">
        <div className={cn(
          "relative min-h-[calc(100vh-9rem)] rounded-xl border p-6 transition-all duration-300",
          theme === "dark" 
            ? "border-white/10 bg-[#0c0c0e] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]" 
            : "border-slate-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        )}>
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-sm text-muted-foreground bg-card/20 backdrop-blur-sm">
        <p>© 2026 Antigravity Review Platform. All rights reserved.</p>
        <div className={cn(
          "mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border shadow-sm",
          isDemoMode
            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
            : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
        )}>
          <span className="relative flex h-2 w-2">
            <span className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              isDemoMode ? "bg-amber-400" : "bg-emerald-400"
            )}></span>
            <span className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              isDemoMode ? "bg-amber-500" : "bg-emerald-500"
            )}></span>
          </span>
          {isDemoMode ? "Running in Demo Mode (Mock Storage)" : "Running in Emulator Mode"}
        </div>
      </footer>
    </div>
  )
}
