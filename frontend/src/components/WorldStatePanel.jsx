import React from "react";
import { LevelBadge } from "./LevelBadge";
import { StuckModeBanner } from "./StuckModeBanner";

export function WorldStatePanel({ topic, level, week, totalWeeks, understood, stuck, stuckModeActive, stuckModeName }) {
  const progress = totalWeeks > 0 ? (week / totalWeeks) * 100 : 0;
  return (
    <div
      style={{
        backgroundColor: "#0d0d1f",
        borderRadius: 0,
        border: "1.5px solid rgba(0,255,247,0.15)",
        padding: 16,
        fontSize: 13,
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {stuckModeActive && <StuckModeBanner modeName={stuckModeName} />}

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: "#4a7a7a", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 500, marginBottom: 4 }}>
          Topic
        </div>
        <div style={{ fontSize: 14, fontWeight: 500, color: "#e0f7f7", marginBottom: 6 }}>{topic}</div>
        <LevelBadge level={level} />
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 10, color: "#4a7a7a", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 500 }}>
            Progress
          </span>
          <span style={{ fontSize: 11, color: "#4a7a7a" }}>Week {week} of {totalWeeks}</span>
        </div>
        <div style={{ height: 3, backgroundColor: "rgba(0,255,247,0.06)", borderRadius: 0, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, backgroundColor: "#00fff7", boxShadow: "0 0 6px #00fff7", borderRadius: 0, transition: "width 0.3s" }} />
        </div>
      </div>

      {understood && understood.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: "#4a7a7a", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 500, marginBottom: 6 }}>
            Understood
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {understood.map((c) => (
              <span key={c} style={{ padding: "2px 8px", backgroundColor: "transparent", color: "#00fff7", border: "1px solid rgba(0,255,247,0.3)", borderRadius: 0, fontSize: 11 }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {stuck && stuck.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: "#4a7a7a", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 500, marginBottom: 6 }}>
            Stuck
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {stuck.map((c) => (
              <span key={c} style={{ padding: "2px 8px", backgroundColor: "transparent", color: "#ff2d6b", border: "1px solid rgba(255,45,107,0.3)", borderRadius: 0, fontSize: 11 }}>
                {c} *
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
