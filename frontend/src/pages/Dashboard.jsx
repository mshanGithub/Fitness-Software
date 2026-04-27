import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  Flame, Zap, Trophy, TrendingUp, Calendar,
  Dumbbell, Activity, Target, Play, CheckCircle2,
  BarChart3, Clock, X, ClipboardList,
} from 'lucide-react';
import AssignedFoodPlanViewer from '../components/AssignedFoodPlanViewer';
import './Dashboard.css';

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

const extractYouTubeIdFromUrl = (url = '') => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return '';
  }

  // Check if it's already just an ID (11 characters, alphanumeric + underscore/dash)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);

    // Handle youtu.be short URLs
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '').trim();
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
        return id;
      }
    }

    // Handle youtube.com URLs
    if (parsed.hostname.includes('youtube.com')) {
      const vidParam = parsed.searchParams.get('v');
      if (vidParam && /^[a-zA-Z0-9_-]{11}$/.test(vidParam)) {
        return vidParam.trim();
      }
    }
  } catch (error) {
    // URL parsing failed, return empty string
    return '';
  }

  return '';
};

const durationToMinutes = (durationText = '') => {
  const match = String(durationText).match(/(\d+)/);
  return match ? Number(match[1]) : 0;
};

const formatLevel = (level = 'beginner') => {
  const normalized = String(level || 'beginner').toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

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
  const [loggingWorkoutAction, setLoggingWorkoutAction] = useState('');
  const [quote] = useState(() => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeQuickWorkout, setActiveQuickWorkout] = useState(null);
  const [assignedPlans, setAssignedPlans] = useState({ workoutPlan: null, foodPlans: [] });
  const [completedWorkoutIds, setCompletedWorkoutIds] = useState([]);

  useEffect(() => {
    refreshStats();
    fetchAssignedPlans();
    fetchWorkoutReport();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [refreshStats]);

  const fetchAssignedPlans = async () => {
    try {
      const { data } = await userAPI.getAssignedPlans();
      setAssignedPlans({
        workoutPlan: data?.workoutPlan || null,
        foodPlans: data?.foodPlans || [],
      });
    } catch {
      setAssignedPlans({ workoutPlan: null, foodPlans: [] });
    }
  };

  const fetchWorkoutReport = async () => {
    try {
      const { data } = await userAPI.getWorkoutReport();
      const completedIds = (data?.report || [])
        .filter((entry) => entry.status === 'completed' && entry.workoutId)
        .map((entry) => entry.workoutId);
      setCompletedWorkoutIds(Array.from(new Set(completedIds)));
    } catch {
      setCompletedWorkoutIds([]);
    }
  };

  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleLogWorkout = async (workout, status = 'completed') => {
    setLoggingWorkout(workout.id);
    setLoggingWorkoutAction(status);

    const normalizedCalories = status === 'completed' ? Number(workout.calories || 0) : 0;

    try {
      await userAPI.logWorkout({
        caloriesBurned: normalizedCalories,
        status,
        workoutId: workout.id,
        workoutName: workout.name,
        planName: workout.planName || '',
        dayNumber: workout.dayNumber ?? null,
        duration: workout.duration || '',
        videoUrl: workout.videoUrl || '',
      });

      if (status === 'completed') {
        setCompletedWorkoutIds((prev) => {
          const workoutId = String(workout.id);
          return prev.includes(workoutId) ? prev : [...prev, workoutId];
        });
        await refreshStats();
        toast.success(`${workout.name} completed! 🔥 +${normalizedCalories} cal burned`);
      } else {
        toast.success(`${workout.name} skipped and saved to your report.`);
      }
    } catch {
      toast.error(`Could not ${status === 'completed' ? 'log' : 'skip'} workout. Are you connected to the server?`);
    } finally {
      setLoggingWorkout(null);
      setLoggingWorkoutAction('');
    }
  };

  const openQuickWorkoutModal = (workout) => {
    if (!workout.youtubeId) {
      toast.error('This workout does not have a playable video yet.');
      return;
    }

    setActiveQuickWorkout(workout);
  };

  const handleQuickWorkoutAction = async (status) => {
    if (!activeQuickWorkout || loggingWorkout) {
      return;
    }

    await handleLogWorkout(activeQuickWorkout, status);
    setActiveQuickWorkout(null);
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

  const assignedWorkoutItems = (assignedPlans.workoutPlan?.days || [])
    .flatMap((day) => (day.workouts || []).map((workout, index) => {
      const minutes = durationToMinutes(workout.duration);
      const estimatedCalories = minutes > 0 ? minutes * 8 : 150;
      // Use stored youtubeId if available, otherwise extract from videoUrl
      const youtubeId = workout.youtubeId || extractYouTubeIdFromUrl(workout.videoUrl);

      return {
        id: `${day.dayNumber}-${index}`,
        name: workout.title || `Workout ${index + 1}`,
        duration: workout.duration || `Day ${day.dayNumber}`,
        calories: estimatedCalories,
        level: formatLevel(user?.fitnessLevel || 'beginner'),
        dayNumber: day.dayNumber,
        planName: assignedPlans.workoutPlan?.name || '',
        videoUrl: workout.videoUrl || '',
        youtubeId,
        thumbnailUrl: youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : '',
      };
    }))
    .slice(0, 8);

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

        {/* Weekly Goal */}
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

        {(assignedPlans.workoutPlan || assignedPlans.foodPlans.length > 0) && (
          <motion.div className="dash-card" variants={cardVariants}>
            <div className="card-header">
              <h3 className="card-title">
                <ClipboardList size={18} />
                Your Assigned Plans
              </h3>
              <span className="card-hint">Customized by your coach/admin</span>
            </div>

            <div className="assigned-plans-grid">
              {assignedPlans.workoutPlan && (
                <article className="assigned-plan-card">
                  <h4>
                    <Dumbbell size={15} />
                    {assignedPlans.workoutPlan.name}
                  </h4>
                  <p>{assignedPlans.workoutPlan.type === 'daily' ? 'Daily' : 'Weekly'} workout plan</p>
                  <div className="assigned-plan-meta">
                    <span>{assignedPlans.workoutPlan.numberOfDays || assignedPlans.workoutPlan.days?.length || 0} days</span>
                    <span>{assignedPlans.workoutPlan.totalWorkouts || 0} workouts</span>
                  </div>
                </article>
              )}
            </div>

            {assignedWorkoutItems.length > 0 && (
              <div className="workouts-grid">
                {assignedWorkoutItems.map((workout, i) => {
                const isCompleted = completedWorkoutIds.includes(String(workout.id));
                return (
                  <motion.div
                    key={workout.id}
                    className="workout-card"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    whileHover={{ scale: 1.02, borderColor: '#E8522A88' }}
                    onClick={() => openQuickWorkoutModal(workout)}
                  >
                    <div className="workout-thumb-wrap">
                      {workout.thumbnailUrl ? (
                        <img className="workout-thumb-img" src={workout.thumbnailUrl} alt={workout.name} loading="lazy" />
                      ) : (
                        <div className="workout-thumb-fallback">
                          <Dumbbell size={20} />
                        </div>
                      )}
                    </div>
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
                      className={`btn-log ${isCompleted ? 'is-completed' : ''}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (isCompleted) {
                          return;
                        }
                        openQuickWorkoutModal(workout);
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 size={14} />
                          <span className="btn-log-label">Completed</span>
                        </>
                      ) : (
                        <Play size={16} fill="currentColor" />
                      )}
                    </motion.button>
                  </motion.div>
                );
                })}
              </div>
            )}

            {assignedPlans.foodPlans.length > 0 && (
              <AssignedFoodPlanViewer foodPlans={assignedPlans.foodPlans} />
            )}
          </motion.div>
        )}

        {/* Quick Workout Player Modal */}
        <AnimatePresence>
          {activeQuickWorkout && (
            <motion.div
              className="video-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveQuickWorkout(null)}
            >
              <motion.div
                className="video-modal"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="video-modal-header">
                  <h3 className="video-modal-title">{activeQuickWorkout.name}</h3>
                  <button className="video-modal-close" onClick={() => setActiveQuickWorkout(null)}>
                    <X size={20} />
                  </button>
                </div>
                <div className="video-modal-player">
                  {activeQuickWorkout.youtubeId ? (
                    <a
                      href={activeQuickWorkout.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="video-thumbnail-link"
                    >
                      <img
                        src={activeQuickWorkout.thumbnailUrl}
                        alt={activeQuickWorkout.name}
                        className="video-thumbnail"
                      />
                      <div className="video-play-overlay">
                        <div className="play-button">
                          <Play size={48} fill="#fff" color="#fff" />
                        </div>
                        <span className="open-youtube-text">Open on YouTube</span>
                      </div>
                    </a>
                  ) : (
                    <div className="video-player-error">
                      <div className="error-icon">!</div>
                      <h4>Video Not Available</h4>
                      <p>The video link for this workout is not configured.</p>
                      {activeQuickWorkout.videoUrl && (
                        <a 
                          href={activeQuickWorkout.videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-primary"
                        >
                          Watch on YouTube
                        </a>
                      )}
                    </div>
                  )}
                </div>
                <div className="quick-workout-modal-meta">
                  <span><Clock size={12} /> {activeQuickWorkout.duration}</span>
                  <span><Flame size={12} /> {activeQuickWorkout.calories} kcal</span>
                  <span className={`workout-level level-${activeQuickWorkout.level.toLowerCase()}`}>
                    {activeQuickWorkout.level}
                  </span>
                </div>
                <div className="quick-workout-modal-actions">
                  <button
                    type="button"
                    className="btn-primary btn-sm"
                    onClick={() => handleQuickWorkoutAction('completed')}
                    disabled={loggingWorkout === activeQuickWorkout.id}
                  >
                    {loggingWorkout === activeQuickWorkout.id && loggingWorkoutAction === 'completed' ? (
                      <span className="btn-spinner btn-spinner-sm" />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    Mark Done
                  </button>
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={() => handleQuickWorkoutAction('skipped')}
                    disabled={loggingWorkout === activeQuickWorkout.id}
                  >
                    {loggingWorkout === activeQuickWorkout.id && loggingWorkoutAction === 'skipped' ? (
                      <span className="btn-spinner btn-spinner-sm" />
                    ) : (
                      <X size={16} />
                    )}
                    Skip
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div className="dash-footer" variants={cardVariants}>
          <p>© 2026 Train With Cain · Built with 💪 for your strongest chapter</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
