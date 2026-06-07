const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Service = require('../models/Service');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Category = require('../models/Category');
const Report = require('../models/Report');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Todas las rutas de admin requieren autenticación y rol admin
router.use(authMiddleware, roleMiddleware('admin'));

// ── STATS ─────────────────────────────────────────────────────────────────────

// GET /api/admin/stats — métricas generales de la plataforma
router.get('/stats', async (req, res, next) => {
  try {
    const [totalUsers, totalServices, totalOrders, revenueResult, recentOrders, ordersByStatus] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      Service.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$price' } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('client', 'name')
        .populate('freelancer', 'name')
        .populate('service', 'title'),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      totalUsers,
      totalServices,
      totalOrders,
      totalRevenue: revenueResult[0]?.total || 0,
      recentOrders,
      ordersByStatus,
    });
  } catch (err) {
    next(err);
  }
});

// ── USERS ─────────────────────────────────────────────────────────────────────

// GET /api/admin/users — lista con filtros y paginación
router.get('/users', async (req, res, next) => {
  try {
    const { role, isBanned, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isBanned !== undefined) filter.isBanned = isBanned === 'true';
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({ users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/users/:id — editar cualquier usuario
router.put('/users/:id', async (req, res, next) => {
  try {
    const { name, role, isBanned, isActive, bio, skills } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (role !== undefined) updates.role = role;
    if (isBanned !== undefined) updates.isBanned = isBanned;
    if (isActive !== undefined) updates.isActive = isActive;
    if (bio !== undefined) updates.bio = bio;
    if (skills !== undefined) updates.skills = skills;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/users/:id — eliminar usuario
router.delete('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    next(err);
  }
});

// ── SERVICES ──────────────────────────────────────────────────────────────────

// GET /api/admin/services — todos los servicios con filtros
router.get('/services', async (req, res, next) => {
  try {
    const { category, isActive, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    const [services, total] = await Promise.all([
      Service.find(filter).populate('freelancer', 'name email').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Service.countDocuments(filter),
    ]);

    res.json({ services, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/services/:id — editar cualquier servicio
router.put('/services/:id', async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) return res.status(404).json({ message: 'Servicio no encontrado' });
    res.json(service);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/services/:id — eliminar servicio permanentemente
router.delete('/services/:id', async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: 'Servicio no encontrado' });
    res.json({ message: 'Servicio eliminado correctamente' });
  } catch (err) {
    next(err);
  }
});

// ── ORDERS ────────────────────────────────────────────────────────────────────

// GET /api/admin/orders — todas las órdenes con filtros
router.get('/orders', async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('client', 'name email')
        .populate('freelancer', 'name email')
        .populate('service', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/orders/:id — cambiar estado de cualquier orden
router.put('/orders/:id', async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('client', 'name')
      .populate('freelancer', 'name')
      .populate('service', 'title');
    if (!order) return res.status(404).json({ message: 'Orden no encontrada' });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

// ── CATEGORIES ────────────────────────────────────────────────────────────────

// GET /api/admin/categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/categories
router.post('/categories', async (req, res, next) => {
  try {
    const { name, icon, description } = req.body;
    const category = await Category.create({ name, icon, description });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/categories/:id
router.put('/categories/:id', async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ message: 'Categoría no encontrada' });
    res.json(category);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/categories/:id
router.delete('/categories/:id', async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Categoría no encontrada' });
    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (err) {
    next(err);
  }
});

// ── REPORTS ───────────────────────────────────────────────────────────────────

// GET /api/admin/reports
router.get('/reports', async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const reports = await Report.find(filter)
      .populate('reporter', 'name email')
      .populate('reported', 'name email')
      .populate('service', 'title')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/reports/:id — marcar como revisado o resuelto
router.put('/reports/:id', async (req, res, next) => {
  try {
    const { status } = req.body;
    const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('reporter', 'name email')
      .populate('reported', 'name email');
    if (!report) return res.status(404).json({ message: 'Reporte no encontrado' });
    res.json(report);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
