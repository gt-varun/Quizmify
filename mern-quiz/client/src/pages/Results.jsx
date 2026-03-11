import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Trophy, Clock, Target, Home, Award, Users, BarChart3, Zap } from 'lucide-react';
import api from '../lib/api.js';

export default function Results() {
  const { code, participantId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [participant, setParticipant] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answerDetails, setAnswerDetails] = useState([]);
  const [quizStats, setQuizStats] = useState(null);
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const [pRes, qRes, statsRes] = await Promise.all([
        api.get(`/participants/${participantId}`),
        api.get(`/questions/${code}`),
        api.get(`/quizzes/${code}/stats`),
      ]);
      setParticipant(pRes.data);
      setQuiz(qRes.data.quiz);
      setQuestions(qRes.data.questions);
      setAnswerDetails(Array.isArray(pRes.data.answer_details) ? pRes.data.answer_details : []);
      setQuizStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const correct = answerDetails.filter(a => a.is_correct).length;
  const wrong = answerDetails.filter(a => !a.is_correct && a.user_answer).length;
  const skipped = questions.length - correct - wrong;
  const totalPossible = questions.reduce((s, q) => s + q.points, 0);
  const attempted = correct + wrong;
  const accuracy = attempted > 0 ? ((correct / attempted) * 100).toFixed(1) : '0.0';
  const totalTime = participant?.total_time_spent || 0;

  const timeOnCorrect = answerDetails.filter(a => a.is_correct).reduce((s, a) => s + a.time_spent, 0);
  const timeOnWrong = answerDetails.filter(a => !a.is_correct && a.user_answer).reduce((s, a) => s + a.time_spent, 0);
  const pct = (n) => totalTime > 0 ? ((n / totalTime) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none" />
      <div className="max-w-6xl mx-auto relative">
        <div className="card p-8 border-primary/30 shadow-lg shadow-primary/20">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-4 animate-glow">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Comprehensive Quiz Report
            </h1>
            <p className="text-2xl font-semibold">{participant?.name}</p>
            <p className="text-3xl text-primary font-bold mt-2">Score: {participant?.score}/{totalPossible} pts</p>
          </div>

          {/* I. Quiz Summary */}
          <div className="card p-6 mb-6 border-primary/20">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Award className="w-6 h-6 text-primary" /> I. Quiz Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                ['Topic', quiz?.topic || 'General Quiz'],
                ['Difficulty', quiz?.difficulty_mode || 'Medium'],
                ['Total Questions', questions.length],
                ['Total Marks', totalPossible],
                ['Total Learners', quizStats?.total_participants || 1],
                ['Time Per Question', `${quiz?.timer_per_question || 30}s`],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-lg font-semibold capitalize">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* II. Performance */}
          <div className="card p-6 mb-6 border-primary/20">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Target className="w-6 h-6 text-primary" /> II. Your Performance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {[
                ['Score', `${participant?.score}/${totalPossible}`, 'text-primary'],
                ['Accuracy', `${accuracy}%`, 'text-green-500'],
                ['Time Taken', `${Math.floor(totalTime/60)}m ${totalTime%60}s`, 'text-foreground'],
              ].map(([label, value, color]) => (
                <div key={label} className="text-center">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                ['Correct', correct, 'green'],
                ['Incorrect', wrong, 'red'],
                ['Skipped', skipped, 'yellow'],
              ].map(([label, value, color]) => (
                <div key={label} className={`text-center p-3 rounded-lg bg-${color}-500/10 border border-${color}-500/20`}>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className={`text-xl font-bold text-${color}-500`}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* III. Time Analysis */}
          <div className="card p-6 mb-6 border-primary/20">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Clock className="w-6 h-6 text-primary" /> III. Time Analysis</h2>
            {[
              ['Time on Correct', pct(timeOnCorrect), timeOnCorrect, 'bg-green-500', 'text-green-500'],
              ['Time on Incorrect', pct(timeOnWrong), timeOnWrong, 'bg-red-500', 'text-red-500'],
              ['Time on Skipped', pct(totalTime - timeOnCorrect - timeOnWrong), totalTime - timeOnCorrect - timeOnWrong, 'bg-yellow-500', 'text-yellow-500'],
            ].map(([label, pct, time, barColor, textColor]) => (
              <div key={label} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">{label}</span>
                  <span className={`text-sm font-bold ${textColor}`}>{pct}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div className={`${barColor} h-3 rounded-full`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{Math.floor(time/60)}m {time%60}s</p>
              </div>
            ))}
          </div>

          {/* IV. Peer Comparison */}
          {quizStats && quizStats.total_participants > 1 && (
            <div className="card p-6 mb-6 border-primary/20">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Users className="w-6 h-6 text-primary" /> IV. Peer Comparison</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Topper Performance</h3>
                  <p className="text-sm">Score: <span className="font-bold text-accent">{quizStats.highest_score}/{totalPossible}</span></p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Class Average</h3>
                  <p className="text-sm">Score: <span className="font-bold text-primary">{quizStats.average_score?.toFixed(1)}/{totalPossible}</span></p>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm">
                  You scored {Math.abs((participant?.score - quizStats.average_score).toFixed(1))} points
                  {participant?.score >= quizStats.average_score ? ' above' : ' below'} the class average.
                  {participant?.score === quizStats.highest_score && ' 🎉 You\'re the topper!'}
                </p>
              </div>
            </div>
          )}

          {/* Question Review */}
          <div className="card p-6 mb-6 border-primary/20">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><BarChart3 className="w-6 h-6 text-primary" /> Question Review</h2>
            <div className="space-y-3">
              {questions.map((q, i) => {
                const ans = answerDetails.find(a => a.question_id === q._id);
                return (
                  <div key={q._id} className={`p-4 rounded-lg border ${!ans ? 'border-yellow-500/30 bg-yellow-500/5' : ans.is_correct ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium">Q{i + 1}. {q.question}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ml-2 flex-shrink-0 ${q.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' : q.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                        {q.difficulty} ({q.points}pts)
                      </span>
                    </div>
                    {ans ? (
                      <>
                        <p className="text-sm">Your Answer: <span className={ans.is_correct ? 'text-green-400' : 'text-red-400'}>{ans.user_answer || '(no answer)'}</span></p>
                        {!ans.is_correct && <p className="text-sm text-green-400">Correct: {ans.correct_answer}</p>}
                        <p className="text-xs text-muted-foreground mt-1">Time: {ans.time_spent}s</p>
                      </>
                    ) : (
                      <p className="text-sm text-yellow-400">Not attempted</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button onClick={() => navigate('/')} className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-lg">
            <Home className="w-5 h-5" /> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
