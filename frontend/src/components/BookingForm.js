import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBooking } from '../services/api';
import toast from 'react-hot-toast';

const BookingForm = ({ service, providers }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    service_provider_id: '',
    booking_date: '',
    booking_time: '',
    address: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.service_provider_id || !form.booking_date || !form.booking_time || !form.address) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const res = await createBooking({ ...form, service_id: service.service_id });
      toast.success('Booking created successfully!');
      navigate(`/bookings/${res.data.booking.booking_id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <h2 className="form-title">Book {service?.service_name}</h2>
      <p className="form-subtitle">Fill in the details to schedule your service</p>

      <div className="form-group">
        <label>Select Provider *</label>
        <select name="service_provider_id" value={form.service_provider_id} onChange={handleChange} required>
          <option value="">Choose a provider</option>
          {providers?.map((p) => (
            <option key={p.provider_id} value={p.provider_id}>
              {p.name} — ⭐ {p.avg_rating?.toFixed(1) || 'New'} ({p.total_jobs} jobs)
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Date *</label>
          <input type="date" name="booking_date" value={form.booking_date} onChange={handleChange} min={today} required />
        </div>
        <div className="form-group">
          <label>Time *</label>
          <input type="time" name="booking_time" value={form.booking_time} onChange={handleChange} required />
        </div>
      </div>

      <div className="form-group">
        <label>Service Address *</label>
        <textarea name="address" value={form.address} onChange={handleChange} placeholder="Enter full address" rows="3" required />
      </div>

      <div className="form-group">
        <label>Additional Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Any specific requirements..." rows="2" />
      </div>

      <div className="form-summary">
        <span>Total Amount</span>
        <span className="form-price">₹{service?.price}</span>
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Processing...' : 'Confirm Booking'}
      </button>
    </form>
  );
};

export default BookingForm;
