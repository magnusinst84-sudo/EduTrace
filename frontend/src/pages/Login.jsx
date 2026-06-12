// TODO: wire to real data
import React, { useState, useEffect } from "react";
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
      style={{
        minHeight: "100vh",
        backgroundColor: "#F9FAFB",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BookOpen size={20} color="#fff" />
          </div>
          <span style={{ fontSize: 22, fontWeight: 700, color: "#1E1B4B", letterSpacing: "-0.02em" }}>EduTrace</span>
        </div>
        <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>AI-powered adaptive learning paths</p>
      </div>

      {/* Card */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          border: "1.5px solid #E5E7EB",
          padding: 32,
          width: "100%",
          maxWidth: 400,
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "#1E1B4B", marginBottom: 24, marginTop: 0 }}>
          {isSignUp ? "Create an account" : "Sign in to EduTrace"}
        </h2>

        {error && (
          <div style={{ color: "#EF4444", fontSize: 13, marginBottom: 16, fontWeight: 500 }}>
            {error}
          </div>
        )}

        {/* Google OAuth */}
        <button
          onClick={handleGoogleLogin}
          style={{
            width: "100%",
            height: 44,
            borderRadius: 10,
            border: "1.5px solid #E5E7EB",
            backgroundColor: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontSize: 14,
            fontWeight: 500,
            color: "#111827",
            cursor: "pointer",
            marginBottom: 20,
            transition: "background 0.15s, border-color 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F9FAFB"; e.currentTarget.style.borderColor = "#9CA3AF"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.borderColor = "#E5E7EB"; }}
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
          <div style={{ flex: 1, height: 1, backgroundColor: "#E5E7EB" }} />
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>or</span>
          <div style={{ flex: 1, height: 1, backgroundColor: "#E5E7EB" }} />
        </div>

        {/* Email */}
        <form onSubmit={handleEmailLogin}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 5 }}>
              Email
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  height: 42,
                  borderRadius: 8,
                  border: "1.5px solid #E5E7EB",
                  padding: "0 12px 0 36px",
                  fontSize: 14,
                  color: "#111827",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "Inter, sans-serif",
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 5 }}>
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
                  height: 42,
                  borderRadius: 8,
                  border: "1.5px solid #E5E7EB",
                  padding: "0 40px 0 12px",
                  fontSize: 14,
                  color: "#111827",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "Inter, sans-serif",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, color: "#9CA3AF" }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              height: 44,
              borderRadius: 10,
              backgroundColor: "#4F46E5",
              border: "none",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#4338CA"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#4F46E5"}
          >
            {isSignUp ? "Sign up" : "Sign in"}
          </button>
        </form>

        <p style={{ fontSize: 12, color: "#6B7280", textAlign: "center", marginTop: 16, marginBottom: 0 }}>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ color: "#4F46E5", fontWeight: 500, background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>

      <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 24 }}>Powered by Gemini API</p>
    </div>
  );
}
