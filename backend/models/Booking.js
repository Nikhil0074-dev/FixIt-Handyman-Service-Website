const db = require('../config/database');

class Booking {
  static async findAll(filters = {}) {
    let query = `
      SELECT b.*, u.name AS customer_name, u.phone AS customer_phone,
             pu.name AS provider_name, s.service_name, s.icon
      FROM bookings b
      JOIN users u ON b.customer_id = u.user_id
      JOIN service_providers sp ON b.service_provider_id = sp.provider_id
      JOIN users pu ON sp.user_id = pu.user_id
      JOIN services s ON b.service_id = s.service_id
      WHERE 1=1
    `;
    const values = [];
    if (filters.customer_id) { query += ' AND b.customer_id = ?'; values.push(filters.customer_id); }
    if (filters.provider_id) { query += ' AND b.service_provider_id = ?'; values.push(filters.provider_id); }
    if (filters.status) { query += ' AND b.status = ?'; values.push(filters.status); }
    query += ' ORDER BY b.created_at DESC';
    const [rows] = await db.query(query, values);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT b.*, u.name AS customer_name, u.phone AS customer_phone, u.email AS customer_email,
              pu.name AS provider_name, pu.phone AS provider_phone,
              s.service_name, s.description AS service_desc, s.icon,
              p.payment_status, p.payment_method, p.transaction_id
       FROM bookings b
       JOIN users u ON b.customer_id = u.user_id
       JOIN service_providers sp ON b.service_provider_id = sp.provider_id
       JOIN users pu ON sp.user_id = pu.user_id
       JOIN services s ON b.service_id = s.service_id
       LEFT JOIN payments p ON p.booking_id = b.booking_id
       WHERE b.booking_id = ?`,
      [id]
    );
    return rows[0];
  }

  static async create(data) {
    const { customer_id, service_provider_id, service_id, booking_date, booking_time, address, notes, total_amount } = data;
    const [result] = await db.query(
      'INSERT INTO bookings (customer_id, service_provider_id, service_id, booking_date, booking_time, address, notes, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [customer_id, service_provider_id, service_id, booking_date, booking_time, address, notes, total_amount]
    );
    return result.insertId;
  }

  static async updateStatus(id, status, providerId = null) {
    if (providerId) {
      await db.query(
        'UPDATE bookings SET status = ? WHERE booking_id = ? AND service_provider_id = ?',
        [status, id, providerId]
      );
    } else {
      await db.query('UPDATE bookings SET status = ? WHERE booking_id = ?', [status, id]);
    }
  }

  static async getStats() {
    const [rows] = await db.query(`
      SELECT 
        COUNT(*) AS total,
        SUM(status = 'completed') AS completed,
        SUM(status = 'pending') AS pending,
        SUM(status = 'cancelled') AS cancelled,
        SUM(total_amount) AS total_revenue
      FROM bookings
    `);
    return rows[0];
  }
}

module.exports = Booking;
