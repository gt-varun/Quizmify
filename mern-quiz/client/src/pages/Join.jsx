import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, LogIn } from 'lucide-react';
import api from '../lib/api.js';

export default function Join() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ backgroundColor: '#0F0F1A' }}>
      <div className="w-full max-w-md p-8 rounded-xl border border-purple-500/40 shadow-2xl" style={{ backgroundColor: '#252545' }}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-accent mb-4 animate-glow">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent">Join Quiz</h1>
          <p className="text-gray-400">Enter the quiz code to participate</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-1">Quiz Code</label>
            <input
              style={{ backgroundColor: '#161630', borderColor: '#4B4B7A', color: '#ffffff' }}
              className="w-full rounded-lg px-3 py-3 text-center text-2xl font-bold tracking-widest uppercase placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 border"
              placeholder="XXXXXX" value={code} onChange={e => setCode(e.target.value.toUpperCase())}
              maxLength={6} disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">Your Name</label>
            <input
              style={{ backgroundColor: '#161630', borderColor: '#4B4B7A', color: '#ffffff' }}
              className="w-full rounded-lg px-3 py-3 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 border"
              placeholder="Enter your name" value={name}
              onChange={e => setName(e.target.value)} disabled={loading} />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-4 text-lg flex items-center justify-center gap-2 bg-gradient-to-r from-secondary to-accent text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Joining...</> : <><LogIn className="w-5 h-5" /> Join Quiz</>}
          </button>
        </form>
      </div>
    </div>
  );
}
