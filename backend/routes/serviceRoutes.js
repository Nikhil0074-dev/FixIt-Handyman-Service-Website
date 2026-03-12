const express = require('express');
const router = express.Router();
const { getServices, getServiceById, createService, updateService, deleteService, getProviders, getPendingProviders, approveProvider, updateProviderProfile } = require('../controllers/serviceController');
const { protect, adminOnly, providerOnly } = require('../middleware/authMiddleware');

router.get('/services', getServices);
router.get('/services/:id', getServiceById);
router.post('/services', protect, adminOnly, createService);
router.put('/services/:id', protect, adminOnly, updateService);
router.delete('/services/:id', protect, adminOnly, deleteService);

router.get('/providers', getProviders);
router.get('/admin/providers/pending', protect, adminOnly, getPendingProviders);
router.patch('/admin/providers/:id/approve', protect, adminOnly, approveProvider);
router.put('/provider/profile', protect, providerOnly, updateProviderProfile);

module.exports = router;
