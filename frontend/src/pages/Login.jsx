import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import { BookOpen, Mail, Eye, EyeOff } from "lucide-react";
import { auth, googleProvider } from '../firebase'
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) navigate('/home')
  }, [user, navigate])

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
      navigate('/home')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      navigate('/home')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div
      className="scanlines"
      style={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: "#05050f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div
          onClick={() => navigate('/home')}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8, cursor: "pointer" }}
        >
          <img src={logo} alt="EduTrace" style={{ height: 28, width: 28, objectFit: "contain", marginRight: 8, verticalAlign: "middle" }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: "#00fff7", letterSpacing: "0.24em" }}>EDUTRACE</span>
        </div>
        <p style={{ fontSize: 11, color: "#4a7a7a", margin: 0, letterSpacing: "0.1em" }}>AI-powered adaptive learning paths</p>
      </div>

      {/* Card */}
      <div
        style={{
          backgroundColor: "#0d0d1f",
          borderRadius: 0,
          border: "1.5px solid rgba(0,255,247,0.2)",
          boxShadow: "4px 4px 0 rgba(0,255,247,0.1)",
          padding: 32,
          width: "100%",
          maxWidth: 400,
        }}
      >
        <h2 style={{ fontSize: 13, fontWeight: 500, color: "#4a7a7a", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 24, marginTop: 0 }}>
          {isSignUp ? "Create an account" : "Sign in to EduTrace"}
        </h2>

        {error && (
          <div style={{ color: "#ff2d6b", fontSize: 12, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* Google OAuth */}
        <button
          onClick={handleGoogleLogin}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "10px 16px",
            backgroundColor: "transparent",
            border: "1.5px solid rgba(0,255,247,0.2)",
            borderRadius: 0,
            color: "#e0f7f7",
            fontSize: 12,
            cursor: "pointer",
            marginBottom: 20,
            fontFamily: "'JetBrains Mono', monospace",
            transition: "all 0.1s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#00fff7";
            e.currentTarget.style.backgroundColor = "rgba(0,255,247,0.04)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(0,255,247,0.2)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          {/* Google G icon */}
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, backgroundColor: "rgba(0,255,247,0.08)" }} />
          <span style={{ fontSize: 11, color: "#4a7a7a" }}>or</span>
          <div style={{ flex: 1, height: 1, backgroundColor: "rgba(0,255,247,0.08)" }} />
        </div>

        {/* Email */}
        <form onSubmit={handleEmailLogin}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 10, color: "#4a7a7a", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 }}>
              Email
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#4a7a7a" }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  height: 40,
                  borderRadius: 0,
                  border: "1px solid rgba(0,255,247,0.2)",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  padding: "0 12px 0 36px",
                  fontSize: 13,
                  color: "#e2e8f0",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
                onFocus={(e) => e.currentTarget.style.border = "1px solid #00fff7"}
                onBlur={(e) => e.currentTarget.style.border = "1px solid rgba(0,255,247,0.2)"}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 10, color: "#4a7a7a", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  height: 40,
                  borderRadius: 0,
                  border: "1px solid rgba(0,255,247,0.2)",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  padding: "0 40px 0 12px",
                  fontSize: 13,
                  color: "#e2e8f0",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
                onFocus={(e) => e.currentTarget.style.border = "1px solid #00fff7"}
                onBlur={(e) => e.currentTarget.style.border = "1px solid rgba(0,255,247,0.2)"}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, color: "#4a7a7a" }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              padding: "11px 16px",
              backgroundColor: "transparent",
              border: "1.5px solid #00fff7",
              borderRadius: 0,
              color: "#00fff7",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: "pointer",
              boxShadow: "3px 3px 0 #00fff7",
              transition: "all 0.08s ease",
              fontFamily: "'JetBrains Mono', monospace"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(0,255,247,0.1)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translate(3px,3px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.boxShadow = "3px 3px 0 #00fff7";
              e.currentTarget.style.transform = "none";
            }}
          >
            {isSignUp ? "Sign up" : "Sign in"}
          </button>
        </form>

        <p style={{ fontSize: 12, color: "#4a7a7a", textAlign: "center", marginTop: 16, marginBottom: 0 }}>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ color: "#00fff7", fontWeight: 500, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "'JetBrains Mono', monospace" }}
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>

      <p style={{ fontSize: 10, color: "#4a7a7a", marginTop: 24 }}>Powered by Gemini API</p>
    </div>
  );
}
