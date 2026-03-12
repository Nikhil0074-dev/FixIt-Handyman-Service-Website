const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getProviderBookings, getBookingById, updateBookingStatus, getAllBookings } = require('../controllers/bookingController');
const { protect, adminOnly, providerOnly } = require('../middleware/authMiddleware');

router.post('/bookings', protect, createBooking);
router.get('/bookings', protect, getMyBookings);
router.get('/bookings/:id', protect, getBookingById);
router.patch('/bookings/:id/status', protect, updateBookingStatus);
router.get('/provider/bookings', protect, providerOnly, getProviderBookings);
router.get('/admin/bookings', protect, adminOnly, getAllBookings);

module.exports = router;
