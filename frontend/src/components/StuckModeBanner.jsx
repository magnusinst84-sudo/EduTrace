// TODO: wire to real data
import React from "react";
import { AlertTriangle } from "lucide-react";

export function StuckModeBanner({ modeName }) {
  return (
    <div
      style={{
        backgroundColor: "#FEF3C7",
        border: "1px solid #FCD34D",
        borderRadius: 8,
        padding: "8px 14px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
      }}
    >
      <AlertTriangle size={14} color="#D97706" />
      <span style={{ fontSize: 12, color: "#92400E", fontWeight: 600 }}>
        Stuck mode active — {modeName}
      </span>
    </div>
  );
}
