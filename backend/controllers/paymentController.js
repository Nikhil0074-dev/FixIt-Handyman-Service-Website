const db = require('../config/database');

// POST /api/payments
const createPayment = async (req, res) => {
  try {
    const { booking_id, payment_method } = req.body;
    if (!booking_id || !payment_method) {
      return res.status(400).json({ success: false, message: 'booking_id and payment_method are required' });
    }

    const [bookings] = await db.query('SELECT * FROM bookings WHERE booking_id = ?', [booking_id]);
    if (!bookings[0]) return res.status(404).json({ success: false, message: 'Booking not found' });

    const booking = bookings[0];

    // Check for existing payment
    const [existing] = await db.query('SELECT * FROM payments WHERE booking_id = ? AND payment_status = "completed"', [booking_id]);
    if (existing[0]) return res.status(409).json({ success: false, message: 'Payment already completed' });

    // Simulate payment processing
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const paymentStatus = payment_method === 'cash' ? 'pending' : 'completed';

    const [result] = await db.query(
      'INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_id, paid_at) VALUES (?, ?, ?, ?, ?, ?)',
      [booking_id, booking.total_amount, payment_method, paymentStatus, transactionId, paymentStatus === 'completed' ? new Date() : null]
    );

    // Notify user
    await db.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [booking.customer_id, 'Payment Confirmation', `Payment of ₹${booking.total_amount} ${paymentStatus}. TXN: ${transactionId}`, 'payment']
    );

    res.status(201).json({
      success: true,
      message: 'Payment processed',
      payment: {
        payment_id: result.insertId,
        transaction_id: transactionId,
        amount: booking.total_amount,
        payment_status: paymentStatus,
        payment_method
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/payments/booking/:bookingId
const getPaymentByBooking = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM payments WHERE booking_id = ?', [req.params.bookingId]);
    res.json({ success: true, payment: rows[0] || null });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/reviews
const createReview = async (req, res) => {
  try {
    const { booking_id, provider_id, rating, feedback } = req.body;
    if (!booking_id || !provider_id || !rating) {
      return res.status(400).json({ success: false, message: 'booking_id, provider_id, and rating are required' });
    }
    const [existing] = await db.query(
      'SELECT review_id FROM reviews WHERE booking_id = ? AND customer_id = ?',
      [booking_id, req.user.id]
    );
    if (existing[0]) return res.status(409).json({ success: false, message: 'Review already submitted' });

    const [result] = await db.query(
      'INSERT INTO reviews (booking_id, customer_id, provider_id, rating, feedback) VALUES (?, ?, ?, ?, ?)',
      [booking_id, req.user.id, provider_id, rating, feedback]
    );
    await db.query(
      `UPDATE service_providers SET avg_rating = (SELECT AVG(rating) FROM reviews WHERE provider_id = ?) WHERE provider_id = ?`,
      [provider_id, provider_id]
    );
    res.status(201).json({ success: true, message: 'Review submitted', review_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );
    res.json({ success: true, notifications: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/notifications/read
const markNotificationsRead = async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: GET /api/admin/stats
const getAdminStats = async (req, res) => {
  try {
    const [[users]] = await db.query('SELECT COUNT(*) AS total FROM users WHERE role = "customer"');
    const [[providers]] = await db.query('SELECT COUNT(*) AS total FROM service_providers WHERE is_approved = TRUE');
    const [[bookings]] = await db.query('SELECT COUNT(*) AS total, SUM(total_amount) AS revenue FROM bookings WHERE status = "completed"');
    const [[pending]] = await db.query('SELECT COUNT(*) AS total FROM service_providers WHERE is_approved = FALSE');

    res.json({
      success: true,
      stats: {
        total_customers: users.total,
        total_providers: providers.total,
        completed_bookings: bookings.total,
        total_revenue: bookings.revenue || 0,
        pending_approvals: pending.total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createPayment, getPaymentByBooking, createReview, getNotifications, markNotificationsRead, getAdminStats };
