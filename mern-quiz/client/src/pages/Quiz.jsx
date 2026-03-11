import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Users, Clock, Copy, CheckCircle } from 'lucide-react';
import api from '../lib/api.js';

export default function Quiz() {
  const { code } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!quiz) return <div className="min-h-screen flex items-center justify-center"><div className="card p-8 text-center"><h2 className="text-2xl font-bold text-destructive">Quiz Not Found</h2></div></div>;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="card p-6 md:p-8 border-primary/30 shadow-lg shadow-primary/20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {quiz.topic}
              </h1>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm border border-primary/30">
                  {quiz.question_count} Questions
                </span>
                <span className="px-3 py-1 rounded-full bg-secondary/20 text-secondary text-sm border border-secondary/30 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {new Date(quiz.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Quiz Code</p>
                <div className="text-4xl font-bold tracking-wider bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-mono">
                  {quiz.code}
                </div>
              </div>
              <button onClick={copyCode} className="btn-outline p-2">
                {copied ? <CheckCircle className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="card p-6 md:p-8 border-secondary/30 shadow-lg shadow-secondary/20">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-6 h-6 text-secondary" />
            <h2 className="text-2xl font-bold">Participants ({participants.length})</h2>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse ml-2" title="Live" />
          </div>

          {participants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No participants yet. Share the code to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {participants.map((p, i) => (
                <div key={p._id} className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-secondary/20 hover:border-secondary/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center font-bold text-white">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-sm text-muted-foreground">Joined {new Date(p.joined_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{p.score}</p>
                    {p.completed && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">Completed</span>}
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
