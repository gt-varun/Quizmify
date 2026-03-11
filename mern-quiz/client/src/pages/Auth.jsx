import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Auth() {
  const navigate = useNavigate();
  const { user, login, register } = useAuth();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', password: '', full_name: '', age_category: '' });

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(signupForm);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 pointer-events-none" />

      <div className="w-full max-w-md p-8 relative border border-primary/30 shadow-lg shadow-primary/20 rounded-xl bg-[#1E1E32]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-4 animate-glow">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Welcome to Quizmify
          </h1>
          <p className="text-muted-foreground mt-2">Sign in or create an account</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg bg-[#12122A] p-1 mb-6 border border-[#3D3D5C]">
          {['login', 'signup'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-md text-sm font-medium capitalize transition-all ${tab === t ? 'bg-primary text-white shadow' : 'text-gray-400 hover:text-white'}`}>
              {t === 'login' ? 'Login' : 'Sign Up'}
            </button>
          ))}
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="your@email.com" value={loginForm.email}
                onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={loginForm.password}
                onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} required />
            </div>
            <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" type="text" placeholder="John Doe" value={signupForm.full_name}
                onChange={e => setSignupForm(p => ({ ...p, full_name: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="your@email.com" value={signupForm.email}
                onChange={e => setSignupForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={signupForm.password}
                onChange={e => setSignupForm(p => ({ ...p, password: e.target.value }))} required minLength={6} />
            </div>
            <div>
              <label className="label">Age Category</label>
              <select className="input" value={signupForm.age_category}
                onChange={e => setSignupForm(p => ({ ...p, age_category: e.target.value }))} required>
                <option value="">Select age category</option>
                {['under-18', '18-25', '26-35', '36-50', '50+'].map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
