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
      <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-xl shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Week {currentWeek} Quiz</h3>
        <p className="text-sm text-gray-600 mb-6 text-center max-w-sm">
          Test your knowledge on this week's concepts to unlock the next week.
        </p>
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        <button
          onClick={startQuiz}
          disabled={loading}
          className="px-6 py-3 !bg-indigo-600 text-white font-medium !rounded-lg hover:!bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'Generating Quiz...' : 'Start Quiz'}
        </button>
      </div>
    );
  }

  if (view === 'in-progress') {
    return (
      <div className="flex flex-col p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-6 max-h-[80vh] overflow-y-auto w-full">
        <div className="border-b border-gray-100 pb-4">
          <h3 className="text-xl font-bold text-gray-800">Week {currentWeek} Quiz</h3>
          <p className="text-sm text-gray-500">Answer all questions below.</p>
        </div>
        
        {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}

        <div className="space-y-8">
          {quizData?.questions?.map((q, index) => (
            <div key={q.id} className="space-y-3 bg-gray-50 p-5 rounded-lg border border-gray-100">
              <p className="font-medium text-gray-800 text-base">
                <span className="text-indigo-600 font-bold mr-2">{index + 1}.</span>
                {q.question}
              </p>
              
              {q.type === 'multiple_choice' && (
                <div className="space-y-2 mt-3 ml-6">
                  {q.options?.map((opt, i) => (
                    <label key={i} className="flex items-start gap-3 cursor-pointer p-2 rounded-md hover:bg-gray-100 transition-colors">
                      <input 
                        type="radio" 
                        name={q.id} 
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        className="mt-1 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 font-medium">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.type === 'short_answer' && (
                <div className="mt-3 ml-6">
                  <textarea
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-y shadow-sm"
                    rows={3}
                  />
                </div>
              )}

              {q.type === 'code' && (
                <div className="mt-3 ml-6">
                  <textarea
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder="Write your code here..."
                    className="w-full p-4 border border-gray-300 rounded-lg text-sm font-mono bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y shadow-sm"
                    rows={5}
                    spellCheck={false}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button
            onClick={submitQuiz}
            disabled={loading || Object.keys(answers).length < (quizData?.questions?.length || 0)}
            className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-colors shadow-sm"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Submitting...' : 'Submit Answers'}
          </button>
        </div>
      </div>
    );
  }

  if (view === 'results') {
    const passed = results?.passed;
    return (
      <div className="flex flex-col p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-6 max-h-[80vh] overflow-y-auto w-full">
        <div className={`flex flex-col items-center justify-center p-6 rounded-xl border ${passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} text-center`}>
          {passed ? (
            <CheckCircle className="text-green-500 mb-3" size={48} />
          ) : (
            <XCircle className="text-red-500 mb-3" size={48} />
          )}
          <h3 className={`text-2xl font-bold ${passed ? 'text-green-800' : 'text-red-800'}`}>
            {passed ? "Quiz Passed!" : "Quiz Failed"}
          </h3>
          <p className={`text-sm mt-3 font-medium max-w-lg ${passed ? 'text-green-700' : 'text-red-700'}`}>
            {results?.overall_feedback}
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 text-lg border-b border-gray-100 pb-2">Question Feedback</h4>
          {results?.per_question?.map((fb) => {
            const q = quizData?.questions?.find(question => question.id === fb.id);
            return (
              <div key={fb.id} className={`p-4 rounded-xl border shadow-sm ${fb.correct ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
                <p className="text-sm font-semibold text-gray-800 mb-2">{q?.question}</p>
                <div className="flex items-start gap-2 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                  <span className="mt-0.5 shrink-0">
                    {fb.correct ? <CheckCircle size={16} className="text-green-600" /> : <XCircle size={16} className="text-red-600" />}
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed">{fb.feedback}</p>
                </div>
              </div>
            );
          })}
        </div>

        {!passed && (
          <div className="pt-6 flex justify-center border-t border-gray-100">
            <button
              onClick={() => setView('idle')}
              className="px-6 py-2.5 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors shadow-sm"
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
