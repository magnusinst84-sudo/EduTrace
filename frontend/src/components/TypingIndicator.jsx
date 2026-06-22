// TODO: wire to real data
import React from "react";

export function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 16 }}>
      <div
        style={{
          padding: "10px 16px",
          borderRadius: 0,
          backgroundColor: "#0d0d1f",
          borderLeft: "2px solid #00fff7",
          display: "flex",
          gap: 4,
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 5,
              height: 5,
              borderRadius: 0,
              backgroundColor: "#00fff7",
              opacity: 0.7,
              animation: `edutrace-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              display: "inline-block",
            }}
          />
        ))}
      </div>

    </div>
  );
}
