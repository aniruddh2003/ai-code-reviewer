import React from "react"
import { ProblemList } from "@/components/Problems/ProblemList"

export const Dashboard: React.FC = () => {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Challenge Dashboard</h1>
        <p className="text-muted-foreground mt-1">Select a coding challenge to get started and receive AI-powered feedback.</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Quick Stats Placeholder */}
        <div className="rounded-lg border border-border/50 bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Solved Challenges</h3>
          <p className="text-3xl font-bold mt-2">12 / 48</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">AI Feedback Score</h3>
          <p className="text-3xl font-bold mt-2">94%</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Current Streak</h3>
          <p className="text-3xl font-bold mt-2">5 Days</p>
        </div>
      </div>

      <ProblemList />
    </div>
  )
}
