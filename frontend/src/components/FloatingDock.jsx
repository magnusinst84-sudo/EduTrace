import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate, useLocation } from "react-router-dom"

export function FloatingDock({ items }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.div
        className="flex items-center gap-2 px-4 py-3 rounded-2xl 
                   border border-white/10 shadow-2xl"
        style={{ backgroundColor: "rgba(15,15,26,0.85)",
                 backdropFilter: "blur(12px)" }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, 
                      delay: 0.5 }}
      >
        {items.map((item, index) => {
          const isActive = location.pathname === item.href
          return (
            <div
              key={index}
              className="relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip */}
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.div
                    className="absolute -top-10 left-1/2 -translate-x-1/2 
                               px-2 py-1 rounded-lg text-xs font-medium 
                               text-white whitespace-nowrap"
                    style={{ backgroundColor: "rgba(99,102,241,0.9)" }}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.label}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Button */}
              <motion.button
                onClick={() => navigate(item.href)}
                className="flex items-center justify-center w-11 h-11 
                           rounded-xl transition-colors relative"
                style={{
                  backgroundColor: isActive
                    ? "rgba(99,102,241,0.3)"
                    : "transparent",
                  color: isActive ? "#a5b4fc" : "#6b7280",
                }}
                whileHover={{
                  scale: 1.2,
                  backgroundColor: "rgba(99,102,241,0.2)",
                  color: "#a5b4fc",
                }}
                whileTap={{ scale: 0.95 }}
              >
                {item.icon}
                {isActive && (
                  <motion.div
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 
                               w-1 h-1 rounded-full bg-indigo-400"
                    layoutId="dock-indicator"
                  />
                )}
              </motion.button>
            </div>
          )
        })}
      </motion.div>
    </div>
  )
}
