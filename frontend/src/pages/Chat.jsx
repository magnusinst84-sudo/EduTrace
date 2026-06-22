import React, { useState, useEffect, useRef } from "react";
import { BookOpen, RotateCcw, Send, LogOut, X, ChevronLeft, ChevronRight, Home, MessageSquare, Map } from "lucide-react";
import { MessageBubble } from "../components/MessageBubble";
import { TypingIndicator } from "../components/TypingIndicator";
import { RoadmapWeekCard } from "../components/RoadmapWeekCard";
import { WorldStatePanel } from "../components/WorldStatePanel";
import { QuizPanel } from "../components/QuizPanel";
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

function RoadmapPanel({ roadmap, currentWeek, onClose }) {
  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <h2 className="text-sm font-semibold text-gray-800">Your Roadmap</h2>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
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
      <div className="fixed inset-0 bg-black/40 z-45" onClick={onClose} />
      <div ref={sheetRef} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl overflow-hidden shadow-2xl" style={{ height: '85vh' }}>
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
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
    <div className="flex h-screen bg-gray-50 overflow-hidden" style={{ fontFamily: "Inter, sans-serif" }}>

      <div className="flex flex-col min-w-0 transition-all duration-400 ease-out relative" style={{ flex: panelOpen && !isMobile ? '0 0 60%' : '1 1 100%' }}>

        {/* Top nav */}
        <header style={{ height: 52, backgroundColor: "#fff", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookOpen size={15} color="#fff" />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#1E1B4B", letterSpacing: "-0.02em" }}>EduTrace</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "#6B7280" }}>Learning: <b style={{ color: "#1E1B4B" }}>{topic}</b></span>

            {/* Teaching mode */}
            {worldState && (
              <select
                value={worldState?.teaching_mode || 'analogy'}
                onChange={(e) => {
                  const mode = e.target.value
                  setWorldState(prev => prev ? { ...prev, teaching_mode: mode } : null)
                  const msg = mode === 'code_example' ? 'switch to code mode' : `switch to ${mode} mode`
                  handleSend(msg)
                }}
                className="px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="analogy">Analogy</option>
                <option value="socratic">Socratic</option>
                <option value="code_example">Code Example</option>
              </select>
            )}

            {/* Pace selector */}
            {worldState && sessionState === 'adaptive' && (
              <select
                value={pace}
                onChange={(e) => setPace(e.target.value)}
                className="px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                title="Learning pace"
              >
                <option value="relaxed">🐢 Relaxed</option>
                <option value="normal">⚡ Normal</option>
                <option value="accelerated">🚀 Accelerated</option>
              </select>
            )}

            {/* Quiz button */}
            {worldState && (
              <button
                onClick={() => setShowQuiz(true)}
                className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors hidden sm:block"
              >
                Take Week {worldState?.week || 1} Quiz
              </button>
            )}

            <button onClick={() => navigate('/')} style={{ padding: "5px 12px", borderRadius: 7, border: "1.5px solid #E5E7EB", backgroundColor: "#fff", fontSize: 12, color: "#6B7280", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              <RotateCcw size={12} /> <span className="hidden sm:inline">New topic</span>
            </button>
            <button onClick={() => { logout(); navigate('/login') }} style={{ padding: "5px 12px", borderRadius: 7, border: "1.5px solid #E5E7EB", backgroundColor: "#fff", fontSize: 12, color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              <LogOut size={12} /> Logout
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
                    <p className="text-xs text-gray-400 px-2">Generating your personalized roadmap, this may take up to 30 seconds...</p>
                  )}
                </div>
              )}
            </div>

            <div style={{ padding: "12px 16px 80px 16px", borderTop: "1px solid #E5E7EB", backgroundColor: "#fff", display: "flex", gap: 10, alignItems: "flex-end" }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder="Ask a question, say 'I'm stuck', or type 'next'..."
                rows={1}
                disabled={typing || generatingRoadmap}
                style={{ flex: 1, resize: "none", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", fontSize: 14, color: "#111827", outline: "none", fontFamily: "Inter, sans-serif", lineHeight: 1.5 }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#4F46E5"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#E5E7EB"}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || typing || generatingRoadmap}
                style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: (input.trim() && !typing && !generatingRoadmap) ? "#4F46E5" : "#E5E7EB", border: "none", cursor: (input.trim() && !typing && !generatingRoadmap) ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s" }}
              >
                <Send size={16} color={input.trim() ? "#fff" : "#9CA3AF"} />
              </button>
            </div>
          </div>

          {!isMobile && worldState && (
            <div style={{ width: panelOpen ? 0 : 320, overflow: "hidden", transition: "width 0.4s ease-out", borderLeft: panelOpen ? "none" : "1px solid #E5E7EB", backgroundColor: "#F9FAFB" }}>
              <div style={{ width: 320, padding: 16 }}>
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
            </div>
          )}
        </div>

        {isMobile && roadmap?.length > 0 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
            <button onClick={() => setBottomSheetOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-full shadow-lg hover:bg-indigo-700 transition-colors">
              View Roadmap ↑
            </button>
          </div>
        )}
      </div>

      {!isMobile && roadmap?.length > 0 && (
        <button onClick={() => setPanelOpen(p => !p)} className="flex-shrink-0 w-5 self-stretch flex items-center justify-center bg-gray-100 hover:bg-gray-200 border-x border-gray-200 transition-colors z-10" title={panelOpen ? 'Collapse panel' : 'Expand panel'}>
          {panelOpen ? <ChevronRight size={14} className="text-gray-500" /> : <ChevronLeft size={14} className="text-gray-500" />}
        </button>
      )}

      {!isMobile && (
        <div className="flex-shrink-0 overflow-hidden transition-all duration-400 ease-out flex" style={{ width: panelOpen ? '40%' : '0%', opacity: panelOpen ? 1 : 0 }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            {roadmap?.length > 0 && <RoadmapPanel roadmap={roadmap} currentWeek={worldState?.week || 1} onClose={() => setPanelOpen(false)} />}
          </div>
          {worldState && (
            <div style={{ width: 280, borderLeft: "1px solid #E5E7EB", backgroundColor: "#fff", padding: 12, overflowY: "auto" }} className="border-l border-gray-100">
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
          <RoadmapPanel roadmap={roadmap || []} currentWeek={worldState?.week || 1} onClose={() => setBottomSheetOpen(false)} />
        </BottomSheet>
      )}

      <FloatingDock items={dockItems} />

      {showQuiz && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-transparent w-full max-w-3xl relative">
            <button onClick={() => setShowQuiz(false)} className="absolute -top-12 right-0 p-2 text-white hover:text-gray-200 transition-colors bg-black/20 rounded-full">
              <X size={24} />
            </button>
            <QuizPanel sessionId={sessionId} currentWeek={worldState?.week || 1} onQuizPassed={() => setShowQuiz(false)} />
          </div>
        </div>
      )}

    </div>
  )
}