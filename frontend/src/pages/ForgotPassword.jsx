import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, KeyRound, Lock, Mail, ShieldCheck, TimerReset, Zap } from 'lucide-react';
import { authAPI } from '../services/api';
import './ForgotPassword.css';

const getPasswordChecks = (password) => ([
  { label: 'At least 8 characters', passed: password.length >= 8 },
  { label: 'One uppercase letter', passed: /[A-Z]/.test(password) },
  { label: 'One lowercase letter', passed: /[a-z]/.test(password) },
  { label: 'One number', passed: /\d/.test(password) },
  { label: 'One special character', passed: /[^A-Za-z0-9]/.test(password) },
]);

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const passwordChecks = useMemo(() => getPasswordChecks(password), [password]);
  const isPasswordStrong = passwordChecks.every((check) => check.passed);

  const handleSendOtp = async (event) => {
    event.preventDefault();

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Enter a valid email address');
      return;
    }

    setSendingOtp(true);
    try {
      const { data } = await authAPI.forgotPassword({ email });
      toast.success(data.message || 'OTP sent to your email');
      setStep(2);
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Unable to send OTP';
      toast.error(message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      toast.error('Enter the 6-digit OTP from your email');
      return;
    }

    if (!isPasswordStrong) {
      toast.error('Use a stronger password before continuing');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setResettingPassword(true);
    try {
      const { data } = await authAPI.resetPassword({ email, otp, password });
      toast.success(data.message || 'Password reset successful');
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Unable to reset password';
      toast.error(message);
    } finally {
      setResettingPassword(false);
    }
  };

  const handleResendOtp = async () => {
    if (sendingOtp) return;
    setSendingOtp(true);
    try {
      const { data } = await authAPI.forgotPassword({ email });
      toast.success(data.message || 'A new OTP has been sent');
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to resend OTP';
      toast.error(message);
    } finally {
      setSendingOtp(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-orb forgot-orb-left" />
      <div className="forgot-orb forgot-orb-right" />

      <div className="forgot-shell">
        <motion.section
          className="forgot-side"
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="forgot-brand-badge">
            <ShieldCheck size={18} />
            <span>Password Recovery</span>
          </div>

          <h1 className="forgot-title">Reset Your Access Securely</h1>
          <p className="forgot-copy">
            We will first confirm the email exists in your account list, then send a one-time code to your Gmail inbox.
          </p>

          <div className="forgot-steps">
            <div className={`forgot-step ${step >= 1 ? 'active' : ''}`}>
              <Mail size={18} />
              <span>Check your registered email</span>
            </div>
            <div className={`forgot-step ${step >= 2 ? 'active' : ''}`}>
              <KeyRound size={18} />
              <span>Enter the OTP and set a new password</span>
            </div>
          </div>

          <div className="forgot-notes">
            <div className="forgot-note-card">
              <TimerReset size={18} />
              <div>
                <strong>10-minute expiry</strong>
                <p>Each OTP expires quickly to reduce reuse risk.</p>
              </div>
            </div>
            <div className="forgot-note-card">
              <Lock size={18} />
              <div>
                <strong>Password rules stay enforced</strong>
                <p>Your new password must meet the same strength policy as signup.</p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="forgot-card"
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="forgot-header">
            <div className="forgot-mini-badge">
              <Zap size={14} />
              <span>{step === 1 ? 'Step 1 of 2' : 'Step 2 of 2'}</span>
            </div>
            <h2>{step === 1 ? 'Send OTP' : 'Create New Password'}</h2>
            <p>
              {step === 1
                ? 'Enter the email used on your account.'
                : 'Use the 6-digit code from Gmail and choose your new password.'}
            </p>
          </div>

          {step === 1 ? (
            <form className="forgot-form" onSubmit={handleSendOtp} noValidate>
              <label className="forgot-label" htmlFor="forgot-email">Email Address</label>
              <div className="forgot-input-wrap">
                <Mail size={18} className="forgot-input-icon" />
                <input
                  id="forgot-email"
                  className="forgot-input"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <button type="submit" className="forgot-primary-btn" disabled={sendingOtp}>
                {sendingOtp ? 'Sending OTP...' : 'Send Gmail OTP'}
              </button>
            </form>
          ) : (
            <form className="forgot-form" onSubmit={handleResetPassword} noValidate>
              <label className="forgot-label" htmlFor="forgot-otp">OTP Code</label>
              <div className="forgot-input-wrap">
                <KeyRound size={18} className="forgot-input-icon" />
                <input
                  id="forgot-otp"
                  className="forgot-input forgot-otp-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                />
              </div>

              <label className="forgot-label" htmlFor="forgot-password">New Password</label>
              <div className="forgot-input-wrap">
                <Lock size={18} className="forgot-input-icon" />
                <input
                  id="forgot-password"
                  className="forgot-input"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                />
              </div>

              <label className="forgot-label" htmlFor="forgot-confirm-password">Confirm Password</label>
              <div className="forgot-input-wrap">
                <Lock size={18} className="forgot-input-icon" />
                <input
                  id="forgot-confirm-password"
                  className="forgot-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat the new password"
                  autoComplete="new-password"
                />
              </div>

              <div className="forgot-password-guidance">
                {passwordChecks.map((check) => (
                  <div key={check.label} className={`forgot-check ${check.passed ? 'passed' : ''}`}>
                    <span>{check.passed ? '✓' : '•'}</span>
                    <span>{check.label}</span>
                  </div>
                ))}
              </div>

              <button type="submit" className="forgot-primary-btn" disabled={resettingPassword}>
                {resettingPassword ? 'Updating Password...' : 'Reset Password'}
              </button>

              <button type="button" className="forgot-secondary-btn" onClick={handleResendOtp} disabled={sendingOtp}>
                {sendingOtp ? 'Sending...' : 'Resend OTP'}
              </button>
            </form>
          )}

          <div className="forgot-footer-links">
            {step === 2 ? (
              <button type="button" className="forgot-inline-btn" onClick={() => setStep(1)}>
                <ArrowLeft size={16} />
                Change email
              </button>
            ) : null}

            <Link to="/login" className="forgot-back-link">
              <ArrowLeft size={16} />
              Back to sign in
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default ForgotPassword;