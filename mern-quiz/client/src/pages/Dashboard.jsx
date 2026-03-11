import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, LogOut, History, TrendingUp, Plus, GraduationCap, Calendar, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../lib/api.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
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

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
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
    <div className="min-h-screen p-4 md:p-8 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none" />
      <div className="max-w-7xl mx-auto relative">

        {/* Header */}
        <div className="card p-6 mb-6 border-primary/30 shadow-lg shadow-primary/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-glow">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  Welcome back, {user?.full_name || 'User'}!
                </h1>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="btn-outline flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { icon: Trophy, label: 'Quizzes Completed', value: quizHistory.length, color: 'text-blue-500', bg: 'from-blue-500/20 to-blue-600/10 border-blue-500/30' },
            { icon: Plus, label: 'Quizzes Created', value: createdQuizzes.length, color: 'text-green-500', bg: 'from-green-500/20 to-green-600/10 border-green-500/30' },
            { icon: TrendingUp, label: 'Average Score', value: avgScore, color: 'text-purple-500', bg: 'from-purple-500/20 to-purple-600/10 border-purple-500/30' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className={`card p-6 bg-gradient-to-br ${bg}`}>
              <div className="flex items-center gap-3">
                <Icon className={`w-8 h-8 ${color}`} />
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg bg-muted p-1 mb-6 w-fit">
          {[['history', 'Quiz History'], ['created', 'My Quizzes']].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === t ? 'bg-card text-foreground shadow' : 'text-muted-foreground'}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'history' && (
          <div className="card p-6 border-primary/20">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="text-xl font-bold">Your Quiz History</h2>
              <div className="flex gap-2">
                {['all', 'day', 'week', 'month'].map(p => (
                  <button key={p} onClick={() => setFilterPeriod(p)}
                    className={`px-3 py-1 rounded-md text-sm capitalize ${filterPeriod === p ? 'bg-primary text-white' : 'btn-outline'}`}>
                    {p === 'all' ? 'All' : p === 'day' ? 'Today' : p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {getFilteredHistory().length === 0 ? (
              <div className="text-center py-12">
                <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No quiz history found for this period</p>
              </div>
            ) : (
              <div className="space-y-3">
                {getFilteredHistory().map(quiz => (
                  <div key={quiz.id} className="card p-4 cursor-pointer hover:border-primary/50 transition-colors border-border"
                    onClick={() => navigate(`/results/${quiz.quiz.code}/${quiz.id}`)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{quiz.quiz.topic}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(quiz.completed_at).toLocaleDateString()}</span>
                          <span>Score: {quiz.score}</span>
                          <span>Time: {Math.floor(quiz.total_time_spent / 60)}m {quiz.total_time_spent % 60}s</span>
                        </div>
                      </div>
                      <Trophy className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'created' && (
          <div className="card p-6 border-primary/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Quizzes You Created</h2>
              <button onClick={() => navigate('/create')} className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create New Quiz
              </button>
            </div>
            {createdQuizzes.length === 0 ? (
              <div className="text-center py-12">
                <Plus className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">You haven't created any quizzes yet</p>
                <button onClick={() => navigate('/create')} className="btn-primary">Create Your First Quiz</button>
              </div>
            ) : (
              <div className="space-y-3">
                {createdQuizzes.map(quiz => (
                  <div key={quiz._id} className="card p-4 cursor-pointer hover:border-primary/50 transition-colors border-border"
                    onClick={() => navigate(`/quiz/${quiz.code}`)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{quiz.topic}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>Code: <span className="font-mono font-bold">{quiz.code}</span></span>
                          <span>{quiz.question_count} questions</span>
                          <span>{quiz.participant_count || 0} participants</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{new Date(quiz.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <button onClick={() => navigate('/create')} className="btn-primary h-20 text-lg flex items-center justify-center gap-2">
            <Plus className="w-6 h-6" /> Create New Quiz
          </button>
          <button onClick={() => navigate('/join')} className="btn-outline h-20 text-lg flex items-center justify-center gap-2">
            <GraduationCap className="w-6 h-6" /> Join a Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
