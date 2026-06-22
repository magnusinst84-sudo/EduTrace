import React from "react";

export function ExampleChip({ label, onClick }) {
  return (
    <button
      onClick={() => onClick(label)}
      style={{
        padding: "4px 12px",
        backgroundColor: "transparent",
        border: "1px solid rgba(0,255,247,0.2)",
        borderRadius: 0,
        color: "#4a7a7a",
        fontSize: 12,
        fontFamily: "'JetBrains Mono', monospace",
        cursor: "pointer",
        letterSpacing: "0.06em",
        transition: "all 0.08s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#00fff7"
        e.currentTarget.style.color = "#00fff7"
        e.currentTarget.style.boxShadow = "2px 2px 0 #00fff7"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(0,255,247,0.2)"
        e.currentTarget.style.color = "#4a7a7a"
        e.currentTarget.style.boxShadow = "none"
      }}
    >
      {label}
    </button>
  )
}
