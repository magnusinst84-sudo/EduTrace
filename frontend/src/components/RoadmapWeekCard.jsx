// TODO: wire to real data
import React, { useState } from "react";
import { ChevronDown, ChevronUp, Check, Clock, ExternalLink, Circle } from "lucide-react";
import { motion } from "framer-motion"
import { ExpandableCard } from "./ui/expandable-card"

export function RoadmapWeekCard({ week, topic, hours, concepts, resources, status, goal }) {
  // status: 'current' | 'completed' | 'upcoming'
  const [open, setOpen] = useState(status === "current");
  const [showDetails, setShowDetails] = useState(false);

  const borderColor = status === "current" ? "#4F46E5" : status === "completed" ? "#10B981" : "#E5E7EB";
  const shadow = status === "current" ? "0 2px 8px rgba(79,70,229,0.12)" : "none";

  const cardDetails = {
    title: `Week ${week} Details`,
    subtitle: topic,
    content: (
      <div className="space-y-4">
        {goal && (
          <p className="text-gray-600 text-sm leading-relaxed">{goal}</p>
        )}
        {concepts?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase 
                          tracking-wide mb-2">Topics</p>
            <div className="flex flex-wrap gap-2">
              {concepts.map((t, i) => (
                <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 
                                         text-sm rounded-full border 
                                         border-indigo-100">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
        {resources?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase 
                          tracking-wide mb-2">Resources</p>
            <div className="space-y-2">
              {resources.map((r, i) => (
                <a key={i} href={r} target="_blank" rel="noopener noreferrer"
                   className="block text-sm text-indigo-600 hover:underline 
                              truncate">
                  {r}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.15 }}
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
                <a key={r} href={r} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#4F46E5", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
                >
                  <ExternalLink size={11} /> {r}
                </a>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => setShowDetails(true)}
              style={{
                fontSize: 12,
                color: "#4F46E5",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                padding: "4px 8px",
                borderRadius: 4,
                backgroundColor: "#EEF2FF"
              }}
            >
              View Details
            </button>
          </div>
        </div>
      )}

      {showDetails && (
        <ExpandableCard card={cardDetails} onClose={() => setShowDetails(false)} />
      )}
    </motion.div>
  );
}
