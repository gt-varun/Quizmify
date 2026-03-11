import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Trophy, Users, BarChart3, Home, Eye, TrendingUp, TrendingDown, Clock, Target, Award } from 'lucide-react';
import api from '../lib/api.js';

export default function HostResults() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [quizStats, setQuizStats] = useState(null);
  const [tab, setTab] = useState('leaderboard');
  const [selectedP, setSelectedP] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [quizRes, qRes, statsRes] = await Promise.all([
        api.get(`/quizzes/${code}`),
        api.get(`/questions/${code}`),
        api.get(`/quizzes/${code}/stats`),
      ]);
      setQuiz(quizRes.data.quiz);
      setParticipants(quizRes.data.participants.map(p => ({
        ...p,
        answer_details: Array.isArray(p.answer_details) ? p.answer_details : [],
      })));
      setQuestions(qRes.data.questions);
      setQuizStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const totalPossible = questions.reduce((s, q) => s + q.points, 0);
  const completed = participants.filter(p => p.completed);
  const avgScore = participants.length > 0 ? participants.reduce((s, p) => s + p.score, 0) / participants.length : 0;
  const allAnswers = participants.flatMap(p => p.answer_details);

  const questionAnalysis = questions.map(q => {
    const answers = allAnswers.filter(a => a.question_id === q._id);
    const correct = answers.filter(a => a.is_correct).length;
    const avgTime = answers.length > 0 ? Math.round(answers.reduce((s, a) => s + a.time_spent, 0) / answers.length) : 0;
    return { ...q, attempted: answers.length, correct, incorrect: answers.length - correct, accuracy: answers.length > 0 ? (correct / answers.length) * 100 : 0, avgTime };
  });

  const hardest = [...questionAnalysis].sort((a, b) => a.accuracy - b.accuracy).slice(0, 5);
  const easiest = [...questionAnalysis].sort((a, b) => b.accuracy - a.accuracy).slice(0, 5);
  const selected = participants.find(p => p._id === selectedP);

  const TABS = [['leaderboard', 'Leaderboard'], ['questions', 'Questions'], ['individual', 'Individual'], ['insights', 'Insights']];

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none" />
      <div className="max-w-7xl mx-auto relative">

        <div className="card p-6 mb-6 border-primary/30">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Host Analytics</h1>
              </div>
              <p className="text-xl">{quiz?.topic}</p>
              <p className="text-sm text-muted-foreground">Code: {quiz?.code}</p>
            </div>
            <button onClick={() => navigate('/')} className="btn-outline flex items-center gap-2"><Home className="w-4 h-4" /> Home</button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            [Users, participants.length, 'Participants', 'text-primary'],
            [Trophy, quizStats?.highest_score || 0, 'Top Score', 'text-yellow-500'],
            [Target, avgScore.toFixed(1), 'Avg Score', 'text-green-500'],
            [BarChart3, questions.length, 'Questions', 'text-accent'],
            [Clock, completed.length, 'Completed', 'text-blue-500'],
          ].map(([Icon, val, label, color]) => (
            <div key={label} className="card p-4 text-center">
              <Icon className={`w-6 h-6 mx-auto mb-2 ${color}`} />
              <p className={`text-2xl font-bold ${color}`}>{val}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg bg-muted p-1 mb-6 overflow-x-auto">
          {TABS.map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 min-w-[100px] py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${tab === t ? 'bg-card text-foreground shadow' : 'text-muted-foreground'}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'leaderboard' && (
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Rankings</h2>
            <div className="space-y-3">
              {participants.map((p, i) => (
                <div key={p._id} onClick={() => setSelectedP(p._id)}
                  className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:border-primary/50 transition-colors ${i === 0 ? 'bg-yellow-500/10 border-yellow-500/30' : i === 1 ? 'bg-gray-400/10 border-gray-400/30' : i === 2 ? 'bg-amber-600/10 border-amber-600/30' : 'border-border'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-gray-400 text-black' : i === 2 ? 'bg-amber-600 text-white' : 'bg-muted text-foreground'}`}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-sm text-muted-foreground">{p.completed ? 'Completed' : 'In Progress'} · {Math.floor(p.total_time_spent / 60)}m {p.total_time_spent % 60}s</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{p.score}</p>
                    <p className="text-sm text-muted-foreground">/{totalPossible}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'questions' && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {[['Hardest', hardest, TrendingDown, 'text-red-500', 'bg-red-500/5 border-red-500/20'],
                ['Easiest', easiest, TrendingUp, 'text-green-500', 'bg-green-500/5 border-green-500/20']].map(([label, qs, Icon, color, cls]) => (
                <div key={label} className={`card p-6 ${cls}`}>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Icon className={`w-5 h-5 ${color}`} /> {label} Questions</h3>
                  <div className="space-y-3">
                    {qs.map(q => (
                      <div key={q._id} className="p-3 card border-border">
                        <p className="text-sm font-medium mb-2 line-clamp-2">{q.question}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full"><div className="h-2 bg-current rounded-full" style={{ width: `${q.accuracy}%`, color: color.replace('text-', '') }} /></div>
                          <span className={`text-sm font-bold ${color}`}>{q.accuracy.toFixed(0)}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{q.correct}/{q.attempted} correct · Avg: {q.avgTime}s</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'individual' && (
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Select Participant</h2>
            <div className="flex flex-wrap gap-2 mb-6">
              {participants.map(p => (
                <button key={p._id} onClick={() => setSelectedP(p._id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${selectedP === p._id ? 'bg-primary text-white border-primary' : 'border-border hover:border-primary/50'}`}>
                  <Eye className="w-3 h-3" /> {p.name}
                </button>
              ))}
            </div>
            {selected && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[['Score', selected.score, 'text-primary', 'bg-primary/10 border-primary/20'],
                    ['Correct', selected.answer_details.filter(a => a.is_correct).length, 'text-green-500', 'bg-green-500/10 border-green-500/20'],
                    ['Incorrect', selected.answer_details.filter(a => !a.is_correct && a.user_answer).length, 'text-red-500', 'bg-red-500/10 border-red-500/20'],
                    ['Skipped', questions.length - selected.answer_details.length, 'text-yellow-500', 'bg-yellow-500/10 border-yellow-500/20'],
                  ].map(([label, value, color, bg]) => (
                    <div key={label} className={`card p-4 text-center ${bg}`}>
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                      <p className="text-sm text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate(`/results/${code}/${selected._id}`)} className="btn-primary w-full">
                  View Full Report for {selected.name}
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'insights' && (
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Class Insights</h2>
            <div className="space-y-4">
              {questionAnalysis.map((q, i) => (
                <div key={q._id} className="p-4 card border-border">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium">Q{i + 1}. {q.question}</p>
                    <span className={`text-xs px-2 py-0.5 rounded ml-2 ${q.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' : q.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div><p className="text-muted-foreground">Correct</p><p className="font-bold text-green-500">{q.correct}</p></div>
                    <div><p className="text-muted-foreground">Incorrect</p><p className="font-bold text-red-500">{q.incorrect}</p></div>
                    <div><p className="text-muted-foreground">Accuracy</p><p className="font-bold">{q.accuracy.toFixed(0)}%</p></div>
                    <div><p className="text-muted-foreground">Avg Time</p><p className="font-bold">{q.avgTime}s</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
