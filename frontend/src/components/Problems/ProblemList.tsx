import React, { useEffect, useState } from "react"
import { collection, onSnapshot, query, orderBy, addDoc } from "firebase/firestore"
import { db, isDemoMode } from "@/firebase/config"
import { Problem } from "@/types/problem"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"

export const ProblemList: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (isDemoMode) {
      // Mock Problem List
      setProblems([
        {
          id: "two-sum",
          title: "Two Sum",
          description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
          difficulty: "Easy",
          category: "Arrays",
          order: 1,
          starterCode: { javascript: "", python: "", cpp: "" }
        },
        {
          id: "reverse-int",
          title: "Reverse Integer",
          description: "Given a signed 32-bit integer `x`, return `x` with its digits reversed.",
          difficulty: "Medium",
          category: "Math",
          order: 2,
          starterCode: { javascript: "", python: "", cpp: "" }
        }
      ] as Problem[])
      setLoading(false)
      return
    }

    const q = query(collection(db, "problems"), orderBy("order", "asc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const problemData: Problem[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Problem[]
      setProblems(problemData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const seedProblems = async () => {
    const problemsToAdd = [
      {
        title: "Two Sum",
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
        difficulty: "Easy",
        category: "Arrays",
        order: 1,
        starterCode: {
          javascript: "function twoSum(nums, target) {\n  // Write your code here\n};",
          python: "def twoSum(nums, target):\n    # Write your code here\n    pass",
          cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};"
        }
      },
      {
        title: "Reverse Integer",
        description: "Given a signed 32-bit integer `x`, return `x` with its digits reversed.",
        difficulty: "Medium",
        category: "Math",
        order: 2,
        starterCode: {
          javascript: "function reverse(x) {\n  // Write your code here\n};",
          python: "def reverse(x):\n    # Write your code here\n    pass",
          cpp: "class Solution {\npublic:\n    int reverse(int x) {\n        \n    }\n};"
        }
      }
    ]

    for (const p of problemsToAdd) {
      await addDoc(collection(db, "problems"), p)
    }
  }

  if (loading) return <div className="text-center p-12 text-muted-foreground animate-pulse">Loading challenges...</div>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Available Problems</h2>
        {problems.length === 0 && (
          <Button onClick={seedProblems} variant="outline" size="sm">
            Seed Demo Problems
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {problems.map((problem) => (
          <Card 
            key={problem.id} 
            className="group cursor-pointer border-border/50 bg-card/50 transition-all hover:border-primary/50 hover:bg-card/80 hover:shadow-lg"
            onClick={() => navigate(`/problems/${problem.id}`)}
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  "text-xs font-bold uppercase tracking-wider px-2 py-1 rounded",
                  problem.difficulty === "Easy" && "bg-emerald-500/10 text-emerald-500",
                  problem.difficulty === "Medium" && "bg-amber-500/10 text-amber-500",
                  problem.difficulty === "Hard" && "bg-rose-500/10 text-rose-500"
                )}>
                  {problem.difficulty}
                </span>
                <span className="text-xs text-muted-foreground">{problem.category}</span>
              </div>
              <CardTitle className="group-hover:text-primary transition-colors">{problem.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {problem.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
