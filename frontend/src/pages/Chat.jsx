import React, { useState, useEffect, useRef } from "react";
import logo from "../assets/logo.png";
import { BookOpen, RotateCcw, Send, LogOut, X, ChevronLeft, ChevronRight, Home, MessageSquare, Map, Download } from "lucide-react";
import { MessageBubble } from "../components/MessageBubble";
import { TypingIndicator } from "../components/TypingIndicator";
import { RoadmapWeekCard } from "../components/RoadmapWeekCard";
import { WorldStatePanel } from "../components/WorldStatePanel";
import { QuizPanel } from "../components/QuizPanel";
import { exportRoadmapPDF } from "../utils/exportRoadmapPDF";
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import { FloatingDock } from "../components/FloatingDock"

const dockItems = [
  { label: "Home", href: "/home", icon: <Home size={20} /> },
  { label: "Chat", href: "/chat", icon: <MessageSquare size={20} /> },
  { label: "Progress", href: "/progress", icon: <Map size={20} /> },
]

const PACE_HINTS = {
  relaxed: "[User prefers a relaxed pace: use more examples, break down concepts into smaller steps, and check for understanding frequently.]",
  normal: "",
  accelerated: "[User prefers an accelerated pace: be concise, skip basics, assume strong grasp, and push toward advanced applications.]",
}

function normalizeRoadmap(rawRoadmap, currentWeek = 1) {
  if (!rawRoadmap) return []
  const weeks = Array.isArray(rawRoadmap.weeks)
    ? rawRoadmap.weeks
    : Array.isArray(rawRoadmap)
      ? rawRoadmap
      : []
  return weeks.map((w, i) => ({
    week: w.week ?? i + 1,
    topic: w.title ?? w.topic ?? `Week ${i + 1}`,
    concepts: Array.isArray(w.topics) ? w.topics
      : Array.isArray(w.concepts) ? w.concepts
        : [],
    resources: Array.isArray(w.resources) ? w.resources : [],
    hours: w.hours ?? 5,
    goal: w.goal ?? '',
    status: (w.week ?? i + 1) === currentWeek ? 'current'
      : (w.week ?? i + 1) < currentWeek ? 'completed'
        : 'upcoming',
  }))
}

function RoadmapPanel({ roadmap, currentWeek, onClose, topic, level }) {
  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: "#0d0d1f", borderLeft: "1.5px solid rgba(0,255,247,0.15)" }}>
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: "1.5px solid rgba(0,255,247,0.1)" }}>
        <h2 style={{ fontSize: 11, fontWeight: 500, color: "#00fff7", letterSpacing: "0.16em", textTransform: "uppercase", margin: 0 }}>Your Roadmap</h2>
        <div className="flex items-center gap-2">
          {roadmap && roadmap.length > 0 && (
            <button 
              onClick={() => exportRoadmapPDF(roadmap, topic, level)}
              style={{ backgroundColor: "transparent", border: "1px solid rgba(0,255,247,0.2)", borderRadius: 0, color: "#4a7a7a", fontSize: 10, letterSpacing: "0.08em", padding: "4px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, transition: "all 0.1s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#00fff7"; e.currentTarget.style.color = "#00fff7"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0,255,247,0.2)"; e.currentTarget.style.color = "#4a7a7a"; }}
              title="Export Roadmap as PDF"
            >
              <Download size={14} /> Export PDF
            </button>
          )}
          <button 
            onClick={onClose} 
            style={{ backgroundColor: "transparent", border: "1px solid rgba(0,255,247,0.15)", borderRadius: 0, color: "#4a7a7a", padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", transition: "all 0.1s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ff2d6b"; e.currentTarget.style.color = "#ff2d6b"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0,255,247,0.15)"; e.currentTarget.style.color = "#4a7a7a"; }}
          >
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto" style={{ padding: 12 }}>
        <div className="space-y-2">
          {roadmap.map((week, index) => (
            <div key={week.week || index} className="transition-all duration-300 ease-out" style={{ opacity: 1, transform: 'translateY(0)', animation: `fadeSlideIn 300ms ease-out ${index * 150}ms both` }}>
              <RoadmapWeekCard
                {...week}
                status={week.week === currentWeek ? 'current' : week.week < currentWeek ? 'completed' : 'upcoming'}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BottomSheet({ isOpen, onClose, children }) {
  const sheetRef = useRef(null)
  const startYRef = useRef(null)

  const handleTouchStart = (e) => { startYRef.current = e.touches[0].clientY }
  const handleTouchMove = (e) => { if (!startYRef.current) return; if (e.touches[0].clientY - startYRef.current > 80) onClose() }
  const handleTouchEnd = () => { startYRef.current = null }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-45" style={{ backgroundColor: "rgba(0,0,0,0.75)" }} onClick={onClose} />
      <div ref={sheetRef} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
        className="fixed bottom-0 left-0 right-0 z-50 overflow-hidden shadow-2xl" style={{ height: '85vh', backgroundColor: "#0d0d1f", borderTop: "1.5px solid rgba(0,255,247,0.2)", borderRadius: 0 }}>
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div style={{ backgroundColor: "#00fff7", width: 32, height: 2, borderRadius: 0 }} />
        </div>
        <div className="h-full overflow-y-auto pb-8">{children}</div>
      </div>
    </>
  )
}

export default function Chat() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const sessionId = location.state?.session_id || sessionStorage.getItem('edutrace_session_id')
  const topic = location.state?.topic || sessionStorage.getItem('edutrace_topic') || 'React'

  useEffect(() => {
    if (sessionId) sessionStorage.setItem('edutrace_session_id', sessionId)
    if (topic) sessionStorage.setItem('edutrace_topic', topic)
  }, [sessionId, topic])

  const [panelOpen, setPanelOpen] = useState(false)
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const [messages, setMessages] = useState([{ role: 'agent', content: `Hi! I'm EduTrace. Let's build your personalized ${topic} roadmap. First — what do you already know about ${topic}?`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [roadmap, setRoadmap] = useState(null)
  const [worldState, setWorldState] = useState(null)
  const [sessionState, setSessionState] = useState('diagnostic')
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [pace, setPace] = useState('normal') // 'relaxed' | 'normal' | 'accelerated'

  useEffect(() => {
    if (!sessionId) return
    const restore = async () => {
      try {
        const res = await api.get(`/api/session/${sessionId}`)
        const session = res.data
        setWorldState({
          topic: session.topic ?? topic,
          level: session.level ?? null,
          week: session.current_week ?? 1,
          totalWeeks: session.total_weeks ?? 8,
          understood: session.concepts_understood ?? [],
          stuck: session.concepts_stuck ?? [],
          stuck_mode_active: session.stuck_mode_active ?? false,
          stuck_mode_name: 'Analogy mode',
          teaching_mode: session.teaching_mode ?? 'analogy',
        })
        if (session.roadmap_generated) {
          const normalized = normalizeRoadmap(session.roadmap, session.current_week ?? 1)
          setRoadmap(normalized)
          setSessionState('adaptive')
          setPanelOpen(true)
        } else if (session.diagnostic_complete) {
          setSessionState('roadmap_ready')
        } else {
          setSessionState('diagnostic')
        }
        if (session.conversation_history?.length > 0) {
          const restored = session.conversation_history
            .filter(e => e.role !== 'system')
            .map(e => ({ role: e.role === 'assistant' ? 'agent' : e.role, content: e.content, timestamp: '' }))
          if (restored.length > 0) setMessages(restored)
        }
      } catch (err) {
        console.error('Failed to restore session:', err)
      }
    }
    restore()
  }, [])

  const handleSend = async (overrideMessage = null) => {
    const isOverride = typeof overrideMessage === 'string'
    const textToSend = isOverride ? overrideMessage : input

    if (!textToSend.trim() || !sessionId) return

    const userMsg = {
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(prev => [...prev, userMsg])
    if (!isOverride) setInput('')
    setTyping(true)

    try {
      let res

      if (sessionState === 'diagnostic') {
        res = await api.post(`/api/session/${sessionId}/diagnostic`, { answer: userMsg.content })
        if (res.data.status === 'complete') {
          setSessionState('roadmap_ready')
          setWorldState({ topic, level: res.data.level ?? 'Beginner', week: 1, totalWeeks: 8, understood: [], stuck: [], stuck_mode_active: false, stuck_mode_name: 'Analogy mode' })
          setMessages(prev => [...prev, { role: 'agent', content: `Got it — you're at **${res.data.level}** level. Type "generate roadmap" when you're ready to see your personalized plan.`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
        } else {
          setMessages(prev => [...prev, { role: 'agent', content: res.data.question, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
        }

      } else if (sessionState === 'roadmap_ready' && (userMsg.content.toLowerCase().includes('generate') || userMsg.content.toLowerCase().includes('roadmap') || userMsg.content.toLowerCase().includes('show'))) {
        setGeneratingRoadmap(true)
        try {
          res = await api.post(`/api/session/${sessionId}/roadmap`)
          const normalized = normalizeRoadmap(res.data.roadmap, 1)
          setRoadmap(normalized)
          setSessionState('adaptive')
          setPanelOpen(true)
          setWorldState(prev => prev ? { ...prev, totalWeeks: res.data.total_weeks ?? normalized.length ?? 8 } : null)
          setMessages(prev => [...prev, { role: 'agent', content: `Your ${topic} roadmap is ready! It's ${res.data.total_weeks} weeks long. Check the panel on the right. What would you like to start with?`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
        } finally {
          setGeneratingRoadmap(false)
        }

      } else {
        // Prepend pace hint to message if pace is not normal
        const paceHint = PACE_HINTS[pace]
        const messageWithPace = paceHint ? `${paceHint}\n\n${userMsg.content}` : userMsg.content

        res = await api.post(`/api/session/${sessionId}/chat`, { message: messageWithPace })
        setMessages(prev => [...prev, {
          role: 'agent',
          content: res.data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          stuckMode: res.data.stuck_mode ? 'Stuck mode' : null,
        }])
        if (res.data.stuck_mode !== undefined) {
          setWorldState(prev => prev ? { ...prev, stuck_mode_active: res.data.stuck_mode } : null)
        }
        if (res.data.current_week !== undefined) {
          setWorldState(prev => prev ? { ...prev, week: res.data.current_week } : null)
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'agent', content: 'Something went wrong. Please try again.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    } finally {
      setTyping(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'JetBrains Mono', monospace", backgroundColor: "#05050f" }}>

      <div className="flex flex-col min-w-0 transition-all duration-400 ease-out relative" style={{ flex: panelOpen && !isMobile ? '0 0 60%' : '1 1 100%' }}>

        {/* Top nav */}
        <header style={{ height: 52, backgroundColor: "#0d0d1f", backdropFilter: "none", borderBottom: "1.5px solid rgba(0,255,247,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
          <div
            onClick={() => navigate('/home')}
            style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
          >
            <img src={logo} alt="EduTrace" style={{ height: 28, width: 28, objectFit: "contain", marginRight: 8, verticalAlign: "middle" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#00fff7", letterSpacing: "0.18em" }}>EDUTRACE</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {worldState && (
              <button
                onClick={() => setShowQuiz(true)}
                className="hidden sm:flex"
                style={{
                  backgroundColor: "transparent",
                  border: "1.5px solid #00fff7",
                  borderRadius: 0,
                  color: "#00fff7",
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "6px 14px",
                  cursor: "pointer",
                  boxShadow: "2px 2px 0 #00fff7",
                  display: "flex", alignItems: "center", gap: 6,
                  transition: "all 0.1s"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(0,255,247,0.08)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translate(2px,2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.boxShadow = "2px 2px 0 #00fff7"; e.currentTarget.style.transform = "none"; }}
              >
                Week {worldState?.week || 1} Quiz
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              style={{
                backgroundColor: "transparent",
                border: "1.5px solid rgba(0,255,247,0.2)",
                borderRadius: 0,
                color: "#4a7a7a",
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "6px 14px",
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.1s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(0,255,247,0.5)"; e.currentTarget.style.color = "#00fff7"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0,255,247,0.2)"; e.currentTarget.style.color = "#4a7a7a"; }}
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">New topic</span>
            </button>
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
                display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.1s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,45,107,0.08)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translate(2px,2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.boxShadow = "2px 2px 0 #ff2d6b"; e.currentTarget.style.transform = "none"; }}
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
              {messages.map((m, i) => (
                <MessageBubble key={i} role={m.role} content={m.content} timestamp={m.timestamp} stuckMode={m.stuckMode} />
              ))}
              {typing && (
                <div className="flex flex-col gap-1">
                  <TypingIndicator />
                  {generatingRoadmap && (
                    <p style={{ fontSize: 11, color: "#4a7a7a", letterSpacing: "0.06em", paddingLeft: 4 }}>
                      Generating your personalized roadmap, this may take up to 30 seconds...
                    </p>
                  )}
                </div>
              )}
            </div>

            <div style={{ padding: "12px 16px 80px 16px", borderTop: "1.5px solid rgba(0,255,247,0.1)", backgroundColor: "#05050f", display: "flex", gap: 10, alignItems: "flex-end" }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder="Ask a question, say 'I'm stuck', or type 'next'..."
                rows={1}
                disabled={typing || generatingRoadmap}
                style={{
                  flex: 1, resize: "none",
                  border: "1px solid rgba(0,255,247,0.12)",
                  borderBottom: "1.5px solid #00fff7",
                  backgroundColor: "#0d0d1f",
                  borderRadius: 0,
                  padding: "10px 12px",
                  fontSize: 13, color: "#e0f7f7",
                  outline: "none", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.6
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "rgba(0,255,247,0.4)"}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(0,255,247,0.12)"; e.currentTarget.style.borderBottomColor = "#00fff7"; }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || typing || generatingRoadmap}
                style={{
                  width: 38, height: 38, borderRadius: 0,
                  border: "1.5px solid",
                  borderColor: (input.trim() && !typing && !generatingRoadmap) ? "#00fff7" : "rgba(0,255,247,0.1)",
                  backgroundColor: "transparent",
                  boxShadow: (input.trim() && !typing && !generatingRoadmap) ? "2px 2px 0 #00fff7" : "none",
                  cursor: (input.trim() && !typing && !generatingRoadmap) ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  transition: "all 0.08s ease"
                }}
                onMouseEnter={(e) => {
                  if (input.trim() && !typing && !generatingRoadmap) {
                    e.currentTarget.style.backgroundColor = "rgba(0,255,247,0.08)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translate(2px,2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (input.trim() && !typing && !generatingRoadmap) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.boxShadow = "2px 2px 0 #00fff7";
                    e.currentTarget.style.transform = "none";
                  }
                }}
              >
                <Send size={16} color={(input.trim() && !typing && !generatingRoadmap) ? "#00fff7" : "#4a7a7a"} />
              </button>
            </div>
          </div>

          {!isMobile && worldState && (
            <div style={{ width: panelOpen ? 0 : 320, overflow: "hidden", transition: "width 0.4s ease-out", borderLeft: panelOpen ? "none" : "1.5px solid rgba(0,255,247,0.1)", backgroundColor: "#05050f" }}>
              <div style={{ width: 320, padding: 16, overflowY: "auto", height: "100%" }}>
                <WorldStatePanel
                  topic={worldState.topic ?? topic}
                  level={worldState.level ?? '—'}
                  week={worldState.week ?? 1}
                  totalWeeks={worldState.totalWeeks ?? 8}
                  understood={worldState.understood ?? []}
                  stuck={worldState.stuck ?? []}
                  stuckModeActive={worldState.stuck_mode_active ?? false}
                  stuckModeName={worldState.stuck_mode_name ?? 'Analogy mode'}
                />

                {/* Teaching Mode */}
                {worldState && (
                  <div style={{ padding: "16px 12px 0 12px", borderTop: "1.5px solid rgba(0,255,247,0.1)", marginTop: 12 }}>
                    <p style={{ fontSize: 10, color: "#4a7a7a", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 500, marginBottom: 8 }}>
                      Teaching Mode
                    </p>
                    <div className="flex flex-col gap-1">
                      {[['analogy', 'Analogy'], ['socratic', 'Socratic'], ['code_example', 'Code Examples']].map(([mode, label]) => (
                        <button
                          key={mode}
                          onClick={() => {
                            setWorldState(prev => prev ? { ...prev, teaching_mode: mode } : null)
                            const msg = mode === 'code_example' ? 'switch to code mode' : `switch to ${mode} mode`
                            handleSend(msg)
                          }}
                          style={{
                            width: "100%", padding: "8px 12px", borderRadius: 0, border: "1px solid", textAlign: "left", fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.08s",
                            borderColor: (worldState?.teaching_mode || 'analogy') === mode ? "rgba(0,255,247,0.5)" : "rgba(0,255,247,0.08)",
                            backgroundColor: (worldState?.teaching_mode || 'analogy') === mode ? "rgba(0,255,247,0.06)" : "transparent",
                            color: (worldState?.teaching_mode || 'analogy') === mode ? "#00fff7" : "#4a7a7a",
                          }}
                          onMouseEnter={(e) => {
                            if ((worldState?.teaching_mode || 'analogy') !== mode) {
                              e.currentTarget.style.borderColor = "rgba(0,255,247,0.25)";
                              e.currentTarget.style.color = "#e0f7f7";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if ((worldState?.teaching_mode || 'analogy') !== mode) {
                              e.currentTarget.style.borderColor = "rgba(0,255,247,0.08)";
                              e.currentTarget.style.color = "#4a7a7a";
                            }
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pace */}
                {worldState && sessionState === 'adaptive' && (
                  <div style={{ padding: "16px 12px 0 12px", marginTop: 12 }}>
                    <p style={{ fontSize: 10, color: "#4a7a7a", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 500, marginBottom: 8 }}>
                      Learning Pace
                    </p>
                    <div className="flex flex-col gap-1">
                      {[['relaxed', '🐢 Relaxed'], ['normal', '⚡ Normal'], ['accelerated', '🚀 Accelerated']].map(([p, label]) => (
                        <button
                          key={p}
                          onClick={() => setPace(p)}
                          style={{
                            width: "100%", padding: "8px 12px", borderRadius: 0, border: "1px solid", textAlign: "left", fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.08s",
                            borderColor: pace === p ? "rgba(0,255,247,0.5)" : "rgba(0,255,247,0.08)",
                            backgroundColor: pace === p ? "rgba(0,255,247,0.06)" : "transparent",
                            color: pace === p ? "#00fff7" : "#4a7a7a",
                          }}
                          onMouseEnter={(e) => {
                            if (pace !== p) {
                              e.currentTarget.style.borderColor = "rgba(0,255,247,0.25)";
                              e.currentTarget.style.color = "#e0f7f7";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (pace !== p) {
                              e.currentTarget.style.borderColor = "rgba(0,255,247,0.08)";
                              e.currentTarget.style.color = "#4a7a7a";
                            }
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {isMobile && roadmap?.length > 0 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
            <button 
              onClick={() => setBottomSheetOpen(true)} 
              style={{ backgroundColor: "transparent", border: "1.5px solid #00fff7", borderRadius: 0, color: "#00fff7", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 16px", cursor: "pointer", boxShadow: "3px 3px 0 #00fff7", display: "flex", alignItems: "center", gap: 6, transition: "all 0.1s" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(0,255,247,0.08)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translate(3px,3px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.boxShadow = "3px 3px 0 #00fff7"; e.currentTarget.style.transform = "none"; }}
            >
              View Roadmap ↑
            </button>
          </div>
        )}
      </div>

      {!isMobile && roadmap?.length > 0 && (
        <button 
          onClick={() => setPanelOpen(p => !p)} 
          style={{ backgroundColor: "#0d0d1f", borderLeft: "1px solid rgba(0,255,247,0.1)", borderRight: "1px solid rgba(0,255,247,0.1)", width: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, alignSelf: "stretch", transition: "background 0.1s" }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,255,247,0.04)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#0d0d1f"}
          title={panelOpen ? 'Collapse panel' : 'Expand panel'}
        >
          {panelOpen ? <ChevronRight size={14} color="#4a7a7a" /> : <ChevronLeft size={14} color="#4a7a7a" />}
        </button>
      )}

      {!isMobile && (
        <div className="flex-shrink-0 overflow-hidden transition-all duration-400 ease-out flex" style={{ width: panelOpen ? '40%' : '0%', opacity: panelOpen ? 1 : 0 }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            {roadmap?.length > 0 && <RoadmapPanel roadmap={roadmap} currentWeek={worldState?.week || 1} onClose={() => setPanelOpen(false)} topic={topic} level={worldState?.level} />}
          </div>
          {worldState && (
            <div style={{ width: 280, borderLeft: "1.5px solid rgba(0,255,247,0.1)", backgroundColor: "#05050f", padding: 12, overflowY: "auto" }}>
              <WorldStatePanel
                topic={worldState.topic ?? topic}
                level={worldState.level ?? '—'}
                week={worldState.week ?? 1}
                totalWeeks={worldState.totalWeeks ?? 8}
                understood={worldState.understood ?? []}
                stuck={worldState.stuck ?? []}
                stuckModeActive={worldState.stuck_mode_active ?? false}
                stuckModeName={worldState.stuck_mode_name ?? 'Analogy mode'}
              />

              {/* Teaching Mode */}
              {worldState && (
                <div style={{ padding: "16px 12px 0 12px", borderTop: "1.5px solid rgba(0,255,247,0.1)", marginTop: 12 }}>
                  <p style={{ fontSize: 10, color: "#4a7a7a", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 500, marginBottom: 8 }}>
                    Teaching Mode
                  </p>
                  <div className="flex flex-col gap-1">
                    {[['analogy', 'Analogy'], ['socratic', 'Socratic'], ['code_example', 'Code Examples']].map(([mode, label]) => (
                      <button
                        key={mode}
                        onClick={() => {
                          setWorldState(prev => prev ? { ...prev, teaching_mode: mode } : null)
                          const msg = mode === 'code_example' ? 'switch to code mode' : `switch to ${mode} mode`
                          handleSend(msg)
                        }}
                        style={{
                          width: "100%", padding: "8px 12px", borderRadius: 0, border: "1px solid", textAlign: "left", fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.08s",
                          borderColor: (worldState?.teaching_mode || 'analogy') === mode ? "rgba(0,255,247,0.5)" : "rgba(0,255,247,0.08)",
                          backgroundColor: (worldState?.teaching_mode || 'analogy') === mode ? "rgba(0,255,247,0.06)" : "transparent",
                          color: (worldState?.teaching_mode || 'analogy') === mode ? "#00fff7" : "#4a7a7a",
                        }}
                        onMouseEnter={(e) => {
                          if ((worldState?.teaching_mode || 'analogy') !== mode) {
                            e.currentTarget.style.borderColor = "rgba(0,255,247,0.25)";
                            e.currentTarget.style.color = "#e0f7f7";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if ((worldState?.teaching_mode || 'analogy') !== mode) {
                            e.currentTarget.style.borderColor = "rgba(0,255,247,0.08)";
                            e.currentTarget.style.color = "#4a7a7a";
                          }
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pace */}
              {worldState && sessionState === 'adaptive' && (
                <div style={{ padding: "16px 12px 0 12px", marginTop: 12 }}>
                  <p style={{ fontSize: 10, color: "#4a7a7a", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 500, marginBottom: 8 }}>
                    Learning Pace
                  </p>
                  <div className="flex flex-col gap-1">
                    {[['relaxed', '🐢 Relaxed'], ['normal', '⚡ Normal'], ['accelerated', '🚀 Accelerated']].map(([p, label]) => (
                      <button
                        key={p}
                        onClick={() => setPace(p)}
                        style={{
                          width: "100%", padding: "8px 12px", borderRadius: 0, border: "1px solid", textAlign: "left", fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.08s",
                          borderColor: pace === p ? "rgba(0,255,247,0.5)" : "rgba(0,255,247,0.08)",
                          backgroundColor: pace === p ? "rgba(0,255,247,0.06)" : "transparent",
                          color: pace === p ? "#00fff7" : "#4a7a7a",
                        }}
                        onMouseEnter={(e) => {
                          if (pace !== p) {
                            e.currentTarget.style.borderColor = "rgba(0,255,247,0.25)";
                            e.currentTarget.style.color = "#e0f7f7";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (pace !== p) {
                            e.currentTarget.style.borderColor = "rgba(0,255,247,0.08)";
                            e.currentTarget.style.color = "#4a7a7a";
                          }
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {isMobile && (
        <BottomSheet isOpen={bottomSheetOpen} onClose={() => setBottomSheetOpen(false)}>
          {worldState && (
            <div style={{ padding: "0 16px 12px 16px" }}>
              <WorldStatePanel
                topic={worldState.topic ?? topic}
                level={worldState.level ?? '—'}
                week={worldState.week ?? 1}
                totalWeeks={worldState.totalWeeks ?? 8}
                understood={worldState.understood ?? []}
                stuck={worldState.stuck ?? []}
                stuckModeActive={worldState.stuck_mode_active ?? false}
                stuckModeName={worldState.stuck_mode_name ?? 'Analogy mode'}
              />
            </div>
          )}
          <RoadmapPanel roadmap={roadmap || []} currentWeek={worldState?.week || 1} onClose={() => setBottomSheetOpen(false)} topic={topic} level={worldState?.level} />
        </BottomSheet>
      )}

      <FloatingDock items={dockItems} />

      {showQuiz && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.85)" }}>
          <div className="w-full max-w-3xl relative" style={{ backgroundColor: "transparent" }}>
            <button 
              onClick={() => setShowQuiz(false)} 
              style={{ position: "absolute", top: -44, right: 0, backgroundColor: "#0d0d1f", border: "1.5px solid rgba(0,255,247,0.2)", borderRadius: 0, color: "#4a7a7a", padding: 6, cursor: "pointer", display: "flex", alignItems: "center", transition: "all 0.1s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ff2d6b"; e.currentTarget.style.color = "#ff2d6b"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0,255,247,0.2)"; e.currentTarget.style.color = "#4a7a7a"; }}
            >
              <X size={24} />
            </button>
            <QuizPanel sessionId={sessionId} currentWeek={worldState?.week || 1} onQuizPassed={() => setShowQuiz(false)} />
          </div>
        </div>
      )}

    </div>
  )
}