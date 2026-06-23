import React, { useState } from "react";
import { ChevronDown, ChevronUp, Check, Clock, ExternalLink, Circle } from "lucide-react";
import { motion } from "framer-motion"
import { ExpandableCard } from "./ui/expandable-card"

// Resources can be either plain strings (legacy) or objects {title, url, type}
function getResourceUrl(r) {
  return typeof r === "string" ? r : r?.url ?? "#";
}
function getResourceLabel(r) {
  return typeof r === "string" ? r : (r?.title || r?.url || "Resource");
}


export function RoadmapWeekCard({ week, topic, hours, concepts, resources, status, goal }) {
  // status: 'current' | 'completed' | 'upcoming'
  const [open, setOpen] = useState(status === "current");
  const [showDetails, setShowDetails] = useState(false);

  const cardDetails = {
    title: `Week ${week} Details`,
    subtitle: topic,
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {goal && (
          <p style={{ color: "#4a7a7a", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{goal}</p>
        )}
        {concepts?.length > 0 && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 500, color: "#4a7a7a", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 8 }}>Topics</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {concepts.map((t, i) => (
                <span key={i} style={{ padding: "4px 10px", backgroundColor: "transparent", color: "#00fff7", border: "1px solid rgba(0,255,247,0.3)", borderRadius: 0, fontSize: 11 }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
        {resources?.length > 0 && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 500, color: "#4a7a7a", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 8 }}>Resources</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {resources.map((r, i) => (
                <a
                  key={i}
                  href={getResourceUrl(r)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "block", fontSize: 12, color: "#bf00ff", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#00fff7"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#bf00ff"}
                >
                  {getResourceLabel(r)}
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
      whileHover={{ x: -1, y: -1 }}
      transition={{ duration: 0.15 }}
      style={{
        borderRadius: 0,
        border: status === "current" ? "1.5px solid #00fff7" : status === "completed" ? "1.5px solid rgba(0,255,247,0.3)" : "1.5px solid rgba(0,255,247,0.08)",
        backgroundColor: "#0d0d1f",
        marginBottom: 8,
        overflow: "hidden",
        boxShadow: status === "current" ? "3px 3px 0 #00fff7" : "none",
        opacity: status === "upcoming" ? 0.5 : 1,
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
            <div style={{ width: 16, height: 16, borderRadius: 0, backgroundColor: "#00fff7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Check size={10} color="#05050f" strokeWidth={3} />
            </div>
          ) : status === "current" ? (
            <div style={{ width: 16, height: 16, borderRadius: 0, border: "2px solid #00fff7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ width: 6, height: 6, backgroundColor: "#00fff7" }} />
            </div>
          ) : (
            <div style={{ width: 16, height: 16, borderRadius: 0, border: "1px solid rgba(0,255,247,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} />
          )}
          <div>
            <div style={{ fontSize: 10, color: "#00fff7", textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 500, marginBottom: 1 }}>
              Week {week}
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: status === "completed" ? "#4a7a7a" : "#e0f7f7" }}>
              {topic}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "#4a7a7a", display: "flex", alignItems: "center", gap: 3 }}>
            <Clock size={11} /> {hours}h
          </span>
          {open ? <ChevronUp size={16} color="#4a7a7a" /> : <ChevronDown size={16} color="#4a7a7a" />}
        </div>
      </button>

      {open && (
        <div style={{ padding: "0 14px 14px", borderTop: "1px solid rgba(0,255,247,0.1)" }}>
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: "#4a7a7a", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>
              Concepts
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(concepts ?? []).map((c, i) => (
                <span key={i} style={{ padding: "2px 8px", backgroundColor: "transparent", color: "#00fff7", border: "1px solid rgba(0,255,247,0.25)", borderRadius: 0, fontSize: 11 }}>
                  {c}
                </span>
              ))}
            </div>
          </div>

          {resources?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 500, color: "#4a7a7a", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>
                Resources
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {resources.map((r, i) => (
                  <a
                    key={i}
                    href={getResourceUrl(r)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 12, color: "#bf00ff", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, borderBottom: "1px solid rgba(191,0,255,0.15)", paddingBottom: 2 }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#00fff7"; e.currentTarget.style.borderBottomColor = "rgba(0,255,247,0.3)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#bf00ff"; e.currentTarget.style.borderBottomColor = "rgba(191,0,255,0.15)"; }}
                  >
                    <ExternalLink size={11} /> {getResourceLabel(r)}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => setShowDetails(true)}
              style={{
                fontSize: 11,
                color: "#00fff7",
                background: "transparent",
                border: "1px solid rgba(0,255,247,0.3)",
                cursor: "pointer",
                padding: "4px 10px",
                borderRadius: 0,
                letterSpacing: "0.08em",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,255,247,0.08)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
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