const db = require('../config/database');

class Review {
  static async findByProvider(providerId) {
    const [rows] = await db.query(
      `SELECT r.*, u.name AS customer_name, u.profile_image, s.service_name
       FROM reviews r
       JOIN users u ON r.customer_id = u.user_id
       JOIN bookings b ON r.booking_id = b.booking_id
       JOIN services s ON b.service_id = s.service_id
       WHERE r.provider_id = ?
       ORDER BY r.created_at DESC`,
      [providerId]
    );
    return rows;
  }

  static async create(data) {
    const { booking_id, customer_id, provider_id, rating, feedback } = data;
    const [result] = await db.query(
      'INSERT INTO reviews (booking_id, customer_id, provider_id, rating, feedback) VALUES (?, ?, ?, ?, ?)',
      [booking_id, customer_id, provider_id, rating, feedback]
    );
    // Update provider average rating
    await db.query(
      `UPDATE service_providers SET 
        avg_rating = (SELECT AVG(rating) FROM reviews WHERE provider_id = ?),
        total_jobs = total_jobs + 1
       WHERE provider_id = ?`,
      [provider_id, provider_id]
    );
    return result.insertId;
  }

  static async checkExists(bookingId, customerId) {
    const [rows] = await db.query(
      'SELECT review_id FROM reviews WHERE booking_id = ? AND customer_id = ?',
      [bookingId, customerId]
    );
    return rows[0];
  }
}

module.exports = Review;
