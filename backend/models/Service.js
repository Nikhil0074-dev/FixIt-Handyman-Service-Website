const db = require('../config/database');

class Service {
  static async findAll(activeOnly = true) {
    const query = activeOnly
      ? 'SELECT * FROM services WHERE is_active = TRUE ORDER BY service_name'
      : 'SELECT * FROM services ORDER BY service_name';
    const [rows] = await db.query(query);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM services WHERE service_id = ?', [id]);
    return rows[0];
  }

  static async findByCategory(category) {
    const [rows] = await db.query(
      'SELECT * FROM services WHERE category = ? AND is_active = TRUE',
      [category]
    );
    return rows;
  }

  static async create(data) {
    const { service_name, description, category, price, estimated_time, icon, image } = data;
    const [result] = await db.query(
      'INSERT INTO services (service_name, description, category, price, estimated_time, icon, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [service_name, description, category, price, estimated_time, icon, image]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(data), id];
    const [result] = await db.query(`UPDATE services SET ${fields} WHERE service_id = ?`, values);
    return result.affectedRows;
  }

  static async delete(id) {
    await db.query('UPDATE services SET is_active = FALSE WHERE service_id = ?', [id]);
  }

  static async getProvidersByService(serviceId) {
    const [rows] = await db.query(
      `SELECT sp.*, u.name, u.email, u.phone, u.profile_image, ps.custom_price
       FROM provider_services ps
       JOIN service_providers sp ON ps.provider_id = sp.provider_id
       JOIN users u ON sp.user_id = u.user_id
       WHERE ps.service_id = ? AND sp.is_approved = TRUE AND sp.is_available = TRUE`,
      [serviceId]
    );
    return rows;
  }
}

module.exports = Service;
