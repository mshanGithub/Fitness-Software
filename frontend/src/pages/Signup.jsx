import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Mail, Lock, Eye, EyeOff, User, Dumbbell, Zap,
  ChevronRight, ChevronLeft, Target, TrendingUp,
} from 'lucide-react';
import './Signup.css';

const fitnessGoals = [
  { value: 'weight_loss', label: 'Weight Loss', emoji: '🔥', desc: 'Burn fat, feel energized' },
  { value: 'muscle_gain', label: 'Muscle Gain', emoji: '💪', desc: 'Build strength & size' },
  { value: 'endurance', label: 'Endurance', emoji: '🏃', desc: 'Improve stamina & cardio' },
  { value: 'flexibility', label: 'Flexibility', emoji: '🧘', desc: 'Increase range of motion' },
  { value: 'general_fitness', label: 'General Fitness', emoji: '⚡', desc: 'Overall health & wellness' },
];

const fitnessLevels = [
  { value: 'beginner', label: 'Beginner', emoji: '🌱', desc: 'Just getting started' },
  { value: 'intermediate', label: 'Intermediate', emoji: '⚡', desc: 'Some experience' },
  { value: 'advanced', label: 'Advanced', emoji: '🏆', desc: 'Highly experienced' },
];

const getPasswordChecks = (password) => ([
  { label: 'At least 8 characters', passed: password.length >= 8 },
  { label: 'One uppercase letter', passed: /[A-Z]/.test(password) },
  { label: 'One lowercase letter', passed: /[a-z]/.test(password) },
  { label: 'One number', passed: /\d/.test(password) },
  { label: 'One special character', passed: /[^A-Za-z0-9]/.test(password) },
]);

const Signup = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    fitnessGoal: '',
    fitnessLevel: '',
  });

  const { register } = useAuth();
  const navigate = useNavigate();
  const passwordChecks = getPasswordChecks(form.password);
  const isPasswordStrong = passwordChecks.every((check) => check.passed);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelect = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!form.firstName.trim()) { toast.error('First name is required'); return false; }
    if (!form.lastName.trim()) { toast.error('Last name is required'); return false; }
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
      toast.error('Valid email is required'); return false;
    }
    if (!isPasswordStrong) {
      toast.error('Password must be at least 8 characters and include uppercase, lowercase, number, and special character');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!form.fitnessGoal) { toast.error('Please select your fitness goal'); return false; }
    if (!form.fitnessLevel) { toast.error('Please select your fitness level'); return false; }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    try {
      await register(form);
      toast.success('Welcome to TWC! Let\'s get started 🔥');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="auth-page">
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />

      <div className="auth-container signup-container">
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
            <p className="brand-tagline">YOUR STRONGEST CHAPTER STARTS NOW</p>
          </div>

          <div className="signup-steps-visual">
            {['Your Info', 'Your Goals'].map((label, i) => (
              <div key={label} className={`step-indicator ${step > i ? 'completed' : ''} ${step === i + 1 ? 'active' : ''}`}>
                <div className="step-dot">
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="auth-features">
            {[
              { icon: '🎯', text: 'Personalized fitness programs' },
              { icon: '🥗', text: 'Custom nutrition plans' },
              { icon: '📊', text: 'Real-time progress tracking' },
            ].map((feat, i) => (
              <motion.div
                key={feat.text}
                className="feature-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <span>{feat.icon}</span>
                <span>{feat.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Panel - Multi-step Form */}
        <motion.div
          className="auth-panel auth-panel-right"
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="auth-form-wrapper">
            {/* Progress bar */}
            <div className="progress-bar-outer">
              <motion.div
                className="progress-bar-inner"
                animate={{ width: `${(step / 2) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            <div className="auth-form-header">
              <div className="auth-badge">
                <Zap size={14} />
                <span>Step {step} of 2</span>
              </div>
              <h2 className="auth-title">
                {step === 1 ? 'Create Account' : 'Set Your Goals'}
              </h2>
              <p className="auth-subtitle">
                {step === 1
                  ? 'Join the TWC fitness community'
                  : 'Help us personalize your experience'}
              </p>
            </div>

            <AnimatePresence mode="wait" custom={step}>
              {step === 1 ? (
                <motion.div
                  key="step1"
                  custom={1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <div className="input-wrapper">
                        <User size={18} className="input-icon" />
                        <input
                          type="text"
                          name="firstName"
                          value={form.firstName}
                          onChange={handleChange}
                          placeholder="Amy"
                          className="form-input"
                          autoComplete="given-name"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <div className="input-wrapper">
                        <User size={18} className="input-icon" />
                        <input
                          type="text"
                          name="lastName"
                          value={form.lastName}
                          onChange={handleChange}
                          placeholder="Cain"
                          className="form-input"
                          autoComplete="family-name"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
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
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="input-wrapper">
                      <Lock size={18} className="input-icon" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                          placeholder="Create a strong password"
                        className="form-input"
                        autoComplete="new-password"
                          minLength={8}
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
                    <div className="password-guidance">
                      <span className={`password-strength ${isPasswordStrong ? 'strong' : 'weak'}`}>
                        {isPasswordStrong ? 'Strong password' : 'Password requirements'}
                      </span>
                      <div className="password-checklist">
                        {passwordChecks.map((check) => (
                          <span
                            key={check.label}
                            className={`password-check ${check.passed ? 'passed' : ''}`}
                          >
                            {check.passed ? '✓' : '•'} {check.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    className="btn-primary btn-full"
                    onClick={handleNext}
                    whileHover={{ scale: 1.02, boxShadow: '0 0 36px rgba(126, 200, 200, 0.45)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continue
                    <ChevronRight size={18} />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form
                  key="step2"
                  custom={2}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit}
                >
                  {/* Fitness Goal */}
                  <div className="form-group">
                    <label className="form-label">
                      <Target size={16} /> Fitness Goal
                    </label>
                    <div className="select-grid">
                      {fitnessGoals.map((goal) => (
                        <motion.button
                          key={goal.value}
                          type="button"
                          className={`select-card ${form.fitnessGoal === goal.value ? 'selected' : ''}`}
                          onClick={() => handleSelect('fitnessGoal', goal.value)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <span className="card-emoji">{goal.emoji}</span>
                          <span className="card-label">{goal.label}</span>
                          <span className="card-desc">{goal.desc}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Fitness Level */}
                  <div className="form-group">
                    <label className="form-label">
                      <TrendingUp size={16} /> Fitness Level
                    </label>
                    <div className="level-grid">
                      {fitnessLevels.map((level) => (
                        <motion.button
                          key={level.value}
                          type="button"
                          className={`level-card ${form.fitnessLevel === level.value ? 'selected' : ''}`}
                          onClick={() => handleSelect('fitnessLevel', level.value)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <span>{level.emoji}</span>
                          <span className="level-label">{level.label}</span>
                          <span className="level-desc">{level.desc}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="form-actions-row">
                    <motion.button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setStep(1)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ChevronLeft size={18} />
                      Back
                    </motion.button>

                    <motion.button
                      type="submit"
                      className="btn-primary btn-flex"
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? 'none' : '0 0 36px rgba(126, 200, 200, 0.45)' }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                    >
                      {loading ? (
                        <span className="btn-spinner" />
                      ) : (
                        <>
                          <Zap size={18} />
                          START MY JOURNEY
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <p className="auth-switch">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
