// TODO: wire to real data
import React from "react";
import ReactMarkdown from "react-markdown";

export function MessageBubble({ role, content, timestamp, stuckMode }) {
  const isUser = role === "user";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        marginBottom: 16,
      }}
    >
      {stuckMode && !isUser && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#92400E",
            backgroundColor: "#FEF3C7",
            padding: "2px 8px",
            borderRadius: 9999,
            marginBottom: 4,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {stuckMode}
        </span>
      )}
      <div
        className="message-bubble-content"
        style={{
          maxWidth: "80%",
          padding: "10px 14px",
          borderRadius: isUser ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
          backgroundColor: isUser ? "#4F46E5" : "#EEF2FF",
          color: isUser ? "#fff" : "#1E1B4B",
          borderLeft: !isUser ? "3px solid #4F46E5" : "none",
          fontSize: 14,
          lineHeight: 1.6,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {isUser ? content : (
          <ReactMarkdown
            components={{
              p: ({ children }) => <p style={{ margin: "4px 0" }}>{children}</p>,
              strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
              code: ({ inline, children }) =>
                inline ? (
                  <code style={{
                    backgroundColor: isUser ? "rgba(255,255,255,0.15)" : "rgba(79,70,229,0.08)",
                    padding: "1px 5px",
                    borderRadius: 4,
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{children}</code>
                ) : (
                  <pre style={{
                    backgroundColor: isUser ? "rgba(0,0,0,0.2)" : "#1E1B4B",
                    color: "#E0E7FF",
                    padding: "10px 12px",
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontFamily: "'JetBrains Mono', monospace",
                    overflowX: "auto",
                    margin: "8px 0",
                  }}><code>{children}</code></pre>
                ),
              ul: ({ children }) => <ul style={{ paddingLeft: 18, margin: "6px 0" }}>{children}</ul>,
              ol: ({ children }) => <ol style={{ paddingLeft: 18, margin: "6px 0" }}>{children}</ol>,
              li: ({ children }) => <li style={{ marginBottom: 2 }}>{children}</li>,
              h1: ({ children }) => <h1 style={{ fontSize: 18, fontWeight: 700, margin: "8px 0 4px" }}>{children}</h1>,
              h2: ({ children }) => <h2 style={{ fontSize: 16, fontWeight: 700, margin: "8px 0 4px" }}>{children}</h2>,
              h3: ({ children }) => <h3 style={{ fontSize: 15, fontWeight: 600, margin: "6px 0 3px" }}>{children}</h3>,
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: isUser ? "#C7D2FE" : "#4F46E5", textDecoration: "underline" }}>
                  {children}
                </a>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        )}
      </div>
      <span style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>
        {timestamp}
      </span>
    </div>
  );
}
