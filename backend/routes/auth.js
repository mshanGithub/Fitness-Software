const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { extractEmailAddress, isMailConfigured, sendPasswordResetOtp } = require('../config/mailer');

const router = express.Router();
const PASSWORD_RESET_OTP_TTL_MS = 10 * 60 * 1000;

const isStrongPassword = (password) => {
  return (
    typeof password === 'string' &&
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const generateOtp = () => String(crypto.randomInt(100000, 1000000));

const hashOtp = (otp) => crypto
  .createHash('sha256')
  .update(String(otp))
  .digest('hex');

const isMailAuthError = (error) => {
  return error && (
    error.responseCode === 535
    || error.code === 'EAUTH'
    || /BadCredentials|Invalid login|Username and Password not accepted/i.test(error.message || '')
  );
};

// @route  POST /api/auth/register
// @desc   Register a new user
// @access Public
router.post(
  '/register',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .custom((value) => isStrongPassword(value))
      .withMessage('Password must be at least 8 characters and include uppercase, lowercase, number, and special character'),
    body('fitnessGoal').optional().isIn([
      'weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness',
    ]),
    body('fitnessLevel').optional().isIn(['beginner', 'intermediate', 'advanced']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, fitnessGoal, fitnessLevel } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        fitnessGoal: fitnessGoal || 'general_fitness',
        fitnessLevel: fitnessLevel || 'beginner',
      });

      const token = generateToken(user._id);

      res.status(201).json({
        token,
        user: user.toPublicJSON(),
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }
);

// @route  POST /api/auth/login
// @desc   Login user
// @access Public
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      if (!user.isActive) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }

      const token = generateToken(user._id);

      res.status(200).json({
        token,
        user: user.toPublicJSON(),
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

// @route  POST /api/auth/forgot-password
// @desc   Send password reset OTP via Gmail
// @access Public
router.post(
  '/forgot-password',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'No account found with that email' });
      }

      if (!isMailConfigured()) {
        return res.status(503).json({ message: 'Email service is not configured' });
      }

      const otp = generateOtp();
      user.passwordResetOtpHash = hashOtp(otp);
      user.passwordResetOtpExpiresAt = new Date(Date.now() + PASSWORD_RESET_OTP_TTL_MS);
      await user.save({ validateBeforeSave: false });

      try {
        await sendPasswordResetOtp({
          email: user.email,
          firstName: user.firstName,
          otp,
          expiresInMinutes: PASSWORD_RESET_OTP_TTL_MS / (60 * 1000),
        });
      } catch (mailError) {
        user.passwordResetOtpHash = null;
        user.passwordResetOtpExpiresAt = null;
        await user.save({ validateBeforeSave: false });
        throw mailError;
      }

      return res.status(200).json({
        message: 'Password reset OTP sent to your email',
      });
    } catch (error) {
      console.error('Forgot password error:', error);

      if (isMailAuthError(error)) {
        return res.status(502).json({
          message: `Email service authentication failed. Check GMAIL_USER (${extractEmailAddress(process.env.GMAIL_USER) || 'missing'}) and GMAIL_APP_PASSWORD.`,
        });
      }

      return res.status(500).json({ message: 'Unable to send reset OTP right now' });
    }
  }
);

// @route  POST /api/auth/reset-password
// @desc   Reset password using email and OTP
// @access Public
router.post(
  '/reset-password',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('otp')
      .trim()
      .matches(/^\d{6}$/)
      .withMessage('OTP must be a 6-digit code'),
    body('password')
      .custom((value) => isStrongPassword(value))
      .withMessage('Password must be at least 8 characters and include uppercase, lowercase, number, and special character'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp, password } = req.body;

    try {
      const user = await User.findOne({
        email,
        passwordResetOtpHash: hashOtp(otp),
        passwordResetOtpExpiresAt: { $gt: new Date() },
      }).select('+passwordResetOtpHash +passwordResetOtpExpiresAt');

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }

      user.password = password;
      user.passwordResetOtpHash = null;
      user.passwordResetOtpExpiresAt = null;
      await user.save();

      return res.status(200).json({ message: 'Password reset successful. You can now sign in.' });
    } catch (error) {
      console.error('Reset password error:', error);
      return res.status(500).json({ message: 'Unable to reset password right now' });
    }
  }
);

module.exports = router;
