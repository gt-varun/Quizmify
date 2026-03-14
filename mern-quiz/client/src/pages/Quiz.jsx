import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Users, Clock, Copy, CheckCircle, BarChart3 } from 'lucide-react';
import api from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Quiz() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchQuiz = async () => {
    try {
      const res = await api.get(`/quizzes/${code}`);
      setQuiz(res.data.quiz);
      setParticipants(res.data.participants);
    } catch (err) {
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
    const interval = setInterval(fetchQuiz, 3000);
    return () => clearInterval(interval);
  }, [code]);

  const copyCode = () => {
    navigator.clipboard.writeText(quiz?.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Quiz code copied!');
  };

  const isHost = user && quiz?.created_by === user.id;
  const quizStatus = quiz?.status || 'open';

  const toggleStatus = async () => {
    setStatusLoading(true);
    try {
      const newStatus = quizStatus === 'open' ? 'closed' : 'open';
      await api.patch(`/quizzes/${code}/status`, { status: newStatus });
      setQuiz(prev => ({ ...prev, status: newStatus }));
      toast.success(`Quiz is now ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!quiz) return <div className="min-h-screen flex items-center justify-center"><div className="card p-8 text-center"><h2 className="text-xl font-bold text-destructive">Quiz Not Found</h2></div></div>;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Quiz Info */}
        <div className="card p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{quiz.topic}</h1>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                  {quiz.question_count} Questions
                </span>
                <span className="px-3 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {quiz.timer_per_question}s per question
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Quiz Code</p>
                <div className="text-3xl font-bold tracking-wider text-primary font-mono">{quiz.code}</div>
              </div>
              <button onClick={copyCode} className="btn-outline p-2.5 rounded-lg">
                {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {isHost && (
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  quizStatus === 'open'
                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {quizStatus === 'open' ? 'Open' : 'Closed'}
                </span>
                <button onClick={toggleStatus} disabled={statusLoading}
                  className={`w-11 h-6 rounded-full transition-colors ${quizStatus === 'open' ? 'bg-green-500' : 'bg-muted'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full mx-1 transition-transform ${quizStatus === 'open' ? 'translate-x-5' : ''}`} />
                </button>
                <span className="text-xs text-muted-foreground">
                  {quizStatus === 'open' ? 'Accepting participants' : 'Not accepting participants'}
                </span>
              </div>
              <button onClick={() => navigate(`/host-results/${code}`)}
                className="btn-primary flex items-center gap-2 text-sm">
                <BarChart3 className="w-4 h-4" /> View Host Analytics
              </button>
            </div>
          )}
        </div>

        {/* Participants */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Participants ({participants.length})</h2>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse ml-1" title="Live" />
          </div>

          {quizStatus === 'closed' && !isHost && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center mb-4">
              This quiz is currently closed and not accepting new participants.
            </div>
          )}

          {participants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="text-muted-foreground text-sm">No participants yet. Share the code to get started!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {participants.map((p, i) => (
                <div key={p._id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/20 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">Joined {new Date(p.joined_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{p.score}</p>
                    {p.completed && <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">Done</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
