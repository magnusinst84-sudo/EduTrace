import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import logo from "../assets/logo.png"
import { TextGenerateEffect } from "../components/ui/text-generate"
import { ArrowRight, BookOpen, Brain, Map, Zap, Target, TrendingUp } from "lucide-react"

export default function Hero() {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (user) navigate("/home")
  }, [user, navigate])

  const features = [
    {
      icon: <Brain size={22} color="#00fff7" />,
      title: "Adaptive Diagnostics",
      desc: "3 questions that infer your exact knowledge level before building your plan.",
    },
    {
      icon: <Map size={22} color="#00fff7" />,
      title: "Grounded Roadmaps",
      desc: "Week-by-week learning plans built from real roadmap.sh content, not hallucinations.",
    },
    {
      icon: <BookOpen size={22} color="#00fff7" />,
      title: "Stuck Mode",
      desc: "Agent detects when you're confused and automatically shifts to simpler explanations.",
    },
    {
      icon: <Zap size={22} color="#00fff7" />,
      title: "62+ Topics",
      desc: "From React to System Design, Docker to Data Structures — all grounded in real content.",
    },
    {
      icon: <Target size={22} color="#00fff7" />,
      title: "Goal Aware",
      desc: "Tailored for job prep, project building, exam study, or pure curiosity.",
    },
    {
      icon: <TrendingUp size={22} color="#00fff7" />,
      title: "Progress Tracking",
      desc: "Visual timeline of your roadmap with week-by-week completion tracking.",
    },
  ]

  const steps = [
    { num: "01", title: "Pick a topic", desc: "Type any tech topic you want to learn" },
    { num: "02", title: "Answer 3 questions", desc: "EduTrace infers your level and goal" },
    { num: "03", title: "Get your roadmap", desc: "Personalized week-by-week learning plan" },
    { num: "04", title: "Learn with AI", desc: "Chat with the agent as you progress" },
  ]

  return (
    <div style={{
      backgroundColor: "#05050f",
      backgroundImage: "radial-gradient(circle, rgba(0,255,247,0.15) 1px, transparent 1px)",
      backgroundSize: "32px 32px",
      minHeight: "100vh",
      fontFamily: "'JetBrains Mono', monospace",
      position: "relative",
      overflow: "hidden"
    }} className="scanlines">

      {/* Navbar */}
      <nav
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 32px",
          backgroundColor: "#0d0d1f",
          borderBottom: "1.5px solid rgba(0,255,247,0.15)",
        }}
      >
        <div
          onClick={() => navigate('/home')}
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        >
          <img src={logo} alt="EduTrace" style={{ height: 28, width: 28, objectFit: "contain", marginRight: 8, verticalAlign: "middle" }} />
          <span style={{ fontWeight: 700, color: "#00fff7", fontSize: 16, letterSpacing: "0.2em" }}>EDUTRACE</span>
        </div>
        <button
          onClick={() => navigate("/login")}
          style={{
            backgroundColor: "transparent",
            border: "1.5px solid rgba(0,255,247,0.3)",
            borderRadius: 0,
            color: "#00fff7",
            fontSize: 11,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "8px 16px",
            cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace",
            transition: "all 0.1s"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(0,255,247,0.1)"; e.currentTarget.style.borderColor = "#00fff7"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = "rgba(0,255,247,0.3)"; }}
        >
          Sign in
        </button>
      </nav>

      {/* Hero Content */}
      <div 
        style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "140px 24px 80px", position: "relative", zIndex: 1 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 14px",
            borderRadius: 0,
            border: "1px solid rgba(0,255,247,0.3)",
            backgroundColor: "rgba(0,255,247,0.05)",
            color: "#00fff7",
            fontSize: 10,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            marginBottom: 24
          }}
        >
          <Zap size={12} color="#00fff7" />
          Powered by Gemini API
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{ fontSize: "clamp(2.5rem, 8vw, 5.5rem)", lineHeight: 1.1, fontWeight: 700, color: "#e0f7f7", letterSpacing: "0.02em", margin: 0 }}
        >
          EDUTRACE
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{ fontSize: "clamp(1.2rem, 4vw, 2rem)", lineHeight: 1.2, fontWeight: 500, color: "#bf00ff", letterSpacing: "0.05em", marginTop: 8 }}
        >
          Learn anything. Smarter.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{ marginTop: 24, maxWidth: 500 }}
        >
          <TextGenerateEffect
            words="Type a topic. Answer 3 questions. Get a personalized week-by-week roadmap powered by Gemini."
            className="text-gray-400 text-sm leading-relaxed tracking-wide"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{ marginTop: 48, display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 20 }}
        >
          <motion.button
            onClick={() => navigate("/login")}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "16px 32px",
              backgroundColor: "transparent",
              border: "1.5px solid #00fff7",
              borderRadius: 0,
              color: "#00fff7",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: "pointer",
              boxShadow: "4px 4px 0 #00fff7",
              fontFamily: "'JetBrains Mono', monospace",
              transition: "all 0.1s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(0,255,247,0.1)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translate(4px,4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.boxShadow = "4px 4px 0 #00fff7";
              e.currentTarget.style.transform = "none";
            }}
          >
            Get Started Free
            <ArrowRight size={16} />
          </motion.button>
          <motion.button
            onClick={() => {
              document.getElementById("how-it-works")
                ?.scrollIntoView({ behavior: "smooth" })
            }}
            style={{
              padding: "16px 32px",
              backgroundColor: "transparent",
              border: "1px solid rgba(0,255,247,0.2)",
              borderRadius: 0,
              color: "#4a7a7a",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace",
              transition: "all 0.1s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(0,255,247,0.5)"; e.currentTarget.style.color = "#00fff7"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0,255,247,0.2)"; e.currentTarget.style.color = "#4a7a7a"; }}
          >
            See how it works ↓
          </motion.button>
        </motion.div>
      </div>

      {/* SECTION 2: How it works strip */}
      <div
        className="flex flex-col items-center justify-center py-20 px-6 text-center w-full"
        style={{ position: "relative", zIndex: 1 }}
      >
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.2em", color: "#00fff7", textTransform: "uppercase", marginBottom: 16 }}
        >
          How it works
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 700, color: "#e0f7f7", marginBottom: 48, maxWidth: 600, letterSpacing: "0.02em" }}
        >
          From zero to roadmap in under 2 minutes
        </motion.h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, width: "100%", maxWidth: 1000, padding: "0 16px", marginBottom: 32 }}>
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
                padding: 24,
                backgroundColor: "rgba(0,255,247,0.02)",
                border: "1px solid rgba(0,255,247,0.1)",
                borderRadius: 0,
              }}
            >
              <span style={{ fontSize: 24, fontWeight: 700, color: "rgba(0,255,247,0.3)", marginBottom: 16, fontFamily: "'JetBrains Mono', monospace" }}>
                {step.num}
              </span>
              <p style={{ color: "#e0f7f7", fontWeight: 500, fontSize: 13, marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {step.title}
              </p>
              <p style={{ color: "#4a7a7a", fontSize: 11, lineHeight: 1.6 }}>
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* SECTION 3: Features grid */}
      <div
        id="how-it-works"
        style={{
          position: "relative", padding: "80px 24px", display: "flex", flexDirection: "column", alignItems: "center", width: "100%",
          zIndex: 1
        }}
      >
        <div style={{ maxWidth: 1000, width: "100%" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: 64 }}
          >
            <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.2em", color: "#bf00ff", textTransform: "uppercase", marginBottom: 16 }}>
              Features
            </p>
            <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 700, color: "#e0f7f7", letterSpacing: "0.02em" }}>
              Everything you need to learn faster
            </h2>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, width: "100%", marginBottom: 64 }}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                style={{
                  padding: 24,
                  backgroundColor: "#0d0d1f",
                  border: "1.5px solid rgba(0,255,247,0.15)",
                  borderRadius: 0,
                  transition: "border-color 0.15s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "#00fff7"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(0,255,247,0.15)"}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 0,
                  backgroundColor: "rgba(0,255,247,0.05)",
                  border: "1px solid rgba(0,255,247,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontWeight: 500, color: "#e0f7f7", marginBottom: 8, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 12, color: "#4a7a7a", lineHeight: 1.6, margin: 0 }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, paddingTop: 48, borderTop: "1px solid rgba(0,255,247,0.1)", width: "100%" }}>
            {[
              { value: "62+", label: "Topics covered" },
              { value: "3", label: "Diagnostic questions" },
              { value: "Gemini", label: "Powered by" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.1 + 0.3 }}
                style={{ textAlign: "center" }}
              >
                <p style={{ fontSize: 28, fontWeight: 700, color: "#bf00ff", margin: 0, letterSpacing: "0.05em" }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: 10, color: "#4a7a7a", marginTop: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: Final CTA */}
      <div
        style={{
          padding: "80px 24px", textAlign: "center", borderTop: "1px solid rgba(0,255,247,0.1)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%",
          backgroundColor: "#0d0d1f",
          position: "relative",
          zIndex: 1
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: 600, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 700, color: "#e0f7f7", marginBottom: 16, letterSpacing: "0.02em" }}>
            Ready to learn smarter?
          </h2>
          <p style={{ color: "#4a7a7a", marginBottom: 32, fontSize: 13, lineHeight: 1.6 }}>
            Join EduTrace and get a personalized learning roadmap in under 2 minutes.
          </p>
          <motion.button
            onClick={() => navigate("/login")}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "16px 32px",
              backgroundColor: "transparent",
              border: "1.5px solid #bf00ff",
              borderRadius: 0,
              color: "#bf00ff",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: "pointer",
              boxShadow: "4px 4px 0 #bf00ff",
              fontFamily: "'JetBrains Mono', monospace",
              transition: "all 0.1s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(191,0,255,0.1)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translate(4px,4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.boxShadow = "4px 4px 0 #bf00ff";
              e.currentTarget.style.transform = "none";
            }}
          >
            Start for free
            <ArrowRight size={16} />
          </motion.button>
          <p style={{ color: "#4a7a7a", fontSize: 10, marginTop: 32, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Powered by Gemini API
          </p>
        </motion.div>
      </div>

    </div>
  )
}
