import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateProfile(form);
      setUser(res.data.user);
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-avatar">
            <span>{user?.name?.charAt(0).toUpperCase()}</span>
          </div>
          <h2>{user?.name}</h2>
          <span className={`role-badge role-${user?.role}`}>{user?.role}</span>
          <p className="profile-email">{user?.email}</p>
        </div>

        <div className="profile-form-card">
          <div className="form-card-header">
            <h3>Personal Information</h3>
            {!editing && <button className="btn-outline btn-sm" onClick={() => setEditing(true)}>Edit Profile</button>}
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows="3" />
              </div>
              <div className="form-row">
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                <button type="button" className="btn-outline" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <div className="info-row"><span>Name</span><strong>{user?.name}</strong></div>
              <div className="info-row"><span>Email</span><strong>{user?.email}</strong></div>
              <div className="info-row"><span>Phone</span><strong>{user?.phone || 'Not added'}</strong></div>
              <div className="info-row"><span>Address</span><strong>{user?.address || 'Not added'}</strong></div>
              <div className="info-row"><span>Member Since</span><strong>{new Date(user?.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}</strong></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
