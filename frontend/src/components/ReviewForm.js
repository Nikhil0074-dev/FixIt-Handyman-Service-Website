import { useState } from 'react';
import { createReview } from '../services/api';
import toast from 'react-hot-toast';

const ReviewForm = ({ bookingId, providerId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { toast.error('Please select a rating'); return; }
    setLoading(true);
    try {
      await createReview({ booking_id: bookingId, provider_id: providerId, rating, feedback });
      toast.success('Review submitted! Thank you.');
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Rate Your Experience</h3>
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star ${star <= (hover || rating) ? 'filled' : ''}`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        placeholder="Share your experience (optional)"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows="3"
      />
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm;
