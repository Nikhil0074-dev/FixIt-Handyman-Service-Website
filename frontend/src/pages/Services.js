import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getServices } from '../services/api';
import ServiceCard from '../components/ServiceCard';

const categories = ['All', 'plumbing', 'electrical', 'cleaning', 'carpentry', 'appliance', 'painting', 'pest'];

const Services = () => {
  const [services, setServices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';

  useEffect(() => {
    getServices()
      .then((res) => {
        setServices(res.data.services);
        setFiltered(res.data.services);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = services;
    if (activeCategory !== 'All') {
      result = result.filter(s => s.category === activeCategory);
    }
    if (search) {
      result = result.filter(s => s.service_name.toLowerCase().includes(search.toLowerCase()));
    }
    setFiltered(result);
  }, [activeCategory, search, services]);

  return (
    <div className="services-page">
      <div className="page-hero">
        <h1>Our Services</h1>
        <p>Professional home services delivered to your doorstep</p>
      </div>

      <div className="services-layout">
        <aside className="services-sidebar">
          <h3>Categories</h3>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'All' ? '🏠 All Services' : `${getCategoryIcon(cat)} ${capitalize(cat)}`}
            </button>
          ))}
        </aside>

        <main className="services-main">
          {loading ? (
            <div className="loading-grid">
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton-card" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <span>🔍</span>
              <h3>No services found</h3>
              <p>Try a different category or search term</p>
            </div>
          ) : (
            <>
              <p className="results-count">{filtered.length} services found</p>
              <div className="services-grid">
                {filtered.map((s) => <ServiceCard key={s.service_id} service={s} />)}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

const getCategoryIcon = (cat) => {
  const icons = { plumbing: '🔧', electrical: '⚡', cleaning: '🧹', carpentry: '🔨', appliance: '🛠️', painting: '🎨', pest: '🪲' };
  return icons[cat] || '🔧';
};

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default Services;
