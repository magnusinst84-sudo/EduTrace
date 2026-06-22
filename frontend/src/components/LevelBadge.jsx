import React from "react";

export function LevelBadge({ level = "Beginner" }) {
  const styles = {
    Beginner:     { bg: "#05050f", color: "#00fff7",  border: "1px solid rgba(0,255,247,0.5)"  },
    Intermediate: { bg: "#05050f", color: "#bf00ff",  border: "1px solid rgba(191,0,255,0.5)"  },
    Advanced:     { bg: "#05050f", color: "#ff2d6b",  border: "1px solid rgba(255,45,107,0.5)" },
  };
  const s = styles[level] || styles.Beginner;
  return (
    <span
      style={{
        backgroundColor: s.bg,
        color: s.color,
        border: s.border,
        fontSize: 10,
        fontWeight: 500,
        padding: "2px 10px",
        borderRadius: 0,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
      }}
    >
      {level}
    </span>
  );
}
