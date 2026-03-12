const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async findAll() {
    const [rows] = await db.query('SELECT user_id, name, email, phone, role, is_active, created_at FROM users ORDER BY created_at DESC');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(
      'SELECT user_id, name, email, phone, address, role, profile_image, is_active, created_at FROM users WHERE user_id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async create(userData) {
    const { name, email, password, phone, address, role } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone, address, role || 'customer']
    );
    return result.insertId;
  }

  static async update(id, data) {
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(data), id];
    const [result] = await db.query(`UPDATE users SET ${fields} WHERE user_id = ?`, values);
    return result.affectedRows;
  }

  static async comparePassword(plain, hashed) {
    return bcrypt.compare(plain, hashed);
  }

  static async toggleStatus(id) {
    await db.query('UPDATE users SET is_active = NOT is_active WHERE user_id = ?', [id]);
  }
}

module.exports = User;
