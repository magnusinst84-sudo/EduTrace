// TODO: wire to real data
import React, { useState } from "react";

export function ExampleChip({ label, onClick }) {
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
