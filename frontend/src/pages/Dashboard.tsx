import React from "react"
import { ProblemList } from "@/components/Problems/ProblemList"

export const Dashboard: React.FC = () => {
  return (
    <div className="flex flex-col h-full gap-8 overflow-hidden">
      <header className="shrink-0 px-2 lg:px-4">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Challenge Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Select a challenge to receive AI-powered feedback.</p>
      </header>

      <div className="shrink-0 grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 px-2 lg:px-4">
        <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-[10px] text-muted-foreground uppercase tracking-widest text-primary/70">Solved Challenges</h3>
          <p className="text-3xl font-bold mt-1">12 / 48</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-[10px] text-muted-foreground uppercase tracking-widest text-emerald-500/70">AI Review Score</h3>
          <p className="text-3xl font-bold mt-1">94%</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-[10px] text-muted-foreground uppercase tracking-widest text-amber-500/70">Current Streak</h3>
          <p className="text-3xl font-bold mt-1">5 Days</p>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-2 lg:px-4 pb-8">
        <ProblemList />
      </div>
    </div>
  )
}
