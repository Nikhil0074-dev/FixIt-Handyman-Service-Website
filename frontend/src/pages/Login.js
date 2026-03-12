import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      const role = res.data.user.role;
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">🔧 FixIt</Link>
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="Your password" value={form.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="auth-demo">
          <p>Demo credentials:</p>
          <code>admin@handyman.com / admin123</code>
        </div>
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '', role: 'customer' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const { registerUser } = await import('../services/api');
      const res = await registerUser(form);
      login(res.data.token, res.data.user);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">🔧 FixIt</Link>
          <h1>Create Account</h1>
          <p>Join thousands of satisfied customers</p>
        </div>
        <div className="role-toggle">
          <button className={`role-btn ${form.role === 'customer' ? 'active' : ''}`} type="button" onClick={() => setForm({ ...form, role: 'customer' })}>
            👤 Customer
          </button>
          <button className={`role-btn ${form.role === 'provider' ? 'active' : ''}`} type="button" onClick={() => setForm({ ...form, role: 'provider' })}>
            🔧 Provider
          </button>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" name="phone" placeholder="+91 9876543210" value={form.phone} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Address</label>
            <input type="text" name="address" placeholder="Your city / area" value={form.address} onChange={handleChange} />
          </div>
          <button type="submit" className="btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating Account...' : `Sign Up as ${form.role === 'customer' ? 'Customer' : 'Provider'}`}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
