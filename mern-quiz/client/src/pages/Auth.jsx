import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, GraduationCap, ArrowLeft, Mail, KeyRound, ShieldCheck } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../lib/api.js';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, register, googleLogin } = useAuth();
  const from = location.state?.from || '/dashboard';

  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('auth'); // 'auth' or 'forgot'
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotLoading, setForgotLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', password: '', full_name: '', age_category: '' });
  const [forgotForm, setForgotForm] = useState({ email: '', otp: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (user) navigate(from);
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      toast.success('Welcome back!');
      navigate(from);
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
      navigate(from);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotEmail = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: forgotForm.email });
      toast.success('OTP sent to your email!');
      setForgotStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await api.post('/auth/verify-otp', { email: forgotForm.email, otp: forgotForm.otp });
      toast.success('OTP verified!');
      setForgotStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (forgotForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (forgotForm.newPassword !== forgotForm.confirmPassword) return toast.error('Passwords do not match');
    setForgotLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email: forgotForm.email,
        otp: forgotForm.otp,
        newPassword: forgotForm.newPassword,
      });
      toast.success('Password reset successfully! Please login.');
      setView('auth');
      setTab('login');
      setForgotStep(1);
      setForgotForm({ email: '', otp: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setForgotLoading(false);
    }
  };

  const backToLogin = () => {
    setView('auth');
    setForgotStep(1);
    setForgotForm({ email: '', otp: '', newPassword: '', confirmPassword: '' });
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      await googleLogin(credentialResponse.credential);
      toast.success('Welcome!');
      navigate(from);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'forgot') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="card p-8 border-primary/20">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4">
                {forgotStep === 1 ? <Mail className="w-7 h-7 text-white" /> :
                 forgotStep === 2 ? <ShieldCheck className="w-7 h-7 text-white" /> :
                 <KeyRound className="w-7 h-7 text-white" />}
              </div>
              <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {forgotStep === 1 ? 'Enter your email to receive a verification code' :
                 forgotStep === 2 ? 'Enter the 6-digit code sent to your email' :
                 'Set your new password'}
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    s === forgotStep ? 'bg-primary text-white' :
                    s < forgotStep ? 'bg-green-500 text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {s < forgotStep ? '✓' : s}
                  </div>
                  {s < 3 && <div className={`w-8 h-0.5 ${s < forgotStep ? 'bg-green-500' : 'bg-muted'}`} />}
                </div>
              ))}
            </div>

            {forgotStep === 1 && (
              <form onSubmit={handleForgotEmail} className="space-y-4">
                <div>
                  <label className="label">Email Address</label>
                  <input className="input" type="email" placeholder="your@email.com"
                    value={forgotForm.email}
                    onChange={e => setForgotForm(p => ({ ...p, email: e.target.value }))} required />
                </div>
                <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2" disabled={forgotLoading}>
                  {forgotLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send OTP'}
                </button>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="label">Verification Code</label>
                  <input className="input text-center text-2xl font-bold tracking-[0.5em]" type="text"
                    placeholder="000000" maxLength={6}
                    value={forgotForm.otp}
                    onChange={e => setForgotForm(p => ({ ...p, otp: e.target.value.replace(/\D/g, '') }))} required />
                  <p className="text-xs text-muted-foreground mt-1.5">Check your inbox for the 6-digit code</p>
                </div>
                <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2" disabled={forgotLoading}>
                  {forgotLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : 'Verify OTP'}
                </button>
                <button type="button" onClick={() => { setForgotStep(1); setForgotForm(p => ({ ...p, otp: '' })); }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Didn't receive it? Send again
                </button>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="label">New Password</label>
                  <input className="input" type="password" placeholder="Min. 6 characters"
                    value={forgotForm.newPassword}
                    onChange={e => setForgotForm(p => ({ ...p, newPassword: e.target.value }))} required minLength={6} />
                </div>
                <div>
                  <label className="label">Confirm Password</label>
                  <input className="input" type="password" placeholder="Repeat your password"
                    value={forgotForm.confirmPassword}
                    onChange={e => setForgotForm(p => ({ ...p, confirmPassword: e.target.value }))} required minLength={6} />
                </div>
                <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2" disabled={forgotLoading}>
                  {forgotLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</> : 'Reset Password'}
                </button>
              </form>
            )}

            <button onClick={backToLogin}
              className="w-full mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card p-8 border-primary/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Welcome to Quizmify</h1>
            <p className="text-muted-foreground mt-1 text-sm">Sign in or create an account</p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg p-1 mb-6 bg-muted">
            {['login', 'signup'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-md text-sm font-medium capitalize transition-all duration-200
                  ${tab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                {t === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" placeholder="your@email.com"
                  value={loginForm.email}
                  onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} required />
              </div>
              <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2" disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
              </button>
              <button type="button" onClick={() => setView('forgot')}
                className="w-full text-sm text-primary hover:underline">
                Forgot Password?
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input" type="text" placeholder="John Doe"
                  value={signupForm.full_name}
                  onChange={e => setSignupForm(p => ({ ...p, full_name: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" placeholder="your@email.com"
                  value={signupForm.email}
                  onChange={e => setSignupForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" placeholder="Min. 6 characters"
                  value={signupForm.password}
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

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground uppercase">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google Sign-In */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google sign-in failed')}
              theme="outline"
              size="large"
              width={350}
              text={tab === 'login' ? 'signin_with' : 'signup_with'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
