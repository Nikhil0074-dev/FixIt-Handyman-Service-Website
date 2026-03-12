import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getServiceById } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BookingForm from '../components/BookingForm';
import ReviewForm from '../components/ReviewForm';
import { getBookingById, updateBookingStatus, createPayment } from '../services/api';
import toast from 'react-hot-toast';

export const BookingPage = () => {
  const { id: serviceId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    getServiceById(serviceId)
      .then((res) => {
        setService(res.data.service);
        setProviders(res.data.providers);
      })
      .catch(() => navigate('/services'))
      .finally(() => setLoading(false));
  }, [serviceId, user, navigate]);

  if (loading) return <div className="loading-page">Loading...</div>;

  return (
    <div className="booking-page">
      <div className="booking-layout">
        <div className="booking-form-container">
          <BookingForm service={service} providers={providers} />
        </div>
        <aside className="booking-sidebar">
          <div className="service-summary-card">
            <div className="service-summary-icon">{service?.icon}</div>
            <h3>{service?.service_name}</h3>
            <p>{service?.description}</p>
            <div className="summary-details">
              <div><span>Price</span><strong>₹{service?.price}</strong></div>
              <div><span>Duration</span><strong>{service?.estimated_time}</strong></div>
              <div><span>Available Pros</span><strong>{providers.length}</strong></div>
            </div>
          </div>
          <div className="trust-badges">
            <div className="trust-item">✅ Verified Professionals</div>
            <div className="trust-item">🔒 Secure Payment</div>
            <div className="trust-item">⭐ Satisfaction Guaranteed</div>
            <div className="trust-item">📞 24/7 Support</div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export const BookingDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [paying, setPaying] = useState(false);

  const loadBooking = () => {
    getBookingById(id).then((res) => setBooking(res.data.booking)).finally(() => setLoading(false));
  };

  useEffect(() => { loadBooking(); }, [id]);

  const handleStatusUpdate = async (status) => {
    try {
      await updateBookingStatus(id, status);
      toast.success('Status updated');
      loadBooking();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handlePayment = async (method) => {
    setPaying(true);
    try {
      await createPayment({ booking_id: id, payment_method: method });
      toast.success('Payment successful!');
      loadBooking();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  const statusSteps = ['pending', 'confirmed', 'on_the_way', 'in_progress', 'completed'];
  const statusLabels = { pending: '⏳ Pending', confirmed: '✅ Confirmed', on_the_way: '🚗 On the Way', in_progress: '🔧 In Progress', completed: '🎉 Completed', cancelled: '❌ Cancelled' };

  if (loading) return <div className="loading-page">Loading booking...</div>;
  if (!booking) return <div className="not-found">Booking not found</div>;

  const currentStep = statusSteps.indexOf(booking.status);

  return (
    <div className="booking-detail-page">
      <div className="booking-detail-header">
        <h1>Booking #{booking.booking_id}</h1>
        <span className={`status-badge status-${booking.status}`}>{statusLabels[booking.status]}</span>
      </div>

      {/* Progress Tracker */}
      {booking.status !== 'cancelled' && (
        <div className="status-tracker">
          {statusSteps.map((step, i) => (
            <div key={step} className={`tracker-step ${i <= currentStep ? 'done' : ''} ${i === currentStep ? 'active' : ''}`}>
              <div className="tracker-dot"></div>
              <span>{statusLabels[step]}</span>
              {i < statusSteps.length - 1 && <div className="tracker-line"></div>}
            </div>
          ))}
        </div>
      )}

      <div className="booking-detail-grid">
        <div className="booking-info-card">
          <h3>Service Details</h3>
          <div className="info-row"><span>Service</span><strong>{booking.icon} {booking.service_name}</strong></div>
          <div className="info-row"><span>Customer</span><strong>{booking.customer_name}</strong></div>
          <div className="info-row"><span>Provider</span><strong>{booking.provider_name}</strong></div>
          <div className="info-row"><span>Date</span><strong>{new Date(booking.booking_date).toLocaleDateString('en-IN', { dateStyle: 'long' })}</strong></div>
          <div className="info-row"><span>Time</span><strong>{booking.booking_time}</strong></div>
          <div className="info-row"><span>Address</span><strong>{booking.address}</strong></div>
          {booking.notes && <div className="info-row"><span>Notes</span><strong>{booking.notes}</strong></div>}
          <div className="info-row highlight"><span>Total</span><strong>₹{booking.total_amount}</strong></div>
        </div>

        <div className="booking-actions-card">
          {/* Payment */}
          {booking.status !== 'cancelled' && !booking.payment_status && (
            <div className="payment-section">
              <h3>Payment</h3>
              <p>Amount: <strong>₹{booking.total_amount}</strong></p>
              <div className="payment-methods">
                {['upi', 'credit_card', 'debit_card', 'cash'].map(method => (
                  <button key={method} className="payment-btn" onClick={() => handlePayment(method)} disabled={paying}>
                    {method === 'upi' ? '📱 UPI' : method === 'credit_card' ? '💳 Credit Card' : method === 'debit_card' ? '🏦 Debit Card' : '💵 Cash'}
                  </button>
                ))}
              </div>
            </div>
          )}
          {booking.payment_status && (
            <div className={`payment-status payment-${booking.payment_status}`}>
              ✅ Payment {booking.payment_status} • {booking.payment_method?.replace('_', ' ')} • TXN: {booking.transaction_id}
            </div>
          )}

          {/* Provider status controls */}
          {user?.role === 'provider' && booking.status !== 'completed' && booking.status !== 'cancelled' && (
            <div className="provider-controls">
              <h3>Update Status</h3>
              {booking.status === 'pending' && <button className="btn-primary" onClick={() => handleStatusUpdate('confirmed')}>Confirm Booking</button>}
              {booking.status === 'confirmed' && <button className="btn-primary" onClick={() => handleStatusUpdate('on_the_way')}>Mark On the Way</button>}
              {booking.status === 'on_the_way' && <button className="btn-primary" onClick={() => handleStatusUpdate('in_progress')}>Start Service</button>}
              {booking.status === 'in_progress' && <button className="btn-success" onClick={() => handleStatusUpdate('completed')}>Mark Completed</button>}
              <button className="btn-danger" onClick={() => handleStatusUpdate('cancelled')}>Cancel</button>
            </div>
          )}

          {/* Cancel (customer) */}
          {user?.role === 'customer' && booking.status === 'pending' && (
            <button className="btn-danger" onClick={() => handleStatusUpdate('cancelled')}>Cancel Booking</button>
          )}

          {/* Review */}
          {booking.status === 'completed' && user?.role === 'customer' && !showReview && (
            <button className="btn-outline" onClick={() => setShowReview(true)}>⭐ Leave a Review</button>
          )}
          {showReview && (
            <ReviewForm bookingId={booking.booking_id} providerId={booking.service_provider_id} onSuccess={() => setShowReview(false)} />
          )}
        </div>
      </div>
    </div>
  );
};
