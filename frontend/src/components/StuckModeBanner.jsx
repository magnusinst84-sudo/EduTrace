import React from "react";
import { AlertTriangle } from "lucide-react";

export function StuckModeBanner({ modeName }) {
  return (
    <div
      style={{
        backgroundColor: "#0d0d1f",
        border: "1px solid rgba(255,45,107,0.4)",
        borderRadius: 0,
        padding: "8px 14px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
      }}
    >
      <AlertTriangle size={14} color="#ff2d6b" />
      <span style={{ fontSize: 11, color: "#ff2d6b", fontWeight: 500, letterSpacing: "0.1em" }}>
        Stuck mode active — {modeName}
      </span>
    </div>
  );
}
