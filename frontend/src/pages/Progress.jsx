import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../api/client"
import { CheckCircle, Circle, Clock } from "lucide-react"

export default function Progress() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [weeks, setWeeks] = useState([])
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

          const parsed = weeksList.map((week, index) => {
            const wNum = week.week ?? index + 1
            const isComplete = wNum < (session.current_week ?? 1)
            const isCurrent = wNum === (session.current_week ?? 1)
            const concepts = Array.isArray(week.topics) ? week.topics
                           : Array.isArray(week.concepts) ? week.concepts
                           : []
            return { wNum, isComplete, isCurrent, concepts, week }
          })

          setWeeks(parsed)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const getStatusColor = (isComplete, isCurrent) => {
    if (isComplete) return "#00fff7"
    if (isCurrent) return "#bf00ff"
    return "#4a7a7a"
  }

  const getStatusLabel = (isComplete, isCurrent) => {
    if (isComplete) return "Completed"
    if (isCurrent) return "In Progress"
    return "Upcoming"
  }

  const getStatusIcon = (isComplete, isCurrent) => {
    const color = getStatusColor(isComplete, isCurrent)
    if (isComplete) return <CheckCircle size={13} color={color} />
    if (isCurrent) return <Clock size={13} color={color} />
    return <Circle size={13} color={color} />
  }

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "#05050f", fontFamily: "'JetBrains Mono', monospace" }}>

      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        backgroundColor: "#0d0d1f",
        borderBottom: "1.5px solid rgba(0,255,247,0.15)"
      }}>
        <div>
          <h1 style={{ color: "#00fff7", fontSize: 13, fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase", margin: 0 }}>
            {topic || "Your Progress"}
          </h1>
          {level && (
            <p style={{ fontSize: 10, color: "#4a7a7a", letterSpacing: "0.1em", textTransform: "uppercase", margin: "4px 0 0" }}>
              {level} level
            </p>
          )}
        </div>
        <button
          onClick={() => navigate("/chat")}
          style={{
            backgroundColor: "transparent",
            border: "1.5px solid rgba(0,255,247,0.3)",
            borderRadius: 0,
            color: "#4a7a7a",
            fontSize: 11,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "6px 14px",
            cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace",
            transition: "all 0.1s"
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#00fff7"; e.currentTarget.style.color = "#00fff7" }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,255,247,0.3)"; e.currentTarget.style.color = "#4a7a7a" }}
        >
          Back to chat
        </button>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
            <div style={{
              width: 24, height: 24,
              border: "2px solid rgba(0,255,247,0.15)",
              borderTop: "2px solid #00fff7",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite"
            }} />
          </div>

        ) : weeks.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <p style={{ color: "#4a7a7a", fontSize: 13 }}>No roadmap generated yet.</p>
            <button
              onClick={() => navigate("/home")}
              style={{
                backgroundColor: "transparent",
                border: "1.5px solid #00fff7",
                color: "#00fff7",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "10px 24px",
                borderRadius: 0,
                cursor: "pointer",
                boxShadow: "3px 3px 0 #00fff7",
                fontFamily: "'JetBrains Mono', monospace",
                transition: "all 0.1s"
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(0,255,247,0.08)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translate(3px,3px)" }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.boxShadow = "3px 3px 0 #00fff7"; e.currentTarget.style.transform = "none" }}
            >
              Start Learning
            </button>
          </div>

        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {weeks.map(({ wNum, isComplete, isCurrent, concepts, week }) => {
              const statusColor = getStatusColor(isComplete, isCurrent)
              const borderColor = isCurrent
                ? "rgba(191,0,255,0.45)"
                : isComplete
                ? "rgba(0,255,247,0.2)"
                : "rgba(255,255,255,0.06)"
              const cardBg = isCurrent
                ? "rgba(191,0,255,0.06)"
                : isComplete
                ? "rgba(0,255,247,0.04)"
                : "rgba(255,255,255,0.03)"

              return (
                <div key={wNum} style={{
                  backgroundColor: cardBg,
                  border: `1px solid ${borderColor}`,
                  borderLeft: `3px solid ${statusColor}`,
                  padding: "16px 20px",
                  position: "relative",
                  transition: "border-color 0.15s"
                }}>
                  {/* Week title row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ color: statusColor, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.6 }}>
                        W{String(wNum).padStart(2, "0")}
                      </span>
                      <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 500 }}>
                        {week.title || week.topic || ""}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {getStatusIcon(isComplete, isCurrent)}
                      <span style={{ fontSize: 10, color: statusColor, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        {getStatusLabel(isComplete, isCurrent)}
                      </span>
                    </div>
                  </div>

                  {/* Goal / description */}
                  {(week.goal || week.description) && (
                    <p style={{ color: "#6b7280", fontSize: 11.5, lineHeight: 1.65, margin: "0 0 12px" }}>
                      {week.goal || week.description}
                    </p>
                  )}

                  {/* Concept pills */}
                  {concepts.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {concepts.map((t, i) => (
                        <span key={i} style={{
                          padding: "3px 9px",
                          border: "1px solid rgba(0,255,247,0.18)",
                          color: "#00fff7",
                          backgroundColor: "rgba(0,255,247,0.05)",
                          fontSize: 10,
                          letterSpacing: "0.06em",
                          borderRadius: 0
                        }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#0d0d1f",
        border: "1.5px solid rgba(0,255,247,0.15)",
        borderRadius: 16,
        padding: "10px 20px",
        zIndex: 50
      }}>
        <button onClick={() => navigate("/home")} style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 12px", color: "#4a7a7a" }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 9.75L12 3l9 6.75V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z"/><path d="M9 22V12h6v10"/></svg>
        </button>
        <button onClick={() => navigate("/chat")} style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 12px", color: "#4a7a7a" }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        </button>
        <button onClick={() => navigate("/progress")} style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 12px", color: "#00fff7" }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 20H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4"/><path d="M9 12h6M9 16h3"/><path d="M16 19l2 2 4-4"/></svg>
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
