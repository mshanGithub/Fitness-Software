import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Activity,
  BarChart3,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Salad,
  Target,
  Users,
  X,
} from 'lucide-react';
import { adminAPI } from '../services/api';
import './AdminDashboard.css';

const tabs = [
  { key: 'overview', label: 'Dashboard Overview', icon: <BarChart3 size={16} /> },
  { key: 'workout', label: 'Workout Plans', icon: <Activity size={16} /> },
  { key: 'food', label: 'Food Plans', icon: <Salad size={16} /> },
];

const emptyWorkout = () => ({
  selectedVideoId: '',
  title: '',
  videoUrl: '',
  duration: '',
  description: '',
});

const createDays = (count) => Array.from({ length: count }, (_, index) => ({
  dayNumber: index + 1,
  workouts: [],
}));

const cardIcons = {
  totalUsers: <Users size={18} />,
  activeUsers: <CheckCircle2 size={18} />,
  inactiveUsers: <Target size={18} />,
  totalWorkoutPlans: <ClipboardList size={18} />,
  totalFoodPlans: <Salad size={18} />,
  fitnessGoalCount: <BarChart3 size={18} />,
};

const cardLabels = {
  totalUsers: 'Total Users',
  activeUsers: 'Active Users',
  inactiveUsers: 'Inactive Users',
  totalWorkoutPlans: 'Total Workout Plans',
  totalFoodPlans: 'Total Food Plans',
  fitnessGoalCount: 'Fitness Goal Count',
};

const toTitleText = (value = '') => String(value || '').replace(/_/g, ' ');

const isSameCalendarDay = (inputDate, today) => {
  const parsed = new Date(inputDate);
  return parsed.getFullYear() === today.getFullYear()
    && parsed.getMonth() === today.getMonth()
    && parsed.getDate() === today.getDate();
};

const getTodayProgressSummary = (user) => {
  const today = new Date();
  const reportEntries = Array.isArray(user?.workoutPlanReport) ? user.workoutPlanReport : [];
  const completedToday = reportEntries.filter(
    (entry) => entry.status === 'completed' && entry.loggedAt && isSameCalendarDay(entry.loggedAt, today)
  ).length;

  const skippedToday = reportEntries.filter(
    (entry) => entry.status === 'skipped' && entry.loggedAt && isSameCalendarDay(entry.loggedAt, today)
  ).length;

  const assignedPlan = user?.assignedWorkoutPlan;
  const days = Array.isArray(assignedPlan?.days) ? assignedPlan.days : [];
  let assignedToday = 0;

  if (days.length > 0) {
    if (assignedPlan?.type === 'daily') {
      assignedToday = (days[0]?.workouts || []).length;
    } else {
      const weekdayIndex = (today.getDay() + 6) % 7;
      const dayEntry = days[weekdayIndex] || null;
      assignedToday = (dayEntry?.workouts || []).length;
    }
  }

  return {
    completedToday,
    skippedToday,
    pendingToday: Math.max(assignedToday - completedToday, 0),
    assignedToday,
  };
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({ metrics: {}, fitnessGoalBreakdown: {} });
  const [users, setUsers] = useState([]);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [foodPlans, setFoodPlans] = useState([]);
  const [videos, setVideos] = useState([]);
  const [assignmentDrafts, setAssignmentDrafts] = useState({});
  const [savingAssignmentUserId, setSavingAssignmentUserId] = useState('');
  const [updatingAccessUserId, setUpdatingAccessUserId] = useState('');
  const [selectedOverviewUser, setSelectedOverviewUser] = useState(null);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [deletingPlanId, setDeletingPlanId] = useState('');
  const [workoutForm, setWorkoutForm] = useState({
    name: '',
    type: 'weekly',
    numberOfDays: 7,
    days: createDays(7),
  });

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [
        { data: overviewData },
        { data: usersData },
        { data: workoutPlansData },
        { data: foodPlansData },
        { data: videosData },
      ] = await Promise.all([
        adminAPI.getOverview(),
        adminAPI.getUsers(),
        adminAPI.getWorkoutPlans(),
        adminAPI.getFoodPlans(),
        adminAPI.getVideos(),
      ]);

      setOverview({
        metrics: overviewData.metrics || {},
        fitnessGoalBreakdown: overviewData.fitnessGoalBreakdown || {},
      });
      setUsers(usersData || []);
      setWorkoutPlans(workoutPlansData || []);
      setFoodPlans(foodPlansData || []);
      setVideos((videosData || []).filter((video) => video.isActive !== false));
      setAssignmentDrafts(
        (usersData || []).reduce((accumulator, user) => {
          accumulator[user._id] = {
            workoutPlanId: user.assignedWorkoutPlan?._id || '',
            foodPlanId: user.assignedFoodPlans?.[0]?._id || '',
          };
          return accumulator;
        }, {})
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    setWorkoutForm((prev) => ({
      ...prev,
      days: createDays(prev.numberOfDays),
    }));
  }, [workoutForm.numberOfDays]);

  const totalWorkoutsInDraft = useMemo(
    () => workoutForm.days.reduce((total, day) => total + day.workouts.filter((w) => w.title.trim()).length, 0),
    [workoutForm.days]
  );

  const overviewUsers = useMemo(
    () => (users || []).filter((entry) => entry.role !== 'admin'),
    [users]
  );

  const selectedOverviewDraft = useMemo(
    () => (selectedOverviewUser
      ? (assignmentDrafts[selectedOverviewUser._id] || { workoutPlanId: '', foodPlanId: '' })
      : { workoutPlanId: '', foodPlanId: '' }),
    [selectedOverviewUser, assignmentDrafts]
  );

  const selectedOverviewProgress = useMemo(
    () => (selectedOverviewUser
      ? getTodayProgressSummary(selectedOverviewUser)
      : { completedToday: 0, pendingToday: 0, skippedToday: 0 }),
    [selectedOverviewUser]
  );

  const addWorkoutToDay = (dayIndex) => {
    setWorkoutForm((prev) => {
      const updatedDays = [...prev.days];
      updatedDays[dayIndex] = {
        ...updatedDays[dayIndex],
        workouts: [...updatedDays[dayIndex].workouts, emptyWorkout()],
      };
      return { ...prev, days: updatedDays };
    });
  };

  const removeWorkoutFromDay = (dayIndex, workoutIndex) => {
    setWorkoutForm((prev) => {
      const updatedDays = [...prev.days];
      updatedDays[dayIndex] = {
        ...updatedDays[dayIndex],
        workouts: updatedDays[dayIndex].workouts.filter((_, index) => index !== workoutIndex),
      };
      return { ...prev, days: updatedDays };
    });
  };

  const handleSelectWorkoutVideo = (dayIndex, workoutIndex, videoId) => {
    const selectedVideo = videos.find((video) => video._id === videoId);

    setWorkoutForm((prev) => {
      const updatedDays = [...prev.days];
      const updatedWorkouts = [...updatedDays[dayIndex].workouts];
      const currentWorkout = updatedWorkouts[workoutIndex] || emptyWorkout();

      updatedWorkouts[workoutIndex] = {
        ...currentWorkout,
        selectedVideoId: videoId,
        title: selectedVideo?.title || '',
        videoUrl: selectedVideo?.youtubeId ? `https://www.youtube.com/watch?v=${selectedVideo.youtubeId}` : '',
        duration: selectedVideo?.duration || '',
        description: selectedVideo?.description || '',
      };

      updatedDays[dayIndex] = {
        ...updatedDays[dayIndex],
        workouts: updatedWorkouts,
      };

      return { ...prev, days: updatedDays };
    });
  };

  const handleCreatePlan = async (event) => {
    event.preventDefault();

    if (!workoutForm.name.trim()) {
      toast.error('Plan name is required');
      return;
    }

    const normalizedDays = workoutForm.days
      .map((day, index) => ({
        dayNumber: index + 1,
        workouts: day.workouts
          .map((workout) => ({
            title: workout.title.trim(),
            videoUrl: workout.videoUrl.trim(),
            duration: workout.duration.trim(),
            description: workout.description.trim(),
          }))
          .filter((workout) => workout.title),
      }))
      .filter((day) => day.workouts.length > 0);

    if (normalizedDays.length === 0) {
      toast.error('Add at least one workout per configured day');
      return;
    }

    setCreatingPlan(true);
    try {
      await adminAPI.createWorkoutPlan({
        name: workoutForm.name.trim(),
        type: workoutForm.type,
        days: normalizedDays,
      });

      toast.success('Workout plan created');
      setWorkoutForm({
        name: '',
        type: 'weekly',
        numberOfDays: 7,
        days: createDays(7),
      });
      await loadAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create workout plan');
    } finally {
      setCreatingPlan(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    setDeletingPlanId(planId);
    try {
      await adminAPI.deleteWorkoutPlan(planId);
      toast.success('Workout plan deleted');
      await loadAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete workout plan');
    } finally {
      setDeletingPlanId('');
    }
  };

  const handleSaveAssignment = async (userId) => {
    const draft = assignmentDrafts[userId] || { workoutPlanId: '', foodPlanId: '' };
    setSavingAssignmentUserId(userId);
    try {
      const { data: updatedUser } = await adminAPI.updateUserAssignments(userId, {
        workoutPlanId: draft.workoutPlanId || null,
        foodPlanIds: draft.foodPlanId ? [draft.foodPlanId] : [],
      });

      setUsers((prev) => prev.map((entry) => (entry._id === userId ? updatedUser : entry)));
      setAssignmentDrafts((prev) => ({
        ...prev,
        [userId]: {
          workoutPlanId: updatedUser.assignedWorkoutPlan?._id || '',
          foodPlanId: updatedUser.assignedFoodPlans?.[0]?._id || '',
        },
      }));

      if (selectedOverviewUser?._id === userId) {
        setSelectedOverviewUser(updatedUser);
      }

      toast.success('Assignments updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update assignments');
    } finally {
      setSavingAssignmentUserId('');
    }
  };

  const handleToggleUserAccess = async (user) => {
    if (!user?._id) {
      return;
    }

    setUpdatingAccessUserId(user._id);
    const nextIsActive = !user.isActive;

    try {
      const { data } = await adminAPI.updateUser(user._id, { isActive: nextIsActive });
      setUsers((prev) => prev.map((entry) => (entry._id === user._id ? { ...entry, ...data } : entry)));

      if (selectedOverviewUser?._id === user._id) {
        setSelectedOverviewUser((prev) => (prev ? { ...prev, ...data } : prev));
      }

      toast.success(nextIsActive ? 'Login permitted for user' : 'Login restricted for user');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update login access');
    } finally {
      setUpdatingAccessUserId('');
    }
  };

  if (loading) {
    return (
      <div className="admin-loader-screen">
        <div className="loader-ring" />
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-shell">
        <header className="admin-top-nav">
          <div className="admin-nav-title-wrap">
            <h1>Fitness Portal Admin Dashboard</h1>
            <p>Control user access, workout plans, and food plan assignments from one place.</p>
          </div>
          <nav className="admin-nav-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`admin-nav-tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </header>

        {activeTab === 'overview' && (
          <section className="admin-panel">
            <div className="admin-section-head">
              <div>
                <span className="admin-panel-tag">Platform Metrics</span>
                <h2>Dashboard Overview</h2>
              </div>
              <p>Core metrics for users, plans, and goal adoption.</p>
            </div>

            <div className="admin-metric-grid">
              {Object.entries(overview.metrics || {}).map(([key, value]) => (
                <article key={key} className="admin-metric-card">
                  <div className="admin-metric-icon">{cardIcons[key] || <BarChart3 size={18} />}</div>
                  <div>
                    <span className="admin-metric-label">{cardLabels[key] || key}</span>
                    <strong className="admin-metric-value">{value}</strong>
                  </div>
                </article>
              ))}
            </div>

            <div className="admin-goal-breakdown">
              <h3>
                <Target size={16} />
                Fitness Goal Breakdown
              </h3>
              <div className="admin-goal-grid">
                {Object.entries(overview.fitnessGoalBreakdown || {}).map(([goal, count]) => (
                  <div key={goal} className="admin-goal-chip">
                    <span>{goal.replace('_', ' ')}</span>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-user-rows-section">
              <div className="admin-user-rows-head">
                <h3>
                  <Users size={16} />
                  Users List
                </h3>
                <span>{overviewUsers.length} users</span>
              </div>

              {overviewUsers.length === 0 ? (
                <div className="admin-user-empty">No users available yet.</div>
              ) : (
                <div className="admin-user-rows-wrap">
                  <table className="admin-user-rows-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Goal</th>
                        <th>Level</th>
                        <th>Joined</th>
                        <th>Login Access</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overviewUsers.map((entry) => (
                        <tr key={entry._id} onClick={() => setSelectedOverviewUser(entry)}>
                          <td>{entry.firstName} {entry.lastName}</td>
                          <td>{String(entry.email || '').toLowerCase()}</td>
                          <td>{toTitleText(entry.fitnessGoal || 'general_fitness')}</td>
                          <td>{entry.fitnessLevel || 'beginner'}</td>
                          <td>{entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : '-'}</td>
                          <td>
                            <button
                              type="button"
                              className={`admin-access-toggle ${entry.isActive ? 'restrict' : 'permit'}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleToggleUserAccess(entry);
                              }}
                              disabled={updatingAccessUserId === entry._id}
                            >
                              {updatingAccessUserId === entry._id
                                ? 'Updating...'
                                : (entry.isActive ? 'Restrict' : 'Permit')}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'workout' && (
          <section className="admin-main-grid">
            <article className="admin-panel">
              <div className="admin-section-head">
                <div>
                  <span className="admin-panel-tag">Create Plan</span>
                  <h2>Workout Plans</h2>
                </div>
                <p>Build daily/weekly plans with dynamic multi-workout day structures.</p>
              </div>

              {videos.length === 0 && (
                <p className="admin-empty-video-note">Add workout videos first, then select them in each day.</p>
              )}

              <form className="admin-video-form" onSubmit={handleCreatePlan}>
                <input
                  type="text"
                  placeholder="Plan name"
                  value={workoutForm.name}
                  onChange={(event) => setWorkoutForm((prev) => ({ ...prev, name: event.target.value }))}
                />
                <div className="admin-video-form-split">
                  <select
                    value={workoutForm.type}
                    onChange={(event) => {
                      const type = event.target.value;
                      setWorkoutForm((prev) => ({
                        ...prev,
                        type,
                        numberOfDays: type === 'daily' ? 1 : Math.max(prev.numberOfDays, 7),
                      }));
                    }}
                  >
                    <option value="daily">Daily Plan</option>
                    <option value="weekly">Weekly Plan</option>
                  </select>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={workoutForm.numberOfDays}
                    onChange={(event) => {
                      const value = Number(event.target.value) || 1;
                      setWorkoutForm((prev) => ({
                        ...prev,
                        numberOfDays: prev.type === 'daily' ? 1 : value,
                      }));
                    }}
                    disabled={workoutForm.type === 'daily'}
                  />
                </div>

                <div className="admin-days-editor">
                  {workoutForm.days.map((day, dayIndex) => (
                    <section key={day.dayNumber} className="admin-day-card">
                      <div className="admin-day-head">
                        <h4>Day {day.dayNumber}</h4>
                        <button type="button" className="admin-secondary-button" onClick={() => addWorkoutToDay(dayIndex)}>
                          + Add Workout
                        </button>
                      </div>
                      <div className="admin-workout-list">
                        {day.workouts.map((workout, workoutIndex) => (
                          <div key={`${day.dayNumber}-${workoutIndex}`} className="admin-workout-item">
                            <select
                              value={workout.selectedVideoId || ''}
                              onChange={(event) => handleSelectWorkoutVideo(dayIndex, workoutIndex, event.target.value)}
                            >
                              <option value="">Select YouTube workout video</option>
                              {videos.map((video) => (
                                <option key={video._id} value={video._id}>
                                  {video.title}{video.duration ? ` (${video.duration})` : ''}
                                </option>
                              ))}
                            </select>

                            {workout.title && (
                              <div className="admin-workout-selected-meta">
                                <strong>{workout.title}</strong>
                                <span>{workout.duration || 'Duration not set'}</span>
                              </div>
                            )}

                            <div className="admin-workout-actions">
                              <button
                                type="button"
                                className="admin-danger-button"
                                onClick={() => removeWorkoutFromDay(dayIndex, workoutIndex)}
                              >
                                Remove
                              </button>
                              {workout.videoUrl && (
                                <a href={workout.videoUrl} target="_blank" rel="noopener noreferrer" className="admin-workout-open-link">
                                  Open Video
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>

                <div className="admin-form-footer">
                  <span>{workoutForm.days.length} days configured · {totalWorkoutsInDraft} workouts drafted</span>
                  <button type="submit" className="admin-primary-button" disabled={creatingPlan || videos.length === 0}>
                    {creatingPlan ? 'Creating...' : 'Create Workout Plan'}
                  </button>
                </div>
              </form>
            </article>

            <article className="admin-panel">
              <div className="admin-section-head">
                <div>
                  <span className="admin-panel-tag">Plan Library</span>
                  <h2>All Workout Plans</h2>
                </div>
                <p>Click a card to inspect workouts grouped by day.</p>
              </div>

              <div className="admin-plan-list">
                {workoutPlans.map((plan) => (
                  <article key={plan._id} className="admin-plan-card" onClick={() => setSelectedPlan(plan)}>
                    <h3>{plan.name}</h3>
                    <p>{plan.type === 'daily' ? 'Daily Plan' : 'Weekly Plan'}</p>
                    <div className="admin-plan-meta">
                      <span><Calendar size={12} /> {plan.numberOfDays || plan.days.length} days</span>
                      <span><Activity size={12} /> {plan.totalWorkouts || 0} workouts</span>
                    </div>
                    <button
                      type="button"
                      className="admin-danger-button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeletePlan(plan._id);
                      }}
                      disabled={deletingPlanId === plan._id}
                    >
                      {deletingPlanId === plan._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </article>
                ))}
              </div>
            </article>
          </section>
        )}

        {activeTab === 'food' && (
          <section className="admin-main-grid">
            <article className="admin-panel">
              <div className="admin-section-head">
                <div>
                  <span className="admin-panel-tag">Predefined Documents</span>
                  <h2>Food Plans</h2>
                </div>
                <p>Five structured food plans are maintained for assignment.</p>
              </div>

              <div className="admin-food-list">
                {foodPlans.map((plan) => (
                  <article key={plan._id} className="admin-food-card">
                    <h3>{plan.name}</h3>
                  </article>
                ))}
              </div>
            </article>

            <article className="admin-panel">
              <div className="admin-section-head">
                <div>
                  <span className="admin-panel-tag">User Assignment</span>
                  <h2>Assign Plans to Users</h2>
                </div>
                <p>Set workout and food plans per user profile.</p>
              </div>

              <div className="admin-assignment-list">
                {users.map((user) => {
                  const draft = assignmentDrafts[user._id] || { workoutPlanId: '', foodPlanId: '' };
                  return (
                    <article key={user._id} className="admin-assignment-card">
                      <div className="admin-assignment-head">
                        <h3>{user.firstName} {user.lastName}</h3>
                        <span>{user.fitnessGoal?.replace('_', ' ')}</span>
                      </div>

                      <label>
                        <span>Workout Plan</span>
                        <select
                          value={draft.workoutPlanId}
                          onChange={(event) => setAssignmentDrafts((prev) => ({
                            ...prev,
                            [user._id]: { ...prev[user._id], workoutPlanId: event.target.value },
                          }))}
                        >
                          <option value="">No workout plan</option>
                          {workoutPlans.map((plan) => (
                            <option key={plan._id} value={plan._id}>{plan.name}</option>
                          ))}
                        </select>
                      </label>

                      <label>
                        <span>Food Plan</span>
                        <select
                          value={draft.foodPlanId}
                          onChange={(event) => setAssignmentDrafts((prev) => ({
                            ...prev,
                            [user._id]: { ...prev[user._id], foodPlanId: event.target.value },
                          }))}
                        >
                          <option value="">No food plan</option>
                          {foodPlans.map((plan) => (
                            <option key={plan._id} value={plan._id}>{plan.name}</option>
                          ))}
                        </select>
                      </label>

                      <button
                        type="button"
                        className="admin-primary-button"
                        onClick={() => handleSaveAssignment(user._id)}
                        disabled={savingAssignmentUserId === user._id}
                      >
                        {savingAssignmentUserId === user._id ? 'Saving...' : 'Save Assignments'}
                      </button>
                    </article>
                  );
                })}
              </div>
            </article>
          </section>
        )}
      </div>

      <AnimatePresence>
        {selectedPlan && (
          <motion.div
            className="admin-plan-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPlan(null)}
          >
            <motion.div
              className="admin-plan-modal"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="admin-plan-modal-header">
                <h3 className="admin-plan-modal-title">{selectedPlan.name}</h3>
                <button className="admin-plan-modal-close" onClick={() => setSelectedPlan(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="admin-plan-detail-scroll">
                {selectedPlan.days.map((day) => (
                  <section key={`${selectedPlan._id}-day-${day.dayNumber}`} className="admin-day-detail">
                    <h4>Day {day.dayNumber}</h4>
                    {(day.workouts || []).map((workout) => (
                      <article key={workout._id} className="admin-day-workout-row">
                        <div>
                          <h5>{workout.title}</h5>
                          <p>{workout.description || 'No description provided'}</p>
                        </div>
                        <div className="admin-day-workout-meta">
                          <span>{workout.duration || '-'}</span>
                          {workout.videoUrl && (
                            <a href={workout.videoUrl} target="_blank" rel="noopener noreferrer">Open Video</a>
                          )}
                        </div>
                      </article>
                    ))}
                  </section>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedOverviewUser && (
          <motion.div
            className="admin-plan-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedOverviewUser(null)}
          >
            <motion.div
              className="admin-plan-modal admin-user-detail-modal"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="admin-plan-modal-header">
                <h3 className="admin-plan-modal-title">
                  {selectedOverviewUser.firstName} {selectedOverviewUser.lastName}
                </h3>
                <button className="admin-plan-modal-close" onClick={() => setSelectedOverviewUser(null)}>
                  <X size={18} />
                </button>
              </div>

              <div className="admin-plan-detail-scroll">
                <div className="admin-user-detail-grid">
                  <article className="admin-user-detail-card">
                    <h4>Profile</h4>
                    <ul>
                      <li><strong>Email:</strong> {String(selectedOverviewUser.email || '').toLowerCase()}</li>
                      <li><strong>Goal:</strong> {toTitleText(selectedOverviewUser.fitnessGoal || 'general_fitness')}</li>
                      <li><strong>Level:</strong> {selectedOverviewUser.fitnessLevel || 'beginner'}</li>
                      <li><strong>Weekly Goal:</strong> {selectedOverviewUser?.stats?.weeklyGoal || 0}</li>
                      <li><strong>Login:</strong> {selectedOverviewUser.isActive ? 'Permitted' : 'Restricted'}</li>
                    </ul>
                  </article>

                  <article className="admin-user-detail-card">
                    <h4>Assigned Plans</h4>
                    <ul>
                      <li><strong>Workout Plan:</strong> {selectedOverviewUser.assignedWorkoutPlan?.name || 'Not assigned'}</li>
                      <li>
                        <strong>Food Plan:</strong>{' '}
                        {Array.isArray(selectedOverviewUser.assignedFoodPlans) && selectedOverviewUser.assignedFoodPlans.length > 0
                          ? selectedOverviewUser.assignedFoodPlans.map((plan) => plan.name).join(', ')
                          : 'Not assigned'}
                      </li>
                    </ul>
                  </article>

                  <article className="admin-user-detail-card">
                    <h4>Today Progress Report</h4>
                    <ul>
                      <li><strong>Completed:</strong> {selectedOverviewProgress.completedToday}</li>
                      <li><strong>Pending:</strong> {selectedOverviewProgress.pendingToday}</li>
                      <li><strong>Skipped:</strong> {selectedOverviewProgress.skippedToday}</li>
                    </ul>
                  </article>

                  <article className="admin-user-detail-card">
                    <h4>Assign Plans (Quick)</h4>
                    <div className="admin-user-assignment-fields">
                      <label>
                        <span>Workout Plan</span>
                        <select
                          value={selectedOverviewDraft.workoutPlanId}
                          onChange={(event) => setAssignmentDrafts((prev) => ({
                            ...prev,
                            [selectedOverviewUser._id]: {
                              ...(prev[selectedOverviewUser._id] || { workoutPlanId: '', foodPlanId: '' }),
                              workoutPlanId: event.target.value,
                            },
                          }))}
                        >
                          <option value="">No workout plan</option>
                          {workoutPlans.map((plan) => (
                            <option key={plan._id} value={plan._id}>{plan.name}</option>
                          ))}
                        </select>
                      </label>

                      <label>
                        <span>Food Plan</span>
                        <select
                          value={selectedOverviewDraft.foodPlanId}
                          onChange={(event) => setAssignmentDrafts((prev) => ({
                            ...prev,
                            [selectedOverviewUser._id]: {
                              ...(prev[selectedOverviewUser._id] || { workoutPlanId: '', foodPlanId: '' }),
                              foodPlanId: event.target.value,
                            },
                          }))}
                        >
                          <option value="">No food plan</option>
                          {foodPlans.map((plan) => (
                            <option key={plan._id} value={plan._id}>{plan.name}</option>
                          ))}
                        </select>
                      </label>

                      <button
                        type="button"
                        className="admin-primary-button admin-user-assignment-save"
                        onClick={() => handleSaveAssignment(selectedOverviewUser._id)}
                        disabled={savingAssignmentUserId === selectedOverviewUser._id}
                      >
                        {savingAssignmentUserId === selectedOverviewUser._id ? 'Saving...' : 'Save Assignments'}
                      </button>
                    </div>
                  </article>

                  <article className="admin-user-detail-card">
                    <h4>Quick Stats</h4>
                    <ul>
                      <li><strong>Total Workouts:</strong> {selectedOverviewUser?.stats?.workoutsCompleted || 0}</li>
                      <li><strong>Current Streak:</strong> {selectedOverviewUser?.stats?.currentStreak || 0} days</li>
                      <li><strong>Calories Burned:</strong> {selectedOverviewUser?.stats?.totalCaloriesBurned || 0} kcal</li>
                      <li>
                        <strong>Weekly Progress:</strong>{' '}
                        {Math.min(
                          Math.round(
                            (((selectedOverviewUser?.stats?.workoutsCompleted || 0) % (selectedOverviewUser?.stats?.weeklyGoal || 4)) /
                              (selectedOverviewUser?.stats?.weeklyGoal || 4)) * 100
                          ),
                          100
                        )}%
                      </li>
                    </ul>
                  </article>
                </div>

                <div className="admin-user-detail-actions">
                  <button
                    type="button"
                    className={`admin-access-toggle ${selectedOverviewUser.isActive ? 'restrict' : 'permit'}`}
                    onClick={() => handleToggleUserAccess(selectedOverviewUser)}
                    disabled={updatingAccessUserId === selectedOverviewUser._id}
                  >
                    {updatingAccessUserId === selectedOverviewUser._id
                      ? 'Updating...'
                      : (selectedOverviewUser.isActive ? 'Restrict Login' : 'Permit Login')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
