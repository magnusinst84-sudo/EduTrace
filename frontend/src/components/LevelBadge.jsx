// TODO: wire to real data
import React from "react";

export function LevelBadge({ level = "Beginner" }) {
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
