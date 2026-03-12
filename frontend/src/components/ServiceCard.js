import { useNavigate } from 'react-router-dom';

const ServiceCard = ({ service }) => {
  const navigate = useNavigate();

  return (
    <div className="service-card" onClick={() => navigate(`/services/${service.service_id}`)}>
      <div className="service-icon">{service.icon || '🔧'}</div>
      <div className="service-info">
        <h3 className="service-name">{service.service_name}</h3>
        <p className="service-desc">{service.description}</p>
        <div className="service-meta">
          <span className="service-price">₹{service.price}</span>
          <span className="service-time">⏱ {service.estimated_time}</span>
        </div>
      </div>
      <button className="service-book-btn">Book Now →</button>
    </div>
  );
};

export default ServiceCard;
