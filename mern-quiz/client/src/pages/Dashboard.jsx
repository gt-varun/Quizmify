import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, History, TrendingUp, Plus, GraduationCap, Calendar, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../lib/api.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [quizHistory, setQuizHistory] = useState([]);
  const [createdQuizzes, setCreatedQuizzes] = useState([]);
  const [tab, setTab] = useState('history');
  const [filterPeriod, setFilterPeriod] = useState('all');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user) fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      const [historyRes, createdRes] = await Promise.all([
        api.get('/participants/user/history'),
        api.get('/quizzes/user/created'),
      ]);
      setQuizHistory(historyRes.data);
      setCreatedQuizzes(createdRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredHistory = () => {
    if (filterPeriod === 'all') return quizHistory;
    const now = new Date();
    return quizHistory.filter(q => {
      const diff = (now - new Date(q.completed_at)) / (1000 * 60 * 60 * 24);
      if (filterPeriod === 'day') return diff <= 1;
      if (filterPeriod === 'week') return diff <= 7;
      if (filterPeriod === 'month') return diff <= 30;
      return true;
    });
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const avgScore = quizHistory.length > 0
    ? Math.round(quizHistory.reduce((s, q) => s + q.score, 0) / quizHistory.length)
    : 0;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.full_name || 'User'}
          </h1>
          <p className="text-muted-foreground mt-1">{user?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Trophy, label: 'Quizzes Completed', value: quizHistory.length, color: 'text-blue-500' },
            { icon: Plus, label: 'Quizzes Created', value: createdQuizzes.length, color: 'text-green-500' },
            { icon: TrendingUp, label: 'Average Score', value: avgScore, color: 'text-primary' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="card p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button onClick={() => navigate('/create')}
            className="card p-5 flex items-center gap-4 hover:border-primary/40 transition-all duration-200 cursor-pointer text-left group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center transition-transform group-hover:scale-105">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Create New Quiz</p>
              <p className="text-sm text-muted-foreground">Generate with AI or create manually</p>
            </div>
          </button>
          <button onClick={() => navigate('/join')}
            className="card p-5 flex items-center gap-4 hover:border-secondary/40 transition-all duration-200 cursor-pointer text-left group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center transition-transform group-hover:scale-105">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Join a Quiz</p>
              <p className="text-sm text-muted-foreground">Enter a 6-character quiz code</p>
            </div>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg bg-muted p-1 mb-6 w-fit">
          {[['history', 'Quiz History'], ['created', 'My Quizzes']].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${tab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'history' && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="text-lg font-semibold text-foreground">Your Quiz History</h2>
              <div className="flex gap-2">
                {['all', 'day', 'week', 'month'].map(p => (
                  <button key={p} onClick={() => setFilterPeriod(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                      ${filterPeriod === p ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                    {p === 'all' ? 'All' : p === 'day' ? 'Today' : p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {getFilteredHistory().length === 0 ? (
              <div className="text-center py-12">
                <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-40" />
                <p className="text-muted-foreground">No quiz history found for this period</p>
              </div>
            ) : (
              <div className="space-y-2">
                {getFilteredHistory().map(quiz => (
                  <div key={quiz.id} className="p-4 rounded-lg border border-border hover:border-primary/30 transition-all duration-200 cursor-pointer"
                    onClick={() => navigate(`/results/${quiz.quiz.code}/${quiz.id}`)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">{quiz.quiz.topic}</h3>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(quiz.completed_at).toLocaleDateString()}</span>
                          <span>Score: {quiz.score}</span>
                          <span>Time: {Math.floor(quiz.total_time_spent / 60)}m {quiz.total_time_spent % 60}s</span>
                        </div>
                      </div>
                      <div className="text-primary font-bold">{quiz.score} pts</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'created' && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Quizzes You Created</h2>
              <button onClick={() => navigate('/create')} className="btn-primary flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4" /> New Quiz
              </button>
            </div>
            {createdQuizzes.length === 0 ? (
              <div className="text-center py-12">
                <Plus className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-40" />
                <p className="text-muted-foreground mb-4">You haven't created any quizzes yet</p>
                <button onClick={() => navigate('/create')} className="btn-primary text-sm">Create Your First Quiz</button>
              </div>
            ) : (
              <div className="space-y-2">
                {createdQuizzes.map(quiz => (
                  <div key={quiz._id} className="p-4 rounded-lg border border-border hover:border-primary/30 transition-all duration-200 cursor-pointer"
                    onClick={() => navigate(`/quiz/${quiz.code}`)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">{quiz.topic}</h3>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>Code: <span className="font-mono font-bold text-primary">{quiz.code}</span></span>
                          <span>{quiz.question_count} questions</span>
                          <span>{quiz.participant_count || 0} participants</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(quiz.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
