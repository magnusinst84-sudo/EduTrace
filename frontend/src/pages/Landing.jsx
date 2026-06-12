import React, { useState, useEffect } from "react";
import { BookOpen, Home, MessageSquare, Map } from "lucide-react";
import { TopicInput } from "../components/TopicInput";
import { ExampleChip } from "../components/ExampleChip";
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import { FloatingDock } from "../components/FloatingDock"

const dockItems = [
  { label: "Home", href: "/home", 
    icon: <Home size={20} /> },
  { label: "Chat", href: "/chat", 
    icon: <MessageSquare size={20} /> },
  { label: "Progress", href: "/progress", 
    icon: <Map size={20} /> },
]

export default function Landing() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const chips = ["React", "Machine Learning", "System Design", "Python", "Data Structures"];

  const [pastSessions, setPastSessions] = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(true)

  // Load past sessions on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const res = await api.get('/api/sessions')
        const sorted = (res.data.sessions || [])
          .sort((a, b) => (b.session_id > a.session_id ? 1 : -1))
        setPastSessions(sorted.slice(0, 5))
      } catch (err) {
        console.error('Failed to load sessions:', err)
      } finally {
        setSessionsLoading(false)
      }
    }
    loadSessions()
  }, [])

  const handleStart = async () => {
    if (!topic.trim() || topic.trim().length < 3) {
      setError('Topic must be at least 3 characters')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/api/session/start', { topic: topic.trim() })
      const { session_id } = res.data
      navigate('/chat', { state: { topic: topic.trim(), session_id } })
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F9FAFB",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 24px 96px 24px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Logout button top right */}
      <button
        onClick={() => { logout(); navigate('/login') }}
        style={{
          position: "absolute",
          top: 24,
          right: 24,
          padding: "6px 14px",
          borderRadius: 8,
          border: "1.5px solid #E5E7EB",
          backgroundColor: "#fff",
          color: "#6B7280",
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Logout
      </button>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BookOpen size={22} color="#fff" />
        </div>
        <span style={{ fontSize: 32, fontWeight: 700, color: "#1E1B4B", letterSpacing: "-0.03em" }}>EduTrace</span>
      </div>

      <p style={{ fontSize: 16, color: "#6B7280", marginBottom: 36, marginTop: 0, textAlign: "center", maxWidth: 360 }}>
        Enter any topic and get a personalized learning path — adapted as you go.
      </p>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        <TopicInput value={topic} onChange={setTopic} onSubmit={handleStart} autoFocus />

        {loading && (
          <div style={{ color: "#4F46E5", fontSize: 13, marginTop: 12, fontWeight: 500 }}>
            Analyzing topic and setting up workspace...
          </div>
        )}

        {error && (
          <div style={{ color: "#EF4444", fontSize: 13, marginTop: 12, fontWeight: 500 }}>
            {error}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16, justifyContent: "center", maxWidth: 480 }}>
        {chips.map((c) => (
          <ExampleChip key={c} label={c} onClick={(v) => { setTopic(v); }} />
        ))}
      </div>

      {/* Past Sessions */}
      {!sessionsLoading && pastSessions.length > 0 && (
        <div style={{ width: "100%", maxWidth: 480, marginTop: 36 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#6B7280", marginBottom: 10, textAlign: "left" }}>
            Continue where you left off
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pastSessions.map(session => (
              <button
                key={session.session_id}
                onClick={() => {
                  sessionStorage.setItem('edutrace_session_id', session.session_id)
                  sessionStorage.setItem('edutrace_topic', session.topic)
                  navigate('/chat', {
                    state: { session_id: session.session_id, topic: session.topic }
                  })
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  backgroundColor: "#fff",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: 12,
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "Inter, sans-serif",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#A5B4FC"
                  e.currentTarget.style.boxShadow = "0 1px 6px rgba(79,70,229,0.1)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#E5E7EB"
                  e.currentTarget.style.boxShadow = "none"
                }}
              >
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111827" }}>
                    {session.topic}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9CA3AF" }}>
                    {session.roadmap_generated
                      ? `Week ${session.current_week} of ${session.total_weeks}`
                      : session.diagnostic_complete
                      ? 'Roadmap not generated yet'
                      : 'Diagnostic in progress'}
                  </p>
                </div>
                <span style={{ fontSize: 12, color: "#4F46E5", fontWeight: 500 }}>
                  Resume →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 48 }}>Powered by Gemini API</p>
      <FloatingDock items={dockItems} />
    </div>
  );
}
