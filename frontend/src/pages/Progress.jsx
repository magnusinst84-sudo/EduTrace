import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Timeline } from "../components/ui/timeline"
import { useAuth } from "../context/AuthContext"
import api from "../api/client"
import { CheckCircle, Circle, Clock } from "lucide-react"

export default function Progress() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [timelineData, setTimelineData] = useState([])
  const [loading, setLoading] = useState(true)
  const [topic, setTopic] = useState("")
  const [level, setLevel] = useState("")

  useEffect(() => {
    const sessionId = sessionStorage.getItem("edutrace_session_id")
    const sessionTopic = sessionStorage.getItem("edutrace_topic")
    if (sessionTopic) setTopic(sessionTopic)

    if (!sessionId) {
      setLoading(false)
      return
    }

    api.get(`/api/session/${sessionId}`)
      .then(res => {
        const session = res.data
        setLevel(session.level || "")
        if (session.roadmap) {
          const weeksList = Array.isArray(session.roadmap.weeks)
            ? session.roadmap.weeks
            : Array.isArray(session.roadmap)
            ? session.roadmap
            : []

          const data = weeksList.map((week, index) => {
            const wNum = week.week ?? index + 1
            const isComplete = wNum < (session.current_week ?? 1)
            const isCurrent = wNum === (session.current_week ?? 1)
            const icon = isComplete
              ? <CheckCircle size={14} className="text-green-500" />
              : isCurrent
              ? <Clock size={14} className="text-indigo-400" />
              : <Circle size={14} className="text-gray-400" />

            const concepts = Array.isArray(week.topics) ? week.topics
                           : Array.isArray(week.concepts) ? week.concepts
                           : []

            return {
              title: `Week ${wNum} · ${week.title || week.topic || ""}`,
              content: (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {icon}
                    <span className={`text-xs font-medium ${
                      isComplete ? "text-green-600"
                      : isCurrent ? "text-indigo-500"
                      : "text-gray-400"
                    }`}>
                      {isComplete ? "Completed"
                       : isCurrent ? "In Progress"
                       : "Upcoming"}
                    </span>
                  </div>
                  {(week.goal || week.description) && (
                    <p className="text-gray-500 text-sm">{week.goal || week.description}</p>
                  )}
                  {concepts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {concepts.map((t, i) => (
                        <span key={i}
                          className="px-2 py-0.5 text-xs rounded-full 
                                     bg-indigo-50 text-indigo-600 
                                     border border-indigo-100">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            }
          })
          setTimelineData(data)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 
                      px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-gray-900">
            {topic || "Your Progress"}
          </h1>
          {level && (
            <p className="text-xs text-indigo-500 capitalize mt-0.5">
              {level} level
            </p>
          )}
        </div>
        <button
          onClick={() => navigate("/chat")}
          className="px-3 py-1.5 text-sm bg-indigo-600 text-white 
                     rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          Back to chat
        </button>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 pt-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-indigo-500 
                            border-t-transparent rounded-full animate-spin" />
          </div>
        ) : timelineData.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">
              No roadmap generated yet.
            </p>
            <button
              onClick={() => navigate("/home")}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white 
                         text-sm rounded-lg hover:bg-indigo-700 
                         transition-colors cursor-pointer"
            >
              Start Learning
            </button>
          </div>
        ) : (
          <Timeline data={timelineData} />
        )}
      </div>
    </div>
  )
}
