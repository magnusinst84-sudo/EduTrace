// TODO: wire to real data
import React from "react";
import ReactMarkdown from "react-markdown";

export function MessageBubble({ role, content, timestamp, stuckMode }) {
  const isUser = role === "user";
  const isModeSwitch = !isUser && content.toLowerCase().includes("switching to");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isModeSwitch ? "center" : isUser ? "flex-end" : "flex-start",
        marginBottom: 16,
        width: "100%",
      }}
    >
      {stuckMode && !isUser && !isModeSwitch && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "#00fff7",
            backgroundColor: "#12122a",
            border: "1px solid rgba(0,255,247,0.4)",
            padding: "2px 8px",
            borderRadius: 0,
            marginBottom: 4,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
          }}
        >
          {stuckMode}
        </span>
      )}
      <div
        className="message-bubble-content"
        style={
          isModeSwitch
            ? {
                width: "100%",
                padding: "8px 12px",
                borderRadius: 0,
                backgroundColor: "rgba(191,0,255,0.08)",
                border: "1px solid rgba(191,0,255,0.25)",
                color: "#bf00ff",
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                textAlign: "center",
                fontFamily: "'JetBrains Mono', monospace",
              }
            : {
                maxWidth: "80%",
                padding: "12px 16px",
                borderRadius: 0,
                backgroundColor: isUser ? "#12122a" : "rgba(255,255,255,0.06)",
                color: isUser ? "#e0f7f7" : "#e2e8f0",
                borderLeft: isUser ? "2px solid #bf00ff" : "3px solid rgba(0,255,247,0.4)",
                fontSize: 14,
                lineHeight: 1.7,
                fontFamily: "'JetBrains Mono', monospace",
              }
        }
      >
        {isUser || isModeSwitch ? content : (
          <ReactMarkdown
            components={{
              p: ({ children }) => <p style={{ margin: "4px 0" }}>{children}</p>,
              strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
              code: ({ inline, children }) =>
                inline ? (
                  <code style={{
                    backgroundColor: "rgba(0,255,247,0.08)",
                    color: "#00fff7",
                    padding: "1px 5px",
                    borderRadius: 0,
                    fontSize: 13,
                  }}>{children}</code>
                ) : (
                  <pre style={{
                    backgroundColor: "#05050f",
                    color: "#e0f7f7",
                    border: "1px solid rgba(0,255,247,0.15)",
                    padding: "10px 12px",
                    borderRadius: 0,
                    fontSize: 12.5,
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
                <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#00fff7", textDecoration: "underline" }}>
                  {children}
                </a>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        )}
      </div>
      {!isModeSwitch && (
        <span style={{ fontSize: 11, color: "#4a7a7a", marginTop: 4 }}>
          {timestamp}
        </span>
      )}
    </div>
  );
}
