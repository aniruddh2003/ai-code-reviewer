import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Shell } from "@/components/Layout/Shell"
import { Dashboard } from "@/pages/Dashboard"
import { ProblemDetail } from "@/pages/ProblemDetail"

function App() {
  return (
    <Router>
      <Shell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/problems/:id" element={<ProblemDetail />} />
        </Routes>
      </Shell>
    </Router>
  )
}

export default App
