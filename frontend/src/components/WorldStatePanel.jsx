// TODO: wire to real data
import React from "react";
import { LevelBadge } from "./LevelBadge";
import { StuckModeBanner } from "./StuckModeBanner";

export function WorldStatePanel({ topic, level, week, totalWeeks, understood, stuck, stuckModeActive, stuckModeName }) {
  const progress = totalWeeks > 0 ? (week / totalWeeks) * 100 : 0;
  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: 12,
        border: "1.5px solid #E5E7EB",
        padding: 16,
        fontSize: 13,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {stuckModeActive && <StuckModeBanner modeName={stuckModeName} />}

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: 4 }}>
          Topic
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 6 }}>{topic}</div>
        <LevelBadge level={level} />
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
            Progress
          </span>
          <span style={{ fontSize: 11, color: "#6B7280" }}>Week {week} of {totalWeeks}</span>
        </div>
        <div style={{ height: 6, backgroundColor: "#F3F4F6", borderRadius: 9999, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, backgroundColor: "#4F46E5", borderRadius: 9999, transition: "width 0.3s" }} />
        </div>
      </div>

      {understood && understood.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: 6 }}>
            Understood
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {understood.map((c) => (
              <span key={c} style={{ padding: "3px 9px", backgroundColor: "#ECFDF5", color: "#065F46", borderRadius: 9999, fontSize: 11, fontWeight: 500 }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {stuck && stuck.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: 6 }}>
            Stuck
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {stuck.map((c) => (
              <span key={c} style={{ padding: "3px 9px", backgroundColor: "#FEF2F2", color: "#DC2626", borderRadius: 9999, fontSize: 11, fontWeight: 500 }}>
                {c} *
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
