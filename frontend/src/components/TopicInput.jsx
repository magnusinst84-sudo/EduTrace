// TODO: wire to real data
import React from "react";
import { ArrowRight } from "lucide-react";

export function TopicInput({ value, onChange, onSubmit, autoFocus }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: 48,
        borderRadius: 0,
        border: "1.5px solid rgba(0,255,247,0.15)",
        borderBottom: "1.5px solid #00fff7",
        backgroundColor: "#05050f",
        overflow: "hidden",
        transition: "border-color 0.15s",
        maxWidth: 480,
        width: "100%",
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = "#00fff7"; e.currentTarget.style.borderBottomColor = "#00fff7"; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(0,255,247,0.15)"; e.currentTarget.style.borderBottomColor = "#00fff7"; }}
    >
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        placeholder="Type a topic to learn..."
        className="placeholder-[#4a7a7a]"
        style={{
          flex: 1,
          height: "100%",
          border: "none",
          outline: "none",
          padding: "0 16px",
          fontSize: 13,
          color: "#e0f7f7",
          backgroundColor: "transparent",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      />
      <button
        onClick={onSubmit}
        style={{
          height: "100%",
          padding: "0 18px",
          backgroundColor: "transparent",
          border: "none",
          borderLeft: "1.5px solid rgba(0,255,247,0.3)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          color: "#00fff7",
          gap: 6,
          fontSize: 14,
          fontWeight: 500,
          transition: "background 0.1s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,255,247,0.1)"}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
      >
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
