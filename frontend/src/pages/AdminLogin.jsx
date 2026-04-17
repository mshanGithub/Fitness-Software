import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock, Mail, ShieldCheck, Siren, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email.trim() || !form.password) {
      toast.error('Enter your admin email and password');
      return;
    }

    setLoading(true);
    try {
      await login(form.email, form.password, { admin: true });
      toast.success('Admin session started');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page auth-page">
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />

      <div className="auth-container admin-auth-container">
        <motion.section
          className="auth-panel auth-panel-left admin-panel-left"
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        >
          <div className="admin-badge-row">
            <span className="admin-lock-badge">
              <ShieldCheck size={16} />
              Admin Portal
            </span>
          </div>
          <h1 className="admin-login-title">Train With Cain Control Room</h1>
          <p className="admin-login-copy">
            This route is reserved for accounts manually promoted to admin. Use it to monitor members,
            manage account access, and publish new YouTube workout links.
          </p>

          <div className="admin-login-cards">
            <div className="admin-login-card">
              <Siren size={18} />
              <div>
                <strong>Separate auth path</strong>
                <p>Standard users stay on the public member login.</p>
              </div>
            </div>
            <div className="admin-login-card">
              <Zap size={18} />
              <div>
                <strong>Operational tools</strong>
                <p>Review users, deactivate accounts, and manage the workout library.</p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="auth-panel auth-panel-right admin-panel-right"
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        >
          <div className="auth-form-wrapper admin-form-wrapper">
            <div className="auth-form-header">
              <div className="auth-badge admin-auth-badge">
                <ShieldCheck size={14} />
                <span>Admin Sign In</span>
              </div>
              <h2 className="auth-title">admin-twc-login</h2>
              <p className="auth-subtitle">Access the admin dashboard with an approved account.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="admin-email">Admin Email</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="admin-email"
                    className="form-input"
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="admin@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="admin-password">Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="admin-password"
                    className="form-input"
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                    placeholder="Enter admin password"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary btn-full" disabled={loading}>
                {loading ? <span className="btn-spinner" /> : 'OPEN ADMIN DASHBOARD'}
              </button>
            </form>

            <p className="auth-switch">
              Member account? <Link to="/login" className="auth-link">Go to user login</Link>
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default AdminLogin;