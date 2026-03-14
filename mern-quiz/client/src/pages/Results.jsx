import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Trophy, Clock, Target, Home, Award, Users, BarChart3, LayoutDashboard } from 'lucide-react';
import api from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Results() {
  const { code, participantId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const pctFn = (n) => totalTime > 0 ? ((n / totalTime) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="card p-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Quiz Report</h1>
          <p className="text-lg font-medium text-foreground">{participant?.name}</p>
          <p className="text-3xl text-primary font-bold mt-2">{participant?.score}/{totalPossible} pts</p>
        </div>

        {/* Quiz Summary */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
            <Award className="w-5 h-5 text-primary" /> Quiz Summary
          </h2>
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
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold capitalize text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Performance */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
            <Target className="w-5 h-5 text-primary" /> Your Performance
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              ['Score', `${participant?.score}/${totalPossible}`, 'text-primary'],
              ['Accuracy', `${accuracy}%`, 'text-green-500'],
              ['Time', `${Math.floor(totalTime/60)}m ${totalTime%60}s`, 'text-foreground'],
            ].map(([label, value, color]) => (
              <div key={label} className="text-center">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-xs text-muted-foreground">Correct</p>
              <p className="text-lg font-bold text-green-500">{correct}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-muted-foreground">Incorrect</p>
              <p className="text-lg font-bold text-red-500">{wrong}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-xs text-muted-foreground">Skipped</p>
              <p className="text-lg font-bold text-yellow-500">{skipped}</p>
            </div>
          </div>
        </div>

        {/* Time Analysis */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
            <Clock className="w-5 h-5 text-primary" /> Time Analysis
          </h2>
          {[
            ['Time on Correct', pctFn(timeOnCorrect), timeOnCorrect, 'bg-green-500', 'text-green-500'],
            ['Time on Incorrect', pctFn(timeOnWrong), timeOnWrong, 'bg-red-500', 'text-red-500'],
            ['Time on Skipped', pctFn(totalTime - timeOnCorrect - timeOnWrong), totalTime - timeOnCorrect - timeOnWrong, 'bg-yellow-500', 'text-yellow-500'],
          ].map(([label, pctVal, time, barColor, textColor]) => (
            <div key={label} className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-foreground">{label}</span>
                <span className={`text-sm font-bold ${textColor}`}>{pctVal}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div className={`${barColor} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${pctVal}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{Math.floor(time/60)}m {time%60}s</p>
            </div>
          ))}
        </div>

        {/* Peer Comparison */}
        {quizStats && quizStats.total_participants > 1 && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
              <Users className="w-5 h-5 text-primary" /> Peer Comparison
            </h2>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="p-3 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-1">Topper Score</p>
                <p className="text-lg font-bold text-accent">{quizStats.highest_score}/{totalPossible}</p>
              </div>
              <div className="p-3 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-1">Class Average</p>
                <p className="text-lg font-bold text-primary">{quizStats.average_score?.toFixed(1)}/{totalPossible}</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-foreground">
                You scored {Math.abs((participant?.score - quizStats.average_score).toFixed(1))} points
                {participant?.score >= quizStats.average_score ? ' above' : ' below'} the class average.
              </p>
            </div>
          </div>
        )}

        {/* Question Review */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
            <BarChart3 className="w-5 h-5 text-primary" /> Question Review
          </h2>
          <div className="space-y-2">
            {questions.map((q, i) => {
              const ans = answerDetails.find(a => String(a.question_id) === String(q._id));
              return (
                <div key={q._id} className={`p-4 rounded-lg border ${!ans ? 'border-yellow-500/20 bg-yellow-500/5' : ans.is_correct ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-sm text-foreground">Q{i + 1}. {q.question}</p>
                    <span className={`text-xs px-2 py-0.5 rounded ml-2 flex-shrink-0 ${q.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' : q.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                      {q.difficulty} ({q.points}pts)
                    </span>
                  </div>
                  {ans ? (
                    <>
                      <p className="text-xs">Your Answer: <span className={ans.is_correct ? 'text-green-500' : 'text-red-500'}>{ans.user_answer || '(no answer)'}</span></p>
                      {!ans.is_correct && <p className="text-xs text-green-500">Correct: {ans.correct_answer}</p>}
                      <p className="text-xs text-muted-foreground mt-1">Time: {ans.time_spent}s</p>
                    </>
                  ) : (
                    <p className="text-xs text-yellow-500">Not attempted</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className={`grid gap-3 ${user ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <button onClick={() => navigate('/')} className="btn-outline py-3 flex items-center justify-center gap-2">
            <Home className="w-5 h-5" /> Back to Home
          </button>
          {user && (
            <button onClick={() => navigate('/dashboard')} className="btn-primary py-3 flex items-center justify-center gap-2">
              <LayoutDashboard className="w-5 h-5" /> Go to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
