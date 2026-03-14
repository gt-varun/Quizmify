import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, LogIn } from 'lucide-react';
import api from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Join() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.full_name && !name) {
      setName(user.full_name);
    }
  }, [user]);

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card p-8 border-primary/20 text-center">
          <LogIn className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-bold text-foreground mb-2">Login Required</h2>
          <p className="text-muted-foreground text-sm mb-6">
            You need to be logged in to join a quiz.
          </p>
          <Link to="/auth" state={{ from: '/join' }}
            className="btn-primary inline-flex items-center gap-2 px-6 py-3">
            <LogIn className="w-4 h-4" /> Sign In
          </Link>
        </div>
      </div>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return toast.error('Please enter both quiz code and your name');

    setLoading(true);
    try {
      const res = await api.post('/participants/join', { code, name });
      toast.success(`Welcome to the quiz, ${name}!`);
      navigate(`/play/${res.data.quizCode}/${res.data.participant._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card p-8 border-primary/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-primary mb-4">
              <LogIn className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Join Quiz</h1>
            <p className="text-muted-foreground mt-1 text-sm">Enter the quiz code to participate</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Quiz Code</label>
              <input className="input text-center text-2xl font-bold tracking-widest uppercase"
                placeholder="XXXXXX" value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                maxLength={6} disabled={loading} />
            </div>
            <div>
              <label className="label">Your Name</label>
              <input className="input" placeholder="Enter your name" value={name}
                onChange={e => setName(e.target.value)} disabled={loading} />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Joining...</> : <><LogIn className="w-5 h-5" /> Join Quiz</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
