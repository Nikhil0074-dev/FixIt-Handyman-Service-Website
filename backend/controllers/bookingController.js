const Booking = require('../models/Booking');
const db = require('../config/database');

// POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { service_provider_id, service_id, booking_date, booking_time, address, notes } = req.body;
    if (!service_provider_id || !service_id || !booking_date || !booking_time || !address) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const [svc] = await db.query('SELECT price FROM services WHERE service_id = ?', [service_id]);
    const total_amount = svc[0]?.price || 0;

    const bookingId = await Booking.create({
      customer_id: req.user.id,
      service_provider_id,
      service_id,
      booking_date,
      booking_time,
      address,
      notes,
      total_amount
    });

    // Create notification
    await db.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [req.user.id, 'Booking Requested', `Your booking #${bookingId} has been submitted`, 'booking']
    );

    const booking = await Booking.findById(bookingId);
    res.status(201).json({ success: true, message: 'Booking created', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/bookings (customer sees their bookings)
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({ customer_id: req.user.id });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/provider/bookings (provider sees assigned bookings)
const getProviderBookings = async (req, res) => {
  try {
    const [provRows] = await db.query('SELECT provider_id FROM service_providers WHERE user_id = ?', [req.user.id]);
    if (!provRows[0]) return res.status(404).json({ success: false, message: 'Provider not found' });
    const bookings = await Booking.findAll({ provider_id: provRows[0].provider_id });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/bookings/:id
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/bookings/:id/status
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'on_the_way', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    let providerId = null;
    if (req.user.role === 'provider') {
      const [provRows] = await db.query('SELECT provider_id FROM service_providers WHERE user_id = ?', [req.user.id]);
      providerId = provRows[0]?.provider_id;
    }
    await Booking.updateStatus(req.params.id, status, providerId);

    // Notify customer
    const booking = await Booking.findById(req.params.id);
    const statusMessages = {
      confirmed: 'Your booking has been confirmed!',
      on_the_way: 'Your technician is on the way!',
      in_progress: 'Service is currently in progress',
      completed: 'Service has been completed',
      cancelled: 'Your booking has been cancelled'
    };
    if (statusMessages[status]) {
      await db.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [booking.customer_id, 'Booking Update', statusMessages[status], 'booking']
      );
    }
    res.json({ success: true, message: 'Booking status updated', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: GET /api/admin/bookings
const getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const bookings = await Booking.findAll(status ? { status } : {});
    const stats = await Booking.getStats();
    res.json({ success: true, bookings, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createBooking, getMyBookings, getProviderBookings, getBookingById, updateBookingStatus, getAllBookings };
