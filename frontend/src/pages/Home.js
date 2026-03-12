import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getServices } from '../services/api';
import ServiceCard from '../components/ServiceCard';

const Home = () => {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getServices().then((res) => setServices(res.data.services)).catch(() => {});
  }, []);

  const stats = [
    { value: '500+', label: 'Expert Technicians' },
    { value: '10K+', label: 'Happy Customers' },
    { value: '50+', label: 'Service Types' },
    { value: '4.9★', label: 'Average Rating' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/services?search=${search}`);
  };

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🏆 #1 Home Services Platform</div>
          <h1 className="hero-title">
            Your Home,<br />
            <span className="hero-accent">Fixed Right.</span>
          </h1>
          <p className="hero-subtitle">
            Trusted professionals for every home repair need. Book in minutes, get it done today.
          </p>
          <form className="hero-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="What needs fixing? (e.g. plumbing, electrical...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
          <div className="hero-tags">
            {['Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Painting'].map(tag => (
              <span key={tag} className="hero-tag" onClick={() => navigate(`/services?category=${tag.toLowerCase()}`)}>{tag}</span>
            ))}
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card-float card-1">
            <span>⚡</span>
            <div>
              <strong>Electrical</strong>
              <span>From ₹599</span>
            </div>
          </div>
          <div className="hero-card-float card-2">
            <span>✅</span>
            <div>
              <strong>Booking Confirmed!</strong>
              <span>Today, 3:00 PM</span>
            </div>
          </div>
          <div className="hero-card-float card-3">
            <span>⭐</span>
            <div>
              <strong>4.9/5 Rating</strong>
              <span>10K+ Reviews</span>
            </div>
          </div>
          <div className="hero-illustration">
            <div className="hero-blob"></div>
            <div className="hero-icon-grid">
              {['🔧', '⚡', '🧹', '🔨', '🎨', '❄️', '🪲', '🛠️'].map((icon, i) => (
                <div key={i} className="hero-grid-icon">{icon}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-bar">
        {stats.map((s, i) => (
          <div key={i} className="stat-item">
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Services */}
      <section className="section services-section">
        <div className="section-header">
          <h2>Popular Services</h2>
          <Link to="/services" className="see-all">View All →</Link>
        </div>
        <div className="services-grid">
          {services.slice(0, 6).map((s) => (
            <ServiceCard key={s.service_id} service={s} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="section how-it-works">
        <h2>How It Works</h2>
        <div className="steps-grid">
          {[
            { icon: '🔍', step: '01', title: 'Browse Services', desc: 'Explore hundreds of home services and find exactly what you need' },
            { icon: '📅', step: '02', title: 'Book Instantly', desc: 'Choose your preferred date, time and trusted provider' },
            { icon: '🚗', step: '03', title: 'Expert Arrives', desc: 'Your verified professional arrives on time with all equipment' },
            { icon: '✅', step: '04', title: 'Job Done!', desc: 'Service completed to perfection. Rate your experience' },
          ].map((item, i) => (
            <div key={i} className="step-card">
              <div className="step-number">{item.step}</div>
              <div className="step-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join 10,000+ homeowners who trust FixIt for all their repair needs</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn-primary">Book a Service</Link>
            <Link to="/register?role=provider" className="btn-outline">Become a Provider</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
