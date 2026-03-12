import { useState, useEffect } from 'react';
import { getAdminStats, getAllUsers, getAllBookings, getPendingProviders, approveProvider, toggleUserStatus, createService, deleteService, getServices } from '../services/api';
import toast from 'react-hot-toast';

const Admin = () => {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newService, setNewService] = useState({ service_name: '', description: '', category: '', price: '', estimated_time: '', icon: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [sRes, uRes, bRes, pRes, svRes] = await Promise.all([
        getAdminStats(), getAllUsers(), getAllBookings(), getPendingProviders(), getServices()
      ]);
      setStats(sRes.data.stats);
      setUsers(uRes.data.users);
      setBookings(bRes.data.bookings);
      setProviders(pRes.data.providers);
      setServices(svRes.data.services);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try { await approveProvider(id); toast.success('Provider approved!'); loadData(); }
    catch { toast.error('Failed to approve'); }
  };

  const handleToggleUser = async (id) => {
    try { await toggleUserStatus(id); toast.success('Status toggled'); loadData(); }
    catch { toast.error('Failed to toggle status'); }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try { await createService(newService); toast.success('Service added!'); setNewService({ service_name: '', description: '', category: '', price: '', estimated_time: '', icon: '' }); loadData(); }
    catch { toast.error('Failed to add service'); }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Deactivate this service?')) return;
    try { await deleteService(id); toast.success('Service deactivated'); loadData(); }
    catch { toast.error('Failed'); }
  };

  if (loading) return <div className="loading-page">Loading admin panel...</div>;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Platform management & analytics</p>
      </div>

      <div className="admin-stats-grid">
        {[
          { label: 'Customers', value: stats?.total_customers, icon: '👥', color: '#3b82f6' },
          { label: 'Providers', value: stats?.total_providers, icon: '🔧', color: '#f97316' },
          { label: 'Completed Jobs', value: stats?.completed_bookings, icon: '✅', color: '#10b981' },
          { label: 'Revenue', value: `₹${Number(stats?.total_revenue || 0).toLocaleString('en-IN')}`, icon: '💰', color: '#8b5cf6' },
          { label: 'Pending Approvals', value: stats?.pending_approvals, icon: '⏳', color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="admin-stat-card" style={{ borderTopColor: s.color }}>
            <span className="admin-stat-icon">{s.icon}</span>
            <div className="admin-stat-value">{s.value}</div>
            <div className="admin-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="admin-tabs">
        {['overview', 'users', 'bookings', 'providers', 'services'].map(t => (
          <button key={t} className={`admin-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Users */}
      {tab === 'users' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.user_id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                  <td><span className={`status-dot ${u.is_active ? 'active' : 'inactive'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td><button className="table-action-btn" onClick={() => handleToggleUser(u.user_id)}>{u.is_active ? 'Deactivate' : 'Activate'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bookings */}
      {tab === 'bookings' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Service</th><th>Customer</th><th>Provider</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.booking_id}>
                  <td>#{b.booking_id}</td>
                  <td>{b.service_name}</td>
                  <td>{b.customer_name}</td>
                  <td>{b.provider_name}</td>
                  <td>{new Date(b.booking_date).toLocaleDateString('en-IN')}</td>
                  <td>₹{b.total_amount}</td>
                  <td><span className={`status-badge status-${b.status}`}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pending Providers */}
      {tab === 'providers' && (
        <div className="admin-table-wrap">
          <h3>{providers.length} Pending Approvals</h3>
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Registered</th><th>Action</th></tr></thead>
            <tbody>
              {providers.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No pending approvals 🎉</td></tr>
              ) : providers.map(p => (
                <tr key={p.provider_id}>
                  <td>{p.name}</td>
                  <td>{p.email}</td>
                  <td>{p.phone}</td>
                  <td>{new Date(p.registered_at).toLocaleDateString('en-IN')}</td>
                  <td><button className="btn-success btn-sm" onClick={() => handleApprove(p.provider_id)}>Approve</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Services Management */}
      {tab === 'services' && (
        <div className="services-admin">
          <h3>Manage Services</h3>
          <form className="add-service-form" onSubmit={handleAddService}>
            <h4>Add New Service</h4>
            <div className="form-row">
              <input placeholder="Service Name *" value={newService.service_name} onChange={e => setNewService({ ...newService, service_name: e.target.value })} required />
              <input placeholder="Category" value={newService.category} onChange={e => setNewService({ ...newService, category: e.target.value })} />
              <input placeholder="Price (₹) *" type="number" value={newService.price} onChange={e => setNewService({ ...newService, price: e.target.value })} required />
              <input placeholder="Est. Time (e.g. 1-2 hours)" value={newService.estimated_time} onChange={e => setNewService({ ...newService, estimated_time: e.target.value })} />
              <input placeholder="Icon Emoji" value={newService.icon} onChange={e => setNewService({ ...newService, icon: e.target.value })} />
            </div>
            <textarea placeholder="Description *" value={newService.description} onChange={e => setNewService({ ...newService, description: e.target.value })} rows="2" required />
            <button type="submit" className="btn-primary">Add Service</button>
          </form>
          <table className="admin-table">
            <thead><tr><th>Icon</th><th>Name</th><th>Category</th><th>Price</th><th>Est. Time</th><th>Action</th></tr></thead>
            <tbody>
              {services.map(s => (
                <tr key={s.service_id}>
                  <td>{s.icon}</td>
                  <td>{s.service_name}</td>
                  <td>{s.category}</td>
                  <td>₹{s.price}</td>
                  <td>{s.estimated_time}</td>
                  <td><button className="btn-danger btn-sm" onClick={() => handleDeleteService(s.service_id)}>Deactivate</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'overview' && (
        <div className="overview-message">
          <p>Select a tab above to manage users, bookings, providers, or services.</p>
        </div>
      )}
    </div>
  );
};

export default Admin;
