import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { TextGenerateEffect } from "../components/ui/text-generate"
import { Vortex } from "../components/ui/vortex"
import { ArrowRight, BookOpen, Brain, Map, Zap, 
         Target, TrendingUp } from "lucide-react"

export default function Hero() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [particleCount, setParticleCount] = useState(
    typeof window !== "undefined" && window.innerWidth < 768 ? 150 : 400
  )

  useEffect(() => {
    const handleResize = () => {
      setParticleCount(window.innerWidth < 768 ? 150 : 400)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (user) navigate("/home")
  }, [user, navigate])

  const features = [
    {
      icon: <Brain size={22} className="text-indigo-400" />,
      title: "Adaptive Diagnostics",
      desc: "3 questions that infer your exact knowledge level before building your plan.",
    },
    {
      icon: <Map size={22} className="text-indigo-400" />,
      title: "Grounded Roadmaps",
      desc: "Week-by-week learning plans built from real roadmap.sh content, not hallucinations.",
    },
    {
      icon: <BookOpen size={22} className="text-indigo-400" />,
      title: "Stuck Mode",
      desc: "Agent detects when you're confused and automatically shifts to simpler explanations.",
    },
    {
      icon: <Zap size={22} className="text-indigo-400" />,
      title: "62+ Topics",
      desc: "From React to System Design, Docker to Data Structures — all grounded in real content.",
    },
    {
      icon: <Target size={22} className="text-indigo-400" />,
      title: "Goal Aware",
      desc: "Tailored for job prep, project building, exam study, or pure curiosity.",
    },
    {
      icon: <TrendingUp size={22} className="text-indigo-400" />,
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
    <div style={{ backgroundColor: "#0f0f1a", minHeight: "100vh" }}>

      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center 
                   justify-between px-8 py-4 border-b border-white/5"
        style={{
          backgroundColor: "rgba(15,15,26,0.85)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center 
                          justify-center">
            <Brain size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">EduTrace</span>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 text-sm font-medium text-indigo-300 
                     border border-indigo-500/30 rounded-lg 
                     hover:bg-indigo-500/10 transition-colors cursor-pointer"
        >
          Sign in
        </button>
      </nav>

      <div 
        className="flex flex-col items-center justify-center 
                   text-center px-6 pt-32 pb-16"
        style={{ backgroundColor: "#0f0f1a" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 
                     rounded-full border border-indigo-500/30 
                     text-indigo-300 text-xs font-medium mb-6"
          style={{ backgroundColor: "rgba(99,102,241,0.1)" }}
        >
          <Zap size={12} />
          Powered by Gemini API
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="font-bold text-white"
          style={{ fontSize: "clamp(2.5rem, 8vw, 5.5rem)", lineHeight: 1.1 }}
        >
          EduTrace
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="font-bold text-indigo-400 mt-2"
          style={{ fontSize: "clamp(1.5rem, 5vw, 2.75rem)", lineHeight: 1.2 }}
        >
          Learn anything. Smarter.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-5 max-w-lg"
        >
          <TextGenerateEffect
            words="Type a topic. Answer 3 questions. Get a personalized week-by-week roadmap powered by Gemini."
            className="text-gray-400 text-base leading-relaxed"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <motion.button
            onClick={() => navigate("/login")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-10 py-4 bg-indigo-600 
                       hover:bg-indigo-500 text-white font-semibold 
                       rounded-xl transition-colors shadow-lg 
                       shadow-indigo-500/25 text-base cursor-pointer"
          >
            Get Started Free
            <ArrowRight size={20} />
          </motion.button>
          <motion.button
            onClick={() => {
              document.getElementById("how-it-works")
                ?.scrollIntoView({ behavior: "smooth" })
            }}
            whileHover={{ scale: 1.02 }}
            className="px-8 py-4 text-gray-300 hover:text-white 
                       border border-white/10 hover:border-white/20
                       rounded-xl transition-colors text-base font-medium cursor-pointer"
          >
            See how it works ↓
          </motion.button>
        </motion.div>
      </div>

      {/* SECTION 2: Vortex CTA strip */}
      <Vortex
        containerClassName="w-full"
        className="flex flex-col items-center justify-center 
                   py-20 px-6 text-center"
        backgroundColor="#0a0a14"
        baseHue={240}
        particleCount={particleCount}
        rangeSpeed={1.2}
      >
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs font-semibold tracking-widest text-indigo-400 
                     uppercase mb-4"
        >
          How it works
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl font-bold text-white mb-12 max-w-lg"
        >
          From zero to roadmap in under 2 minutes
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full px-4 mb-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex flex-col items-center text-center p-4 
                         rounded-2xl border border-white/10"
              style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
            >
              <span className="text-2xl font-black text-indigo-500/40 mb-3">
                {step.num}
              </span>
              <p className="text-white font-semibold text-sm mb-1">
                {step.title}
              </p>
              <p className="text-gray-500 text-xs leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </Vortex>

      {/* SECTION 3: Features grid — dot background */}
      <div
        id="how-it-works"
        className="relative pt-16 pb-24 px-6 flex flex-col items-center justify-center w-full"
        style={{
          backgroundImage: "radial-gradient(#2a2a3e 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          backgroundColor: "#0f0f1a",
        }}
      >
        <div className="max-w-5xl w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <p className="text-xs font-semibold tracking-widest text-indigo-400 
                          uppercase mb-3">
              Features
            </p>
            <h2 className="text-3xl font-bold text-white">
              Everything you need to learn faster
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full mb-12">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className="p-6 rounded-2xl border border-white/10 
                           hover:border-indigo-500/30 transition-all 
                           cursor-default"
                style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 
                                flex items-center justify-center mb-4 
                                border border-indigo-500/20">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-white mb-2 text-sm">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-0 pt-10 
                          border-t border-white/5 w-full">
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
                className="text-center"
              >
                <p className="text-2xl font-bold text-indigo-400">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-600 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: Final CTA */}
      <div
        className="pt-20 pb-16 px-6 text-center border-t border-white/5 flex flex-col items-center justify-center w-full"
        style={{ backgroundColor: "#0a0a14" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl w-full mx-auto flex flex-col items-center justify-center"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to learn smarter?
          </h2>
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">
            Join EduTrace and get a personalized learning roadmap 
            in under 2 minutes.
          </p>
          <motion.button
            onClick={() => navigate("/login")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-8 py-4 
                       bg-indigo-600 hover:bg-indigo-500 text-white 
                       font-bold rounded-xl transition-colors shadow-lg 
                       shadow-indigo-500/30 text-sm cursor-pointer"
          >
            Start for free
            <ArrowRight size={16} />
          </motion.button>
          <p className="text-gray-700 text-xs mt-6">
            Powered by Gemini API
          </p>
        </motion.div>
      </div>

    </div>
  )
}
