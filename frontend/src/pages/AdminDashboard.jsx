import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Users,
  Video,
  Youtube,
} from 'lucide-react';
import { adminAPI } from '../services/api';
import './AdminDashboard.css';

const metricIcons = {
  totalUsers: <Users size={18} />,
  activeUsers: <Activity size={18} />,
  inactiveUsers: <ShieldCheck size={18} />,
  totalVideos: <Video size={18} />,
  activeVideos: <Youtube size={18} />,
  adminCount: <BarChart3 size={18} />,
};

const metricLabels = {
  totalUsers: 'Members',
  activeUsers: 'Active Accounts',
  inactiveUsers: 'Paused Accounts',
  totalVideos: 'Video Records',
  activeVideos: 'Live Videos',
  adminCount: 'Admin Accounts',
};

const emptyVideoForm = {
  title: '',
  youtubeUrl: '',
  category: '',
  duration: '',
  description: '',
};

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [userDrafts, setUserDrafts] = useState({});
  const [videos, setVideos] = useState([]);
  const [videoForm, setVideoForm] = useState(emptyVideoForm);
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState('');
  const [savingVideoId, setSavingVideoId] = useState('');
  const [creatingVideo, setCreatingVideo] = useState(false);
  const [deletingVideoId, setDeletingVideoId] = useState('');

  const syncUsers = (items) => {
    setUsers(items);
    setUserDrafts(
      items.reduce((accumulator, user) => {
        accumulator[user._id] = {
          isActive: Boolean(user.isActive),
          fitnessGoal: user.fitnessGoal,
          fitnessLevel: user.fitnessLevel,
          weeklyGoal: user.stats?.weeklyGoal ?? 4,
        };
        return accumulator;
      }, {})
    );
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [{ data: overviewData }, { data: userData }, { data: videoData }] = await Promise.all([
        adminAPI.getOverview(),
        adminAPI.getUsers(),
        adminAPI.getVideos(),
      ]);
      setOverview(overviewData);
      syncUsers(userData);
      setVideos(videoData);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUserDraftChange = (userId, field, value) => {
    setUserDrafts((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value,
      },
    }));
  };

  const handleSaveUser = async (userId) => {
    setSavingUserId(userId);
    try {
      const draft = userDrafts[userId];
      await adminAPI.updateUser(userId, {
        ...draft,
        weeklyGoal: Number(draft.weeklyGoal),
      });
      toast.success('User updated');
      await loadAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update user');
    } finally {
      setSavingUserId('');
    }
  };

  const handleCreateVideo = async (event) => {
    event.preventDefault();
    if (!videoForm.title.trim() || !videoForm.youtubeUrl.trim()) {
      toast.error('Title and YouTube link are required');
      return;
    }

    setCreatingVideo(true);
    try {
      await adminAPI.createVideo(videoForm);
      toast.success('Video added to the library');
      setVideoForm(emptyVideoForm);
      await loadAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to add video');
    } finally {
      setCreatingVideo(false);
    }
  };

  const handleVideoActiveToggle = async (video) => {
    setSavingVideoId(video._id);
    try {
      await adminAPI.updateVideo(video._id, { isActive: !video.isActive });
      toast.success(video.isActive ? 'Video hidden from members' : 'Video published to members');
      await loadAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update video');
    } finally {
      setSavingVideoId('');
    }
  };

  const handleDeleteVideo = async (videoId) => {
    setDeletingVideoId(videoId);
    try {
      await adminAPI.deleteVideo(videoId);
      toast.success('Video removed');
      await loadAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete video');
    } finally {
      setDeletingVideoId('');
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
      <div className="admin-grid-glow admin-grid-glow-a" />
      <div className="admin-grid-glow admin-grid-glow-b" />

      <div className="admin-dashboard-shell">
        <motion.section
          className="admin-hero"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <span className="admin-eyebrow">Admin Dashboard</span>
            <h1>Monitor users, control access, and publish workout videos.</h1>
            <p>
              This control panel separates admin work from the member experience. User accounts stay on the public app,
              while admins manage account status and the YouTube workout catalog here.
            </p>
          </div>
          <div className="admin-hero-meta">
            <div>
              <Clock3 size={16} />
              <span>{overview?.recentUsers?.length || 0} recent signups surfaced</span>
            </div>
            <div>
              <CheckCircle2 size={16} />
              <span>{overview?.metrics?.activeVideos || 0} videos currently live</span>
            </div>
          </div>
        </motion.section>

        <section className="admin-metric-grid">
          {Object.entries(overview?.metrics || {}).map(([key, value], index) => (
            <motion.article
              key={key}
              className="admin-metric-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <div className="admin-metric-icon">{metricIcons[key]}</div>
              <div>
                <span className="admin-metric-label">{metricLabels[key] || key}</span>
                <strong className="admin-metric-value">{value}</strong>
              </div>
            </motion.article>
          ))}
        </section>

        <div className="admin-main-grid">
          <section className="admin-panel admin-users-panel">
            <div className="admin-section-head">
              <div>
                <span className="admin-panel-tag">User Maintenance</span>
                <h2>Members</h2>
              </div>
              <p>Adjust weekly goals, fitness profile, or account status.</p>
            </div>

            <div className="admin-user-list">
              {users.map((user) => {
                const draft = userDrafts[user._id] || {};
                return (
                  <article key={user._id} className="admin-user-card">
                    <div className="admin-user-card-top">
                      <div>
                        <h3>{user.firstName} {user.lastName}</h3>
                        <p>{user.email}</p>
                      </div>
                      <span className={`admin-status-pill ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.role} · {user.isActive ? 'active' : 'inactive'}
                      </span>
                    </div>

                    <div className="admin-user-form-grid">
                      <label>
                        <span>Weekly goal</span>
                        <input
                          type="number"
                          min="1"
                          max="14"
                          value={draft.weeklyGoal ?? 4}
                          onChange={(event) => handleUserDraftChange(user._id, 'weeklyGoal', event.target.value)}
                        />
                      </label>
                      <label>
                        <span>Fitness goal</span>
                        <select
                          value={draft.fitnessGoal || 'general_fitness'}
                          onChange={(event) => handleUserDraftChange(user._id, 'fitnessGoal', event.target.value)}
                        >
                          <option value="general_fitness">General Fitness</option>
                          <option value="weight_loss">Weight Loss</option>
                          <option value="muscle_gain">Muscle Gain</option>
                          <option value="endurance">Endurance</option>
                          <option value="flexibility">Flexibility</option>
                        </select>
                      </label>
                      <label>
                        <span>Fitness level</span>
                        <select
                          value={draft.fitnessLevel || 'beginner'}
                          onChange={(event) => handleUserDraftChange(user._id, 'fitnessLevel', event.target.value)}
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </label>
                      <label className="admin-toggle-field">
                        <span>Account access</span>
                        <button
                          type="button"
                          className={`admin-toggle ${draft.isActive ? 'on' : ''}`}
                          onClick={() => handleUserDraftChange(user._id, 'isActive', !draft.isActive)}
                        >
                          <span />
                          {draft.isActive ? 'Enabled' : 'Disabled'}
                        </button>
                      </label>
                    </div>

                    <button
                      type="button"
                      className="admin-primary-button"
                      disabled={savingUserId === user._id}
                      onClick={() => handleSaveUser(user._id)}
                    >
                      {savingUserId === user._id ? 'Saving...' : 'Save User Changes'}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>

          <div className="admin-side-stack">
            <section className="admin-panel admin-videos-panel">
              <div className="admin-section-head">
                <div>
                  <span className="admin-panel-tag">Video Publishing</span>
                  <h2>Upload YouTube Link</h2>
                </div>
                <p>Add a full YouTube URL or just the video id.</p>
              </div>

              <form className="admin-video-form" onSubmit={handleCreateVideo}>
                <input
                  type="text"
                  value={videoForm.title}
                  onChange={(event) => setVideoForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Workout title"
                />
                <input
                  type="text"
                  value={videoForm.youtubeUrl}
                  onChange={(event) => setVideoForm((prev) => ({ ...prev, youtubeUrl: event.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <div className="admin-video-form-split">
                  <input
                    type="text"
                    value={videoForm.category}
                    onChange={(event) => setVideoForm((prev) => ({ ...prev, category: event.target.value }))}
                    placeholder="Category"
                  />
                  <input
                    type="text"
                    value={videoForm.duration}
                    onChange={(event) => setVideoForm((prev) => ({ ...prev, duration: event.target.value }))}
                    placeholder="Duration"
                  />
                </div>
                <textarea
                  value={videoForm.description}
                  onChange={(event) => setVideoForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Describe the workout"
                  rows="4"
                />

                <button type="submit" className="admin-primary-button" disabled={creatingVideo}>
                  {creatingVideo ? 'Publishing...' : 'Publish Video'}
                </button>
              </form>
            </section>

            <section className="admin-panel admin-library-panel">
              <div className="admin-section-head">
                <div>
                  <span className="admin-panel-tag">Video Library</span>
                  <h2>Current Videos</h2>
                </div>
                <p>Toggle availability or remove outdated links.</p>
              </div>

              <div className="admin-video-list">
                {videos.map((video) => (
                  <article key={video._id} className="admin-video-card">
                    <img
                      src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                      alt={video.title}
                    />
                    <div className="admin-video-card-body">
                      <div>
                        <h3>{video.title}</h3>
                        <p>{video.category || 'General'}{video.duration ? ` · ${video.duration}` : ''}</p>
                      </div>
                      <div className="admin-video-actions">
                        <button
                          type="button"
                          className={`admin-secondary-button ${video.isActive ? 'is-live' : ''}`}
                          onClick={() => handleVideoActiveToggle(video)}
                          disabled={savingVideoId === video._id}
                        >
                          {savingVideoId === video._id ? 'Updating...' : video.isActive ? 'Hide' : 'Publish'}
                        </button>
                        <button
                          type="button"
                          className="admin-danger-button"
                          onClick={() => handleDeleteVideo(video._id)}
                          disabled={deletingVideoId === video._id}
                        >
                          {deletingVideoId === video._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;