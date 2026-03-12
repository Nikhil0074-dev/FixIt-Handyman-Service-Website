const express = require('express');
const router = express.Router();
const { createPayment, getPaymentByBooking, createReview, getNotifications, markNotificationsRead, getAdminStats } = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/payments', protect, createPayment);
router.get('/payments/booking/:bookingId', protect, getPaymentByBooking);
router.post('/reviews', protect, createReview);
router.get('/notifications', protect, getNotifications);
router.patch('/notifications/read', protect, markNotificationsRead);
router.get('/admin/stats', protect, adminOnly, getAdminStats);

module.exports = router;
