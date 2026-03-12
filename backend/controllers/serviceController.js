const Service = require('../models/Service');
const db = require('../config/database');

// GET /api/services
const getServices = async (req, res) => {
  try {
    const { category } = req.query;
    let services;
    if (category) {
      services = await Service.findByCategory(category);
    } else {
      services = await Service.findAll();
    }
    res.json({ success: true, services });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/services/:id
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    const providers = await Service.getProvidersByService(req.params.id);
    res.json({ success: true, service, providers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/services (Admin)
const createService = async (req, res) => {
  try {
    const id = await Service.create(req.body);
    const service = await Service.findById(id);
    res.status(201).json({ success: true, message: 'Service created', service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/services/:id (Admin)
const updateService = async (req, res) => {
  try {
    await Service.update(req.params.id, req.body);
    const service = await Service.findById(req.params.id);
    res.json({ success: true, message: 'Service updated', service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/services/:id (Admin)
const deleteService = async (req, res) => {
  try {
    await Service.delete(req.params.id);
    res.json({ success: true, message: 'Service deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/providers (all approved providers)
const getProviders = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT sp.*, u.name, u.email, u.phone, u.profile_image
       FROM service_providers sp
       JOIN users u ON sp.user_id = u.user_id
       WHERE sp.is_approved = TRUE
       ORDER BY sp.avg_rating DESC`
    );
    res.json({ success: true, providers: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: GET /api/admin/providers/pending
const getPendingProviders = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT sp.*, u.name, u.email, u.phone, u.created_at AS registered_at
       FROM service_providers sp
       JOIN users u ON sp.user_id = u.user_id
       WHERE sp.is_approved = FALSE`
    );
    res.json({ success: true, providers: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: PATCH /api/admin/providers/:id/approve
const approveProvider = async (req, res) => {
  try {
    await db.query('UPDATE service_providers SET is_approved = TRUE WHERE provider_id = ?', [req.params.id]);
    res.json({ success: true, message: 'Provider approved' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Provider: PUT /api/provider/profile
const updateProviderProfile = async (req, res) => {
  try {
    const { bio, experience_years, skills, services } = req.body;
    const [provRows] = await db.query('SELECT provider_id FROM service_providers WHERE user_id = ?', [req.user.id]);
    if (!provRows[0]) return res.status(404).json({ success: false, message: 'Provider profile not found' });

    const providerId = provRows[0].provider_id;
    await db.query(
      'UPDATE service_providers SET bio = ?, experience_years = ?, skills = ? WHERE provider_id = ?',
      [bio, experience_years, skills, providerId]
    );
    if (services && services.length > 0) {
      await db.query('DELETE FROM provider_services WHERE provider_id = ?', [providerId]);
      for (const svc of services) {
        await db.query('INSERT INTO provider_services (provider_id, service_id, custom_price) VALUES (?, ?, ?)',
          [providerId, svc.service_id, svc.custom_price || null]);
      }
    }
    res.json({ success: true, message: 'Provider profile updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getServices, getServiceById, createService, updateService, deleteService, getProviders, getPendingProviders, approveProvider, updateProviderProfile };
