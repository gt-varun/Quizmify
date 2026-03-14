import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, User, Mail, Lock, Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../lib/api.js';

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [form, setForm] = useState({ full_name: '', age_category: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      setForm({ full_name: user.full_name || '', age_category: user.age_category || '' });
    }
  }, [user, authLoading]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/auth/profile', form);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    setChangingPassword(true);
    try {
      await api.patch('/auth/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn-outline p-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Profile Settings
            </h1>
            <p className="text-muted-foreground">Manage your account</p>
          </div>
        </div>

        {/* Avatar + Email */}
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
              {(user?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{user?.full_name || 'User'}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSaveProfile} className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
            <User className="w-5 h-5 text-primary" /> Personal Information
          </h2>
          <div>
            <label className="label">Full Name</label>
            <input className="input" type="text" value={form.full_name}
              onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
              placeholder="Your full name" />
          </div>
          <div>
            <label className="label">Age Category</label>
            <select className="input" value={form.age_category}
              onChange={e => setForm(p => ({ ...p, age_category: e.target.value }))}>
              <option value="">Select age category</option>
              {['under-18', '18-25', '26-35', '36-50', '50+'].map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </form>

        {/* Change Password */}
        <form onSubmit={handleChangePassword} className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
            <Lock className="w-5 h-5 text-primary" /> Change Password
          </h2>
          <div>
            <label className="label">Current Password</label>
            <input className="input" type="password" value={passwordForm.currentPassword}
              onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
              placeholder="Enter current password" required />
          </div>
          <div>
            <label className="label">New Password</label>
            <input className="input" type="password" value={passwordForm.newPassword}
              onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
              placeholder="Enter new password" required minLength={6} />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input className="input" type="password" value={passwordForm.confirmPassword}
              onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
              placeholder="Confirm new password" required minLength={6} />
          </div>
          <button type="submit" disabled={changingPassword} className="btn-primary flex items-center gap-2">
            {changingPassword ? <><Loader2 className="w-4 h-4 animate-spin" /> Changing...</> : <><Lock className="w-4 h-4" /> Change Password</>}
          </button>
        </form>
      </div>
    </div>
  );
}
