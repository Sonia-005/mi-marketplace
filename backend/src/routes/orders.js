const express = require('express');
const Order = require('../models/Order');
const Service = require('../models/Service');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// POST /api/orders — contratar servicio (solo clientes)
router.post('/', authMiddleware, roleMiddleware('client'), async (req, res, next) => {
  try {
    const { serviceId, requirements } = req.body;

    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
      return res.status(404).json({ message: 'Servicio no encontrado o inactivo' });
    }

    const order = await Order.create({
      client: req.user.id,
      freelancer: service.freelancer,
      service: service._id,
      price: service.price,
      requirements: requirements || '',
    });

    const populated = await order.populate(['service', 'freelancer', 'client']);
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/my — mis órdenes según el rol
router.get('/my', authMiddleware, async (req, res, next) => {
  try {
    const filter = req.user.role === 'client'
      ? { client: req.user.id }
      : { freelancer: req.user.id };

    const orders = await Order.find(filter)
      .populate('service', 'title images')
      .populate('client', 'name avatar')
      .populate('freelancer', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id — detalle de una orden
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('service', 'title images deliveryDays')
      .populate('client', 'name avatar email')
      .populate('freelancer', 'name avatar email');

    if (!order) return res.status(404).json({ message: 'Orden no encontrada' });

    const isParticipant =
      order.client._id.toString() === req.user.id ||
      order.freelancer._id.toString() === req.user.id;

    if (!isParticipant) {
      return res.status(403).json({ message: 'No tienes acceso a esta orden' });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/orders/:id/status — actualizar estado según reglas de rol
router.patch('/:id/status', authMiddleware, async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Orden no encontrada' });

    const isClient = order.client.toString() === req.user.id;
    const isFreelancer = order.freelancer.toString() === req.user.id;

    if (!isClient && !isFreelancer) {
      return res.status(403).json({ message: 'No tienes acceso a esta orden' });
    }

    // Reglas: freelancer acepta (pending→in_progress) y completa (in_progress→completed); cliente cancela
    const allowedTransitions = {
      freelancer: {
        pending: ['in_progress'],
        in_progress: ['completed'],
      },
      client: {
        pending: ['cancelled'],
        in_progress: ['cancelled'],
      },
    };

    const role = isFreelancer ? 'freelancer' : 'client';
    const allowed = allowedTransitions[role][order.status] || [];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Transición de estado no permitida: ${order.status} → ${status}` });
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
