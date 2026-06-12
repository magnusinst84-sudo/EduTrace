// TODO: wire to real data
import React from "react";

export function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 16 }}>
      <div
        style={{
          padding: "10px 16px",
          borderRadius: "4px 16px 16px 16px",
          backgroundColor: "#EEF2FF",
          borderLeft: "3px solid #4F46E5",
          display: "flex",
          gap: 4,
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "#4F46E5",
              opacity: 0.7,
              animation: `edutrace-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              display: "inline-block",
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes edutrace-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
