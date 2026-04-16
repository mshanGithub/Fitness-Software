import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, Dumbbell, Zap } from 'lucide-react';
import './Login.css';

const floatingParticles = Array.from({ length: 12 }, (_, i) => i);

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 💪');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Animated background particles */}
      <div className="particles-bg">
        {floatingParticles.map((i) => (
          <motion.div
            key={i}
            className="particle"
            initial={{ opacity: 0, y: 100, x: Math.random() * 100 - 50 }}
            animate={{
              opacity: [0, 0.6, 0],
              y: [-20, -200],
              x: [Math.random() * 80 - 40, Math.random() * 80 - 40],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'easeOut',
            }}
            style={{ left: `${8 + i * 8}%`, bottom: '10%' }}
          />
        ))}
      </div>

      {/* Glow orbs */}
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />

      <div className="auth-container">
        {/* Left Panel */}
        <motion.div
          className="auth-panel auth-panel-left"
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="auth-brand">
            <motion.div
              className="brand-logo"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Dumbbell size={44} />
            </motion.div>
            <h1 className="brand-title">TRAIN WITH CAIN</h1>
            <p className="brand-tagline">STRONGER TOGETHER AS WON</p>
          </div>

          <div className="auth-hero-stats">
            {[
              { label: 'Active Members', value: '500+', icon: '🏆' },
              { label: 'Programs', value: '12+', icon: '💪' },
              { label: 'Success Rate', value: '98%', icon: '⚡' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="hero-stat"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
              >
                <span className="stat-icon">{stat.icon}</span>
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </motion.div>
            ))}
          </div>

          <motion.p
            className="auth-panel-quote"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            "Transform Your Fitness Journey — Where Power Meets Passion in Every Workout!"
          </motion.p>
        </motion.div>

        {/* Right Panel - Form */}
        <motion.div
          className="auth-panel auth-panel-right"
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="auth-form-wrapper">
            <motion.div
              className="auth-form-header"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="auth-badge">
                <Zap size={14} />
                <span>Welcome Back</span>
              </div>
              <h2 className="auth-title">Sign In</h2>
              <p className="auth-subtitle">Continue your fitness journey today</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              {/* Email */}
              <motion.div
                className="form-group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="form-input"
                    autoComplete="email"
                    required
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div
                className="form-group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="form-input"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="input-eye"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>

              {/* Submit */}
              <motion.button
                type="submit"
                className="btn-primary btn-full"
                disabled={loading}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? 'none' : '0 0 36px rgba(126, 200, 200, 0.45)' }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <span className="btn-spinner" />
                ) : (
                  <>
                    <Zap size={18} />
                    SIGN IN
                  </>
                )}
              </motion.button>
            </form>

            <motion.p
              className="auth-switch"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Don't have an account?{' '}
              <Link to="/signup" className="auth-link">
                Create Account
              </Link>
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
