import React from "react"

export function DotBackground({ children, className = "" }) {
  return (
    <div
      className={`relative w-full ${className}`}
      style={{
        backgroundColor: "#05050f",
        backgroundImage: `radial-gradient(rgba(0,255,247,0.15) 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, #05050f 100%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
