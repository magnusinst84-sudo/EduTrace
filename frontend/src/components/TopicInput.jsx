// TODO: wire to real data
import React from "react";
import { ArrowRight } from "lucide-react";

export function TopicInput({ value, onChange, onSubmit, autoFocus }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: 56,
        borderRadius: 12,
        border: "2px solid #E5E7EB",
        backgroundColor: "#fff",
        overflow: "hidden",
        transition: "border-color 0.15s",
        maxWidth: 480,
        width: "100%",
      }}
      onFocus={(e) => e.currentTarget.style.borderColor = "#4F46E5"}
      onBlur={(e) => e.currentTarget.style.borderColor = "#E5E7EB"}
    >
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        placeholder="Type a topic to learn..."
        style={{
          flex: 1,
          height: "100%",
          border: "none",
          outline: "none",
          padding: "0 16px",
          fontSize: 14,
          color: "#111827",
          backgroundColor: "transparent",
          fontFamily: "Inter, sans-serif",
        }}
      />
      <button
        onClick={onSubmit}
        style={{
          height: "100%",
          padding: "0 20px",
          backgroundColor: "#4F46E5",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          color: "#fff",
          gap: 6,
          fontSize: 14,
          fontWeight: 500,
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#4338CA"}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#4F46E5"}
      >
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
