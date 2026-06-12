import { useState } from "react";
import {
  ArrowRight, ChevronDown, ChevronUp, Check, AlertTriangle,
  BookOpen, Clock, ExternalLink, Circle, Mail, Eye, EyeOff,
  Zap, RotateCcw, Send, Loader2
} from "lucide-react";

/* ─────────────────────────────────────────────
   DESIGN TOKENS (exact from brief)
───────────────────────────────────────────── */
// Colors used inline as Tailwind arbitrary values or style props
// Brand Primary:  #4F46E5
// Brand Light:    #EEF2FF
// Accent:         #10B981
// Dark:           #1E1B4B
// Danger:         #EF4444
// Warning:        #F59E0B
// BG:             #F9FAFB
// Surface:        #FFFFFF
// Border:         #E5E7EB
// Text Primary:   #111827
// Text Secondary: #6B7280
// Text Muted:     #9CA3AF

/* ─────────────────────────────────────────────
   LEVEL BADGE
───────────────────────────────────────────── */
function LevelBadge({ level = "Beginner" }) {
  const styles = {
    Beginner:     { bg: "#ECFDF5", color: "#065F46" },
    Intermediate: { bg: "#EEF2FF", color: "#3730A3" },
    Advanced:     { bg: "#FFF7ED", color: "#9A3412" },
  };
  const s = styles[level] || styles.Beginner;
  return (
    <span
      style={{
        backgroundColor: s.bg,
        color: s.color,
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 10px",
        borderRadius: 9999,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      {level}
    </span>
  );
}

/* ─────────────────────────────────────────────
   TOPIC INPUT
───────────────────────────────────────────── */
function TopicInput({ value, onChange, onSubmit, autoFocus }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: 56,
        borderRadius: 12,
        border: "2px solid #E5E7EB",
        backgroundColor: "#fff",
        overflow: "hidden",
        transition: "border-color 0.15s",
        maxWidth: 480,
        width: "100%",
      }}
      onFocus={(e) => e.currentTarget.style.borderColor = "#4F46E5"}
      onBlur={(e) => e.currentTarget.style.borderColor = "#E5E7EB"}
    >
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        placeholder="Type a topic to learn..."
        style={{
          flex: 1,
          height: "100%",
          border: "none",
          outline: "none",
          padding: "0 16px",
          fontSize: 14,
          color: "#111827",
          backgroundColor: "transparent",
          fontFamily: "Inter, sans-serif",
        }}
      />
      <button
        onClick={onSubmit}
        style={{
          height: "100%",
          padding: "0 20px",
          backgroundColor: "#4F46E5",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          color: "#fff",
          gap: 6,
          fontSize: 14,
          fontWeight: 500,
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#4338CA"}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#4F46E5"}
      >
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   EXAMPLE CHIP
───────────────────────────────────────────── */
function ExampleChip({ label, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={() => onClick(label)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "6px 14px",
        borderRadius: 9999,
        border: `1.5px solid ${hover ? "#4F46E5" : "#E5E7EB"}`,
        backgroundColor: hover ? "#EEF2FF" : "#fff",
        color: hover ? "#4F46E5" : "#6B7280",
        fontSize: 13,
        cursor: "pointer",
        transition: "all 0.15s",
        fontFamily: "Inter, sans-serif",
        fontWeight: 500,
      }}
    >
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────────
   MESSAGE BUBBLE
───────────────────────────────────────────── */
function MessageBubble({ role, content, timestamp, stuckMode }) {
  const isUser = role === "user";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        marginBottom: 16,
      }}
    >
      {stuckMode && !isUser && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#92400E",
            backgroundColor: "#FEF3C7",
            padding: "2px 8px",
            borderRadius: 9999,
            marginBottom: 4,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {stuckMode}
        </span>
      )}
      <div
        style={{
          maxWidth: "80%",
          padding: "10px 14px",
          borderRadius: isUser ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
          backgroundColor: isUser ? "#4F46E5" : "#EEF2FF",
          color: isUser ? "#fff" : "#1E1B4B",
          borderLeft: !isUser ? "3px solid #4F46E5" : "none",
          fontSize: 14,
          lineHeight: 1.6,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {content}
      </div>
      <span style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>
        {timestamp}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TYPING INDICATOR
───────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 16 }}>
      <div
        style={{
          padding: "10px 16px",
          borderRadius: "4px 16px 16px 16px",
          backgroundColor: "#EEF2FF",
          borderLeft: "3px solid #4F46E5",
          display: "flex",
          gap: 4,
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "#4F46E5",
              opacity: 0.7,
              animation: `edutrace-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              display: "inline-block",
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes edutrace-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ROADMAP WEEK CARD
───────────────────────────────────────────── */
function RoadmapWeekCard({ week, topic, hours, concepts, resources, status }) {
  // status: 'current' | 'completed' | 'upcoming'
  const [open, setOpen] = useState(status === "current");

  const borderColor = status === "current" ? "#4F46E5" : status === "completed" ? "#10B981" : "#E5E7EB";
  const shadow = status === "current" ? "0 2px 8px rgba(79,70,229,0.12)" : "none";

  return (
    <div
      style={{
        borderRadius: 10,
        border: `1.5px solid ${borderColor}`,
        backgroundColor: "#fff",
        marginBottom: 8,
        overflow: "hidden",
        boxShadow: shadow,
        opacity: status === "upcoming" ? 0.6 : 1,
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          {status === "completed" ? (
            <span style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Check size={12} color="#fff" strokeWidth={3} />
            </span>
          ) : (
            <span style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${status === "current" ? "#4F46E5" : "#E5E7EB"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {status === "current" && <Circle size={8} color="#4F46E5" fill="#4F46E5" />}
            </span>
          )}
          <div>
            <div style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: 1 }}>
              Week {week}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: status === "completed" ? "#6B7280" : "#111827" }}>
              {topic}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#6B7280", display: "flex", alignItems: "center", gap: 3 }}>
            <Clock size={11} /> {hours}h
          </span>
          {open ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
        </div>
      </button>

      {open && (
        <div style={{ padding: "0 14px 14px", borderTop: "1px solid #E5E7EB" }}>
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              Concepts
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {concepts.map((c) => (
                <span key={c} style={{ padding: "3px 10px", backgroundColor: "#EEF2FF", color: "#3730A3", borderRadius: 9999, fontSize: 12, fontWeight: 500 }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              Resources
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {resources.map((r) => (
                <a key={r} href="#" style={{ fontSize: 12, color: "#4F46E5", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
                >
                  <ExternalLink size={11} /> {r}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   STUCK MODE BANNER
───────────────────────────────────────────── */
function StuckModeBanner({ modeName }) {
  return (
    <div
      style={{
        backgroundColor: "#FEF3C7",
        border: "1px solid #FCD34D",
        borderRadius: 8,
        padding: "8px 14px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
      }}
    >
      <AlertTriangle size={14} color="#D97706" />
      <span style={{ fontSize: 12, color: "#92400E", fontWeight: 600 }}>
        Stuck mode active — {modeName}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   WORLD STATE PANEL
───────────────────────────────────────────── */
function WorldStatePanel({ topic, level, week, totalWeeks, understood, stuck, stuckModeActive, stuckModeName }) {
  const progress = (week / totalWeeks) * 100;
  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: 12,
        border: "1.5px solid #E5E7EB",
        padding: 16,
        fontSize: 13,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {stuckModeActive && <StuckModeBanner modeName={stuckModeName} />}

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: 4 }}>
          Topic
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 6 }}>{topic}</div>
        <LevelBadge level={level} />
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
            Progress
          </span>
          <span style={{ fontSize: 11, color: "#6B7280" }}>Week {week} of {totalWeeks}</span>
        </div>
        <div style={{ height: 6, backgroundColor: "#F3F4F6", borderRadius: 9999, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, backgroundColor: "#4F46E5", borderRadius: 9999, transition: "width 0.3s" }} />
        </div>
      </div>

      {understood.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: 6 }}>
            Understood
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {understood.map((c) => (
              <span key={c} style={{ padding: "3px 9px", backgroundColor: "#ECFDF5", color: "#065F46", borderRadius: 9999, fontSize: 11, fontWeight: 500 }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {stuck.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: 6 }}>
            Stuck
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {stuck.map((c) => (
              <span key={c} style={{ padding: "3px 9px", backgroundColor: "#FEF2F2", color: "#DC2626", borderRadius: 9999, fontSize: 11, fontWeight: 500 }}>
                {c} *
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   LOGIN PAGE
───────────────────────────────────────────── */
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F9FAFB",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BookOpen size={20} color="#fff" />
          </div>
          <span style={{ fontSize: 22, fontWeight: 700, color: "#1E1B4B", letterSpacing: "-0.02em" }}>EduTrace</span>
        </div>
        <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>AI-powered adaptive learning paths</p>
      </div>

      {/* Card */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          border: "1.5px solid #E5E7EB",
          padding: 32,
          width: "100%",
          maxWidth: 400,
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "#1E1B4B", marginBottom: 24, marginTop: 0 }}>
          Sign in to EduTrace
        </h2>

        {/* Google OAuth */}
        <button
          onClick={onLogin}
          style={{
            width: "100%",
            height: 44,
            borderRadius: 10,
            border: "1.5px solid #E5E7EB",
            backgroundColor: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontSize: 14,
            fontWeight: 500,
            color: "#111827",
            cursor: "pointer",
            marginBottom: 20,
            transition: "background 0.15s, border-color 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F9FAFB"; e.currentTarget.style.borderColor = "#9CA3AF"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.borderColor = "#E5E7EB"; }}
        >
          {/* Google G icon */}
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, backgroundColor: "#E5E7EB" }} />
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>or</span>
          <div style={{ flex: 1, height: 1, backgroundColor: "#E5E7EB" }} />
        </div>

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 5 }}>
            Email
          </label>
          <div style={{ position: "relative" }}>
            <Mail size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: "100%",
                height: 42,
                borderRadius: 8,
                border: "1.5px solid #E5E7EB",
                padding: "0 12px 0 36px",
                fontSize: 14,
                color: "#111827",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "Inter, sans-serif",
              }}
            />
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 5 }}>
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%",
                height: 42,
                borderRadius: 8,
                border: "1.5px solid #E5E7EB",
                padding: "0 40px 0 12px",
                fontSize: 14,
                color: "#111827",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "Inter, sans-serif",
              }}
            />
            <button
              onClick={() => setShowPw((s) => !s)}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, color: "#9CA3AF" }}
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <button
          onClick={onLogin}
          style={{
            width: "100%",
            height: 44,
            borderRadius: 10,
            backgroundColor: "#4F46E5",
            border: "none",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#4338CA"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#4F46E5"}
        >
          Sign in
        </button>

        <p style={{ fontSize: 12, color: "#6B7280", textAlign: "center", marginTop: 16, marginBottom: 0 }}>
          Don't have an account?{" "}
          <a href="#" style={{ color: "#4F46E5", fontWeight: 500, textDecoration: "none" }}>Sign up</a>
        </p>
      </div>

      <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 24 }}>Powered by Gemini API</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   LANDING PAGE
───────────────────────────────────────────── */
function LandingPage({ onStart }) {
  const [topic, setTopic] = useState("");
  const chips = ["React", "Machine Learning", "System Design", "Python", "Data Structures"];

  const handleSubmit = () => {
    if (topic.trim()) onStart(topic.trim());
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F9FAFB",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "Inter, sans-serif",
      }}
    >
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

      <TopicInput value={topic} onChange={setTopic} onSubmit={handleSubmit} autoFocus />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16, justifyContent: "center", maxWidth: 480 }}>
        {chips.map((c) => (
          <ExampleChip key={c} label={c} onClick={(v) => { setTopic(v); }} />
        ))}
      </div>

      <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 48 }}>Powered by Gemini API</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CHAT PAGE
───────────────────────────────────────────── */
const DEMO_MESSAGES = [
  { role: "agent", content: "Welcome! I've built your personalized learning roadmap for React. You'll go from the core concepts to building full apps over 6 weeks. Let's start with Week 1 — why React exists. Do you know anything about component-based architecture?", timestamp: "10:01 AM" },
  { role: "user", content: "I've heard of it but don't fully understand how it's different from just writing HTML.", timestamp: "10:02 AM" },
  { role: "agent", content: "Great question. In plain HTML you describe a page once — if something changes, you have to find it and rewrite it. Components let you define reusable pieces of UI that manage their own state. Think of a Like button: instead of rewriting it on every page, you write it once and drop <LikeButton /> wherever you need it.", timestamp: "10:02 AM" },
  { role: "user", content: "Oh that makes sense. So components are like custom HTML tags?", timestamp: "10:03 AM" },
  { role: "agent", content: "Exactly right — that's a sharp way to think about it. You can even nest them inside each other, pass data between them (via 'props'), and let them respond to user actions independently. You've understood the first concept of Week 1.", timestamp: "10:04 AM", stuckMode: null },
];

const DEMO_ROADMAP = [
  {
    week: 1, topic: "Why React & Component Thinking", hours: 6, status: "current",
    concepts: ["Component model", "JSX basics", "Props"],
    resources: ["React official docs — Thinking in React", "Scrimba: React basics course"],
  },
  {
    week: 2, topic: "State & Event Handling", hours: 8, status: "upcoming",
    concepts: ["useState", "Event handlers", "Controlled inputs"],
    resources: ["React docs: useState", "Josh Comeau: CSS for JS Devs (bonus)"],
  },
  {
    week: 3, topic: "Effects & Data Fetching", hours: 7, status: "upcoming",
    concepts: ["useEffect", "Fetch API", "Loading states"],
    resources: ["React docs: useEffect", "TkDodo: Practical React Query"],
  },
  {
    week: 4, topic: "Component Patterns", hours: 6, status: "upcoming",
    concepts: ["Composition", "Lifting state", "Custom hooks"],
    resources: ["Kent C. Dodds: Epic React"],
  },
];

function ChatPage({ topic }) {
  const [messages, setMessages] = useState(DEMO_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = { role: "user", content: input.trim(), timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages((m) => [...m, newMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, {
        role: "agent",
        content: "That's a good question — let me break it down for you. Every concept builds on the previous one, so taking it step by step will make things click faster.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    }, 1800);
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#F9FAFB", fontFamily: "Inter, sans-serif" }}>
      {/* Top nav */}
      <header style={{ height: 52, backgroundColor: "#fff", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BookOpen size={15} color="#fff" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#1E1B4B", letterSpacing: "-0.02em" }}>EduTrace</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, color: "#6B7280" }}>Learning: <b style={{ color: "#1E1B4B" }}>{topic}</b></span>
          <button style={{ padding: "5px 12px", borderRadius: 7, border: "1.5px solid #E5E7EB", backgroundColor: "#fff", fontSize: 12, color: "#6B7280", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            <RotateCcw size={12} /> New topic
          </button>
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left: Chat (60%) */}
        <div style={{ flex: "0 0 60%", display: "flex", flexDirection: "column", borderRight: "1px solid #E5E7EB" }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
            {messages.map((m, i) => (
              <MessageBubble key={i} role={m.role} content={m.content} timestamp={m.timestamp} stuckMode={m.stuckMode} />
            ))}
            {typing && <TypingIndicator />}
          </div>

          {/* Input bar */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid #E5E7EB", backgroundColor: "#fff", display: "flex", gap: 10, alignItems: "flex-end" }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask a question, say 'I'm stuck', or type 'next'..."
              rows={1}
              style={{
                flex: 1,
                resize: "none",
                border: "1.5px solid #E5E7EB",
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 14,
                color: "#111827",
                outline: "none",
                fontFamily: "Inter, sans-serif",
                lineHeight: 1.5,
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = "#4F46E5"}
              onBlur={(e) => e.currentTarget.style.borderColor = "#E5E7EB"}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: input.trim() ? "#4F46E5" : "#E5E7EB",
                border: "none",
                cursor: input.trim() ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.15s",
              }}
            >
              <Send size={16} color={input.trim() ? "#fff" : "#9CA3AF"} />
            </button>
          </div>
        </div>

        {/* Right: Roadmap + World State (40%) */}
        <div style={{ flex: "0 0 40%", overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* World State */}
          <WorldStatePanel
            topic={topic}
            level="Intermediate"
            week={1}
            totalWeeks={6}
            understood={["Component model", "JSX basics"]}
            stuck={["Props drilling"]}
            stuckModeActive={false}
            stuckModeName="Analogy mode"
          />

          {/* Roadmap */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
              Learning Roadmap
            </div>
            {DEMO_ROADMAP.map((w) => (
              <RoadmapWeekCard key={w.week} {...w} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   COMPONENT SHOWCASE (demo all atoms)
───────────────────────────────────────────── */
function ComponentShowcase({ onBack }) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F9FAFB", padding: 32, fontFamily: "Inter, sans-serif" }}>
      <button onClick={onBack} style={{ marginBottom: 24, fontSize: 13, color: "#4F46E5", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
        ← Back
      </button>
      <h1 style={{ fontSize: 32, fontWeight: 700, color: "#1E1B4B", marginBottom: 4, marginTop: 0, letterSpacing: "-0.02em" }}>Component Library</h1>
      <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 40, marginTop: 0 }}>All EduTrace UI components</p>

      <Section title="Level Badges">
        <div style={{ display: "flex", gap: 8 }}>
          <LevelBadge level="Beginner" />
          <LevelBadge level="Intermediate" />
          <LevelBadge level="Advanced" />
        </div>
      </Section>

      <Section title="Topic Input">
        <TopicInput value="Machine Learning" onChange={() => {}} onSubmit={() => {}} />
      </Section>

      <Section title="Example Chips">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["React", "Machine Learning", "System Design", "Python", "Data Structures"].map((c) => (
            <ExampleChip key={c} label={c} onClick={() => {}} />
          ))}
        </div>
      </Section>

      <Section title="Message Bubbles">
        <div style={{ maxWidth: 500 }}>
          <MessageBubble role="agent" content="Welcome to EduTrace! Let's start your learning journey." timestamp="10:01 AM" />
          <MessageBubble role="user" content="I'd like to learn about machine learning." timestamp="10:02 AM" />
          <MessageBubble role="agent" content="This concept involves a more hands-on approach — let me give you an analogy." timestamp="10:03 AM" stuckMode="Analogy mode" />
        </div>
      </Section>

      <Section title="Typing Indicator">
        <TypingIndicator />
      </Section>

      <Section title="Stuck Mode Banner">
        <div style={{ maxWidth: 380 }}>
          <StuckModeBanner modeName="Analogy mode" />
        </div>
      </Section>

      <Section title="Roadmap Week Cards">
        <div style={{ maxWidth: 420 }}>
          <RoadmapWeekCard week={1} topic="Component Thinking" hours={6} status="completed"
            concepts={["Component model", "JSX"]} resources={["React docs"]} />
          <RoadmapWeekCard week={2} topic="State & Events" hours={8} status="current"
            concepts={["useState", "Event handlers"]} resources={["React docs: useState", "Scrimba hooks"]} />
          <RoadmapWeekCard week={3} topic="Effects & Data Fetching" hours={7} status="upcoming"
            concepts={["useEffect", "Fetch"]} resources={["React docs: useEffect"]} />
        </div>
      </Section>

      <Section title="World State Panel">
        <div style={{ maxWidth: 320 }}>
          <WorldStatePanel
            topic="React"
            level="Intermediate"
            week={2}
            totalWeeks={6}
            understood={["Components", "JSX", "Props"]}
            stuck={["useEffect"]}
            stuckModeActive={true}
            stuckModeName="Step-by-step mode"
          />
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: "#1E1B4B", marginBottom: 14, marginTop: 0 }}>{title}</h2>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   APP SHELL / ROUTER
───────────────────────────────────────────── */
export default function App() {
  const [page, setPage] = useState("login"); // login | landing | chat | showcase
  const [topic, setTopic] = useState("React");

  if (page === "login") return <LoginPage onLogin={() => setPage("landing")} />;
  if (page === "landing") return (
    <LandingPage onStart={(t) => { setTopic(t); setPage("chat"); }} />
  );
  if (page === "showcase") return <ComponentShowcase onBack={() => setPage("landing")} />;

  return (
    <div>
      <ChatPage topic={topic} />
      {/* Dev nav */}
      <div style={{ position: "fixed", bottom: 16, left: 16, display: "flex", gap: 6, zIndex: 9999 }}>
        {[["Login", "login"], ["Landing", "landing"], ["Chat", "chat"], ["Components", "showcase"]].map(([label, p]) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            style={{
              padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: "pointer",
              backgroundColor: page === p ? "#4F46E5" : "#fff",
              color: page === p ? "#fff" : "#6B7280",
              border: `1.5px solid ${page === p ? "#4F46E5" : "#E5E7EB"}`,
              fontFamily: "Inter, sans-serif",
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
