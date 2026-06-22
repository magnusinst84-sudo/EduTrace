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
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: "#0d0d1f",
          border: "1.5px solid rgba(0,255,247,0.2)",
          borderRadius: 0,
          backdropFilter: "none",
          boxShadow: "4px 4px 0 rgba(0,255,247,0.15)",
          padding: "10px 16px"
        }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.5 }}
      >
        {items.map((item, index) => {
          const isActive = location.pathname === item.href
          return (
            <div
              key={index}
              style={{ position: "relative" }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.div
                    style={{
                      position: "absolute",
                      top: "-40px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: "#00fff7",
                      color: "#05050f",
                      borderRadius: 0,
                      fontSize: 10,
                      letterSpacing: "0.1em",
                      padding: "3px 8px",
                      whiteSpace: "nowrap",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.label}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                onClick={() => navigate(item.href)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 44,
                  height: 44,
                  borderRadius: 0,
                  position: "relative",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: isActive ? "rgba(0,255,247,0.08)" : "transparent",
                  color: isActive ? "#00fff7" : "#4a7a7a",
                }}
                whileHover={{
                  backgroundColor: "rgba(0,255,247,0.06)",
                  color: "#00fff7",
                }}
                whileTap={{ scale: 0.95 }}
              >
                {item.icon}
                {isActive && (
                  <motion.div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 12,
                      height: 2,
                      backgroundColor: "#00fff7",
                      borderRadius: 0,
                    }}
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
