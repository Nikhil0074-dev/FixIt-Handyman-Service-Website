import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyBookings, getProviderBookings, getNotifications, markNotificationsRead } from '../services/api';

const statusColors = {
  pending: '#f59e0b', confirmed: '#3b82f6', on_the_way: '#8b5cf6',
  in_progress: '#f97316', completed: '#10b981', cancelled: '#ef4444'
};
const statusLabels = {
  pending: '⏳ Pending', confirmed: '✅ Confirmed', on_the_way: '🚗 On Way',
  in_progress: '🔧 In Progress', completed: '🎉 Completed', cancelled: '❌ Cancelled'
};

const Dashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookingFn = user?.role === 'provider' ? getProviderBookings : getMyBookings;
        const [bRes, nRes] = await Promise.all([bookingFn(), getNotifications()]);
        setBookings(bRes.data.bookings);
        setNotifications(nRes.data.notifications);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleMarkRead = async () => {
    await markNotificationsRead();
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  const filtered = activeTab === 'all' ? bookings : bookings.filter(b => b.status === activeTab);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const stats = [
    { label: 'Total Bookings', value: bookings.length, icon: '📋' },
    { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, icon: '✅' },
    { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length, icon: '⏳' },
    { label: 'Total Spent', value: `₹${bookings.filter(b => b.status === 'completed').reduce((s, b) => s + Number(b.total_amount || 0), 0).toLocaleString('en-IN')}`, icon: '💰' },
  ];

  if (loading) return <div className="loading-page">Loading dashboard...</div>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Hello, {user?.name?.split(' ')[0]}! 👋</h1>
          <p>{user?.role === 'provider' ? 'Manage your service jobs' : 'Manage your bookings and services'}</p>
        </div>
        <Link to="/services" className="btn-primary">+ New Booking</Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-card-icon">{s.icon}</div>
            <div>
              <div className="stat-card-value">{s.value}</div>
              <div className="stat-card-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Bookings */}
        <div className="bookings-section">
          <div className="section-tabs">
            {['all', 'pending', 'confirmed', 'in_progress', 'completed'].map(tab => (
              <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab === 'all' ? 'All' : statusLabels[tab]}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <span>📭</span>
              <h3>No bookings found</h3>
              <Link to="/services" className="btn-primary">Book a Service</Link>
            </div>
          ) : (
            <div className="bookings-list">
              {filtered.map((b) => (
                <Link to={`/bookings/${b.booking_id}`} key={b.booking_id} className="booking-card">
                  <div className="booking-card-icon">{b.icon || '🔧'}</div>
                  <div className="booking-card-info">
                    <h4>{b.service_name}</h4>
                    <p>{user?.role === 'provider' ? `Customer: ${b.customer_name}` : `Provider: ${b.provider_name}`}</p>
                    <span className="booking-date">📅 {new Date(b.booking_date).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="booking-card-right">
                    <span className="booking-status" style={{ color: statusColors[b.status] }}>{statusLabels[b.status]}</span>
                    <span className="booking-amount">₹{b.total_amount}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <aside className="notifications-panel">
          <div className="panel-header">
            <h3>Notifications {unreadCount > 0 && <span className="badge">{unreadCount}</span>}</h3>
            {unreadCount > 0 && <button className="mark-read-btn" onClick={handleMarkRead}>Mark all read</button>}
          </div>
          {notifications.length === 0 ? (
            <p className="no-notifs">No notifications yet</p>
          ) : (
            notifications.map((n) => (
              <div key={n.notification_id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}>
                <div className="notif-dot"></div>
                <div>
                  <strong>{n.title}</strong>
                  <p>{n.message}</p>
                  <span>{new Date(n.created_at).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            ))
          )}
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
