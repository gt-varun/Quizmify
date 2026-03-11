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
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-background to-accent/5 pointer-events-none" />
      <div className="w-full max-w-md p-8 rounded-xl border border-secondary/30 shadow-lg shadow-secondary/20 bg-[#1E1E32]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-accent mb-4 animate-glow">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent">Join Quiz</h1>
          <p className="text-gray-400">Enter the quiz code to participate</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label text-white">Quiz Code</label>
            <input className="w-full rounded-lg px-3 py-3 text-center text-2xl font-bold tracking-widest uppercase text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary/50 border border-[#3D3D5C] bg-[#12122A]"
              placeholder="XXXXXX" value={code} onChange={e => setCode(e.target.value.toUpperCase())}
              maxLength={6} disabled={loading} />
          </div>
          <div>
            <label className="label text-white">Your Name</label>
            <input className="w-full rounded-lg px-3 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary/50 border border-[#3D3D5C] bg-[#12122A]"
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
