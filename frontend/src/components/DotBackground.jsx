import React from "react"

export function DotBackground({ children, className = "" }) {
  return (
    <div
      className={`relative w-full ${className}`}
      style={{
        backgroundColor: "#0f0f1a",
        backgroundImage: `radial-gradient(#333 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      }}
    >
      {/* Radial fade overlay so dots fade toward center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, #0f0f1a 100%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
