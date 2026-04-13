import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  Flame, Zap, Trophy, TrendingUp, Calendar,
  Dumbbell, Activity, Target, Play, CheckCircle2,
  BarChart3, Clock,
} from 'lucide-react';

const goalLabels = {
  weight_loss: 'Weight Loss 🔥',
  muscle_gain: 'Muscle Gain 💪',
  endurance: 'Endurance 🏃',
  flexibility: 'Flexibility 🧘',
  general_fitness: 'General Fitness ⚡',
};

const levelColors = {
  beginner: '#4DD9AC',
  intermediate: '#F5A623',
  advanced: '#7EC8C8',
};

const quickWorkouts = [
  { id: 1, name: 'HIIT Blast', duration: '20 min', calories: 280, level: 'Intermediate', icon: '🔥' },
  { id: 2, name: 'Strength Circuit', duration: '35 min', calories: 320, level: 'Advanced', icon: '💪' },
  { id: 3, name: 'Core Power', duration: '15 min', calories: 180, level: 'Beginner', icon: '⚡' },
  { id: 4, name: 'Yoga Flow', duration: '25 min', calories: 150, level: 'Beginner', icon: '🧘' },
];

const motivationalQuotes = [
  "You don't find willpower, you create it.",
  "Every rep, every set — you're becoming unstoppable.",
  "Strong is not just a body. It's a mindset.",
  "Your only competition is who you were yesterday.",
  "Train like your life depends on it — because it does.",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const Dashboard = () => {
  const { user, stats, refreshStats } = useAuth();
  const [loggingWorkout, setLoggingWorkout] = useState(null);
  const [quote] = useState(() => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    refreshStats();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [refreshStats]);

  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleLogWorkout = async (workout) => {
    setLoggingWorkout(workout.id);
    try {
      await userAPI.logWorkout({ caloriesBurned: workout.calories });
      await refreshStats();
      toast.success(`${workout.name} completed! 🔥 +${workout.calories} cal burned`);
    } catch {
      toast.error('Could not log workout. Are you connected to the server?');
    } finally {
      setLoggingWorkout(null);
    }
  };

  const weeklyGoal = stats?.stats?.weeklyGoal || 4;
  const workoutsThisWeek = stats?.stats ? (stats.stats.workoutsCompleted % weeklyGoal) || 0 : 0;
  const weeklyPct = Math.min(Math.round((workoutsThisWeek / weeklyGoal) * 100), 100);

  const statCards = [
    {
      icon: <Flame size={24} />,
      label: 'Total Workouts',
      value: stats?.stats?.workoutsCompleted ?? 0,
      color: '#7EC8C8',
      suffix: '',
    },
    {
      icon: <Zap size={24} />,
      label: 'Current Streak',
      value: stats?.stats?.currentStreak ?? 0,
      color: '#F5A623',
      suffix: ' days',
    },
    {
      icon: <Trophy size={24} />,
      label: 'Calories Burned',
      value: stats?.stats?.totalCaloriesBurned ?? 0,
      color: '#A8DEDE',
      suffix: ' kcal',
    },
    {
      icon: <TrendingUp size={24} />,
      label: 'Weekly Progress',
      value: weeklyPct,
      color: '#4DD9AC',
      suffix: '%',
    },
  ];

  return (
    <div className="dashboard-page">
      {/* Background glow effects */}
      <div className="dash-glow dash-glow-1" />
      <div className="dash-glow dash-glow-2" />

      <motion.div
        className="dashboard-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Welcome Banner */}
        <motion.div className="dash-hero" variants={cardVariants}>
          <div className="dash-hero-text">
            <div className="dash-greeting-badge">
              <Activity size={14} />
              <span>{getGreeting()}</span>
            </div>
            <h1 className="dash-welcome">
              {getGreeting()},{' '}
              <span className="name-highlight">{user?.firstName}!</span>
            </h1>
            <p className="dash-quote">"{quote}"</p>
            <div className="dash-hero-meta">
              <span className="meta-chip meta-chip-goal">
                <Target size={14} />
                {goalLabels[user?.fitnessGoal] || 'General Fitness'}
              </span>
              <span
                className="meta-chip"
                style={{ color: levelColors[user?.fitnessLevel], borderColor: levelColors[user?.fitnessLevel] + '44' }}
              >
                <BarChart3 size={14} />
                {user?.fitnessLevel?.charAt(0).toUpperCase() + user?.fitnessLevel?.slice(1) || 'Beginner'}
              </span>
            </div>
          </div>
          <motion.div
            className="dash-hero-icon"
            animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Dumbbell size={72} />
          </motion.div>
        </motion.div>

        {/* Stat Cards */}
        <div className="stats-grid">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="stat-card"
              variants={cardVariants}
              whileHover={{ y: -6, boxShadow: `0 0 40px ${stat.color}28, 0 20px 40px rgba(0,0,0,0.4)` }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="stat-card-icon" style={{ color: stat.color, background: stat.color + '18' }}>
                {stat.icon}
              </div>
              <div className="stat-card-body">
                <motion.span
                  className="stat-card-value"
                  style={{ color: stat.color }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.1, type: 'spring' }}
                >
                  {stat.value}{stat.suffix}
                </motion.span>
                <span className="stat-card-label">{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="dash-grid">
          {/* Weekly Goal Progress */}
          <motion.div className="dash-card" variants={cardVariants}>
            <div className="card-header">
              <h3 className="card-title">
                <Calendar size={18} />
                Weekly Goal
              </h3>
              <span className="card-badge">{workoutsThisWeek}/{weeklyGoal} done</span>
            </div>
            <div className="weekly-progress">
              <div className="progress-track">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${weeklyPct}%` }}
                  transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                />
              </div>
              <div className="progress-labels">
                <span>{weeklyPct}% complete</span>
                <span>{weeklyGoal - workoutsThisWeek} workouts to go</span>
              </div>
            </div>
            <div className="weekly-dots">
              {Array.from({ length: weeklyGoal }, (_, i) => (
                <motion.div
                  key={i}
                  className={`week-dot ${i < workoutsThisWeek ? 'done' : ''}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                >
                  {i < workoutsThisWeek ? <CheckCircle2 size={18} /> : <div className="dot-empty" />}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Motivational Card */}
          <motion.div className="dash-card twc-promo-card" variants={cardVariants}>
            <div className="promo-glow" />
            <h3 className="promo-title">STRONGER TOGETHER AS WON</h3>
            <p className="promo-desc">
              Ready to unlock your strongest chapter? Book a session with Coach Cain today.
            </p>
            <motion.a
              href="https://trainwithcain.fit"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary btn-sm"
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(126, 200, 200, 0.45)' }}
              whileTap={{ scale: 0.97 }}
            >
              <Zap size={16} />
              BOOK WITH COACH CAIN
            </motion.a>
          </motion.div>
        </div>

        {/* Quick Workouts */}
        <motion.div className="dash-card" variants={cardVariants}>
          <div className="card-header">
            <h3 className="card-title">
              <Dumbbell size={18} />
              Quick Workouts
            </h3>
            <span className="card-hint">Tap to log a completed session</span>
          </div>
          <div className="workouts-grid">
            {quickWorkouts.map((workout, i) => (
              <motion.div
                key={workout.id}
                className="workout-card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ scale: 1.02, borderColor: '#E8522A88' }}
              >
                <div className="workout-emoji">{workout.icon}</div>
                <div className="workout-info">
                  <h4 className="workout-name">{workout.name}</h4>
                  <div className="workout-meta">
                    <span><Clock size={12} /> {workout.duration}</span>
                    <span><Flame size={12} /> {workout.calories} kcal</span>
                    <span className={`workout-level level-${workout.level.toLowerCase()}`}>
                      {workout.level}
                    </span>
                  </div>
                </div>
                <motion.button
                  className="btn-log"
                  onClick={() => handleLogWorkout(workout)}
                  disabled={loggingWorkout === workout.id}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {loggingWorkout === workout.id ? (
                    <span className="btn-spinner btn-spinner-sm" />
                  ) : (
                    <Play size={16} fill="currentColor" />
                  )}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div className="dash-footer" variants={cardVariants}>
          <p>© 2024 Train With Cain · Built with 💪 for your strongest chapter</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
