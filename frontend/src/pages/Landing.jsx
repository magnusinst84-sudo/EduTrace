import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";
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
    <div style={{ minHeight: "100vh", backgroundColor: "#05050f", fontFamily: "'JetBrains Mono', monospace", paddingBottom: 96 }}>
      
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 40px", backgroundColor: "#0d0d1f", borderBottom: "1.5px solid rgba(0,255,247,0.15)" }}>
        <div
          onClick={() => navigate('/home')}
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        >
          <img src={logo} alt="EduTrace" style={{ height: 28, width: 28, objectFit: "contain", marginRight: 8, verticalAlign: "middle" }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "#00fff7", letterSpacing: "0.2em" }}>EDUTRACE</span>
        </div>
        <button
          onClick={() => { logout(); navigate('/login') }}
          style={{
            backgroundColor: "transparent",
            border: "1.5px solid #ff2d6b",
            borderRadius: 0,
            color: "#ff2d6b",
            fontSize: 11,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "6px 14px",
            cursor: "pointer",
            boxShadow: "2px 2px 0 #ff2d6b",
            transition: "all 0.1s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255,45,107,0.1)"
            e.currentTarget.style.boxShadow = "none"
            e.currentTarget.style.transform = "translate(2px,2px)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent"
            e.currentTarget.style.boxShadow = "2px 2px 0 #ff2d6b"
            e.currentTarget.style.transform = "none"
          }}
        >
          Logout
        </button>
      </div>

      {/* Hero Search */}
      <div className="scanlines" style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px 40px", position: "relative" }}>
        <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 700, color: "#e0f7f7", letterSpacing: "0.04em", marginBottom: 8, textAlign: "center" }}>
          What do you want to learn today?
        </h1>
        <p style={{ fontSize: 13, color: "#4a7a7a", marginBottom: 32, textAlign: "center", letterSpacing: "0.06em" }}>
          Enter any topic and get a personalized week-by-week learning path.
        </p>
        <TopicInput value={topic} onChange={setTopic} onSubmit={handleStart} autoFocus />
        {loading && <p style={{ color: "#00fff7", fontSize: 12, marginTop: 12, textAlign: "center" }}>Setting up your workspace...</p>}
        {error && <p style={{ color: "#ff2d6b", fontSize: 12, marginTop: 12, textAlign: "center" }}>{error}</p>}
        
        {/* Chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16, justifyContent: "center" }}>
          {chips.map((c) => (
            <ExampleChip key={c} label={c} onClick={(v) => setTopic(v)} />
          ))}
        </div>
      </div>

      {/* Stats Row */}
      {!sessionsLoading && (
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px 40px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { label: "Sessions Started", value: pastSessions.length },
            { label: "Topics Explored", value: [...new Set(pastSessions.map(s => s.topic))].length },
            { label: "Roadmaps Generated", value: pastSessions.filter(s => s.roadmap_generated).length },
            { label: "Weeks Completed", value: pastSessions.reduce((acc, s) => acc + Math.max(0, (s.current_week || 1) - 1), 0) },
          ].map((stat, i) => (
            <div key={i} style={{ backgroundColor: "#0d0d1f", border: "1px solid rgba(0,255,247,0.12)", borderRadius: 0, padding: "20px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 26, fontWeight: 700, color: "#00fff7", margin: 0 }}>{stat.value}</p>
              <p style={{ fontSize: 10, color: "#4a7a7a", marginTop: 6, letterSpacing: "0.1em", textTransform: "uppercase" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Two Column Layout */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: pastSessions.length > 0 ? "1fr 1fr" : "1fr", gap: 24 }}>
        
        {/* Left: Continue Learning */}
        {!sessionsLoading && pastSessions.length > 0 && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 500, color: "#4a7a7a", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.16em" }}>
              Continue Learning
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pastSessions.map(session => {
                const progress = session.total_weeks > 0 ? ((session.current_week - 1) / session.total_weeks) * 100 : 0
                return (
                  <button
                    key={session.session_id}
                    onClick={() => {
                      sessionStorage.setItem('edutrace_session_id', session.session_id)
                      sessionStorage.setItem('edutrace_topic', session.topic)
                      navigate('/chat', { state: { session_id: session.session_id, topic: session.topic } })
                    }}
                    style={{ width: "100%", display: "flex", flexDirection: "column", padding: 16, backgroundColor: "#0d0d1f", border: "1.5px solid rgba(0,255,247,0.12)", borderRadius: 0, cursor: "pointer", textAlign: "left", fontFamily: "'JetBrains Mono', monospace", transition: "all 0.08s ease", boxShadow: "none" }}
                    onMouseEnter={(e) => { 
                      e.currentTarget.style.borderColor = "rgba(0,255,247,0.5)"; 
                      e.currentTarget.style.backgroundColor = "rgba(0,255,247,0.03)";
                      e.currentTarget.style.boxShadow = "3px 3px 0 rgba(0,255,247,0.2)";
                      e.currentTarget.style.transform = "translate(-1px,-1px)";
                    }}
                    onMouseLeave={(e) => { 
                      e.currentTarget.style.borderColor = "rgba(0,255,247,0.12)"; 
                      e.currentTarget.style.backgroundColor = "#0d0d1f";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, width: "100%" }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "#e0f7f7" }}>
                        {session.topic.charAt(0).toUpperCase() + session.topic.slice(1)}
                      </p>
                      <span style={{ fontSize: 11, color: "#00fff7", letterSpacing: "0.08em", flexShrink: 0, marginLeft: 8 }}>
                        Resume →
                      </span>
                    </div>
                    <p style={{ margin: "0 0 10px", fontSize: 11, color: "#4a7a7a" }}>
                      {session.roadmap_generated ? `Week ${session.current_week} of ${session.total_weeks}` : session.diagnostic_complete ? 'Roadmap not generated yet' : 'Diagnostic in progress'}
                    </p>
                    {session.roadmap_generated && (
                      <div style={{ height: 3, backgroundColor: "rgba(0,255,247,0.06)", borderRadius: 0, overflow: "hidden", width: "100%" }}>
                        <div style={{ height: "100%", width: `${progress}%`, backgroundColor: "#00fff7", boxShadow: "0 0 4px #00fff7", transition: "width 0.3s" }} />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Right: Tips */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 500, color: "#4a7a7a", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.16em" }}>
            Popular Topics
          </p>
          <div style={{ backgroundColor: "#0d0d1f", border: "1.5px solid rgba(0,255,247,0.12)", borderRadius: 0, padding: 20 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {["React", "Machine Learning", "System Design", "Python", "Data Structures", "Docker", "TypeScript", "FastAPI"].map(t => (
                <button
                  key={t}
                  onClick={() => { setTopic(t); }}
                  style={{ padding: "5px 12px", borderRadius: 0, backgroundColor: "transparent", border: "1px solid rgba(0,255,247,0.18)", color: "#4a7a7a", fontSize: 12, cursor: "pointer", transition: "all 0.08s", fontFamily: "'JetBrains Mono', monospace" }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.borderColor = "#00fff7";
                    e.currentTarget.style.color = "#00fff7";
                    e.currentTarget.style.boxShadow = "2px 2px 0 rgba(0,255,247,0.2)";
                  }}
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.borderColor = "rgba(0,255,247,0.18)";
                    e.currentTarget.style.color = "#4a7a7a";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <div style={{ borderTop: "1px solid rgba(0,255,247,0.08)", paddingTop: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 500, color: "#4a7a7a", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 8 }}>Pro Tip</p>
              <p style={{ fontSize: 12, color: "#4a7a7a", lineHeight: 1.7, margin: 0 }}>
                Be specific with your topic. "React hooks for beginners" gives a better roadmap than just "React".
              </p>
            </div>
          </div>
        </div>
      </div>

      <p style={{ fontSize: 10, color: "#4a7a7a", marginTop: 48, textAlign: "center" }}>Powered by Gemini API</p>
      <FloatingDock items={dockItems} />
    </div>
  );
}
