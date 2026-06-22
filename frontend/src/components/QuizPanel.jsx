import React, { useState } from 'react';
import api from '../api/client';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export function QuizPanel({ sessionId, currentWeek, onQuizPassed }) {
  const [view, setView] = useState('idle'); // 'idle' | 'in-progress' | 'results'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);

  const startQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/api/session/${sessionId}/quiz`);
      setQuizData(res.data.quiz);
      setAnswers({});
      setView('in-progress');
    } catch (err) {
      setError(err.message || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/api/session/${sessionId}/quiz/submit`, { answers });
      setResults(res.data.result);
      setView('results');
      if (res.data.result.passed) {
        // Show success briefly, then notify parent
        setTimeout(() => {
          onQuizPassed();
        }, 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  if (view === 'idle') {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, backgroundColor: "#0d0d1f", border: "1.5px solid rgba(0,255,247,0.15)", borderRadius: 0 }}>
        <h3 style={{ fontSize: 16, fontWeight: 500, color: "#e0f7f7", marginBottom: 8 }}>Week {currentWeek} Quiz</h3>
        <p style={{ fontSize: 12, color: "#4a7a7a", marginBottom: 24, textAlign: "center" }}>
          Test your knowledge on this week's concepts to unlock the next week.
        </p>
        {error && <p style={{ color: "#ff2d6b", fontSize: 12, marginBottom: 12 }}>{error}</p>}
        <button
          onClick={startQuiz}
          disabled={loading}
          style={{
            backgroundColor: "transparent",
            border: "1.5px solid #00fff7",
            color: "#00fff7",
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "10px 24px",
            borderRadius: 0,
            cursor: "pointer",
            boxShadow: "3px 3px 0 #00fff7",
            display: "flex", alignItems: "center", gap: 8,
            opacity: loading ? 0.4 : 1,
            transition: "all 0.1s ease"
          }}
          onMouseEnter={(e) => {
            if(!loading){
              e.currentTarget.style.backgroundColor = "rgba(0,255,247,0.1)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translate(3px,3px)";
            }
          }}
          onMouseLeave={(e) => {
            if(!loading){
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.boxShadow = "3px 3px 0 #00fff7";
              e.currentTarget.style.transform = "none";
            }
          }}
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'Generating Quiz...' : 'Start Quiz'}
        </button>
      </div>
    );
  }

  if (view === 'in-progress') {
    return (
      <div style={{ display: "flex", flexDirection: "column", padding: 24, backgroundColor: "#0d0d1f", border: "1.5px solid rgba(0,255,247,0.15)", borderRadius: 0, gap: 24, maxHeight: "80vh", overflowY: "auto", width: "100%" }}>
        <div style={{ borderBottom: "1px solid rgba(0,255,247,0.1)", paddingBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 500, color: "#e0f7f7" }}>Week {currentWeek} Quiz</h3>
          <p style={{ fontSize: 12, color: "#4a7a7a" }}>Answer all questions below.</p>
        </div>
        
        {error && <div style={{ color: "#ff2d6b", fontSize: 12, backgroundColor: "rgba(255,45,107,0.06)", border: "1px solid rgba(255,45,107,0.2)", borderRadius: 0, padding: "8px 12px" }}>{error}</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {quizData?.questions?.map((q, index) => (
            <div key={q.id} style={{ backgroundColor: "#05050f", border: "1px solid rgba(0,255,247,0.08)", borderRadius: 0, padding: 16, marginBottom: 8 }}>
              <p style={{ color: "#e0f7f7", fontSize: 13, fontWeight: 500, margin: 0, marginBottom: 12 }}>
                <span style={{ color: "#00fff7", fontWeight: 500, marginRight: 8 }}>{index + 1}.</span>
                {q.question}
              </p>
              
              {q.type === 'multiple_choice' && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {q.options?.map((opt, i) => (
                    <label 
                      key={i} 
                      style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", padding: "6px 8px", color: "#e0f7f7", fontSize: 13, transition: "background-color 0.1s" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,255,247,0.04)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <input 
                        type="radio" 
                        name={q.id} 
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        style={{ marginTop: 2 }}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.type === 'short_answer' && (
                <div style={{ marginTop: 12 }}>
                  <textarea
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder="Type your answer here..."
                    style={{ width: "100%", backgroundColor: "#05050f", border: "1px solid rgba(0,255,247,0.15)", borderBottom: "1px solid #00fff7", borderRadius: 0, color: "#e0f7f7", fontSize: 13, padding: "10px 12px", outline: "none", resize: "vertical", fontFamily: "'JetBrains Mono', monospace" }}
                    rows={3}
                  />
                </div>
              )}

              {q.type === 'code' && (
                <div style={{ marginTop: 12 }}>
                  <textarea
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder="Write your code here..."
                    style={{ width: "100%", backgroundColor: "#05050f", border: "1px solid rgba(0,255,247,0.15)", borderBottom: "1px solid #00fff7", borderRadius: 0, color: "#e0f7f7", fontSize: 13, padding: "10px 12px", outline: "none", resize: "vertical", fontFamily: "'JetBrains Mono', monospace" }}
                    rows={5}
                    spellCheck={false}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid rgba(0,255,247,0.1)", paddingTop: 16, display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={submitQuiz}
            disabled={loading || Object.keys(answers).length < (quizData?.questions?.length || 0)}
            style={{
              backgroundColor: "transparent",
              border: "1.5px solid #00fff7",
              color: "#00fff7",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "10px 24px",
              borderRadius: 0,
              cursor: "pointer",
              boxShadow: "3px 3px 0 #00fff7",
              display: "flex", alignItems: "center", gap: 8,
              opacity: (loading || Object.keys(answers).length < (quizData?.questions?.length || 0)) ? 0.4 : 1,
              transition: "all 0.1s ease"
            }}
            onMouseEnter={(e) => {
              if(!loading && Object.keys(answers).length === (quizData?.questions?.length || 0)){
                e.currentTarget.style.backgroundColor = "rgba(0,255,247,0.1)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translate(3px,3px)";
              }
            }}
            onMouseLeave={(e) => {
              if(!loading && Object.keys(answers).length === (quizData?.questions?.length || 0)){
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.boxShadow = "3px 3px 0 #00fff7";
                e.currentTarget.style.transform = "none";
              }
            }}
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Submitting...' : 'SUBMIT ANSWERS'}
          </button>
        </div>
      </div>
    );
  }

  if (view === 'results') {
    const passed = results?.passed;
    return (
      <div style={{ display: "flex", flexDirection: "column", padding: 24, backgroundColor: "#0d0d1f", border: "1.5px solid rgba(0,255,247,0.15)", borderRadius: 0, gap: 24, maxHeight: "80vh", overflowY: "auto", width: "100%" }}>
        
        {passed ? (
          <div style={{ backgroundColor: "rgba(0,255,247,0.04)", border: "1px solid rgba(0,255,247,0.3)", borderRadius: 0, padding: 24, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <CheckCircle color="#00fff7" size={48} style={{ marginBottom: 12 }} />
            <h3 style={{ color: "#00fff7", fontSize: 20, fontWeight: 700, margin: 0 }}>Quiz Passed!</h3>
            <p style={{ color: "#4a7a7a", fontSize: 12, marginTop: 8 }}>{results?.overall_feedback}</p>
          </div>
        ) : (
          <div style={{ backgroundColor: "rgba(255,45,107,0.04)", border: "1px solid rgba(255,45,107,0.3)", borderRadius: 0, padding: 24, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <XCircle color="#ff2d6b" size={48} style={{ marginBottom: 12 }} />
            <h3 style={{ color: "#ff2d6b", fontSize: 20, fontWeight: 700, margin: 0 }}>Quiz Failed</h3>
            <p style={{ color: "#4a7a7a", fontSize: 12, marginTop: 8 }}>{results?.overall_feedback}</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h4 style={{ fontSize: 13, fontWeight: 500, color: "#e0f7f7", borderBottom: "1px solid rgba(0,255,247,0.1)", paddingBottom: 8, margin: 0 }}>Question Feedback</h4>
          {results?.per_question?.map((fb) => {
            const q = quizData?.questions?.find(question => question.id === fb.id);
            return (
              <div key={fb.id} style={{ border: fb.correct ? "1px solid rgba(0,255,247,0.2)" : "1px solid rgba(255,45,107,0.2)", backgroundColor: fb.correct ? "rgba(0,255,247,0.03)" : "rgba(255,45,107,0.03)", borderRadius: 0, padding: 12 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#e0f7f7", margin: 0, marginBottom: 12 }}>{q?.question}</p>
                <div style={{ backgroundColor: "#05050f", border: "1px solid rgba(0,255,247,0.06)", borderRadius: 0, padding: "10px 12px", display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ flexShrink: 0, marginTop: 2 }}>
                    {fb.correct ? <CheckCircle size={14} color="#00fff7" /> : <XCircle size={14} color="#ff2d6b" />}
                  </span>
                  <p style={{ fontSize: 12, color: "#e0f7f7", margin: 0, lineHeight: 1.6 }}>{fb.feedback}</p>
                </div>
              </div>
            );
          })}
        </div>

        {!passed && (
          <div style={{ paddingTop: 16, display: "flex", justifyContent: "center", borderTop: "1px solid rgba(0,255,247,0.1)" }}>
            <button
              onClick={() => setView('idle')}
              style={{
                backgroundColor: "transparent",
                border: "1.5px solid rgba(0,255,247,0.3)",
                color: "#4a7a7a",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "10px 24px",
                borderRadius: 0,
                cursor: "pointer",
                boxShadow: "3px 3px 0 rgba(0,255,247,0.15)",
                transition: "all 0.1s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#00fff7";
                e.currentTarget.style.color = "#00fff7";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translate(3px,3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(0,255,247,0.3)";
                e.currentTarget.style.color = "#4a7a7a";
                e.currentTarget.style.boxShadow = "3px 3px 0 rgba(0,255,247,0.15)";
                e.currentTarget.style.transform = "none";
              }}
            >
              Retake Quiz
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
}
