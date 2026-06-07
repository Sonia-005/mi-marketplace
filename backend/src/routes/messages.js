const express = require('express');
const Message = require('../models/Message');
const Order = require('../models/Order');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Verifica que el usuario sea participante de la orden
const checkOrderAccess = async (orderId, userId) => {
  const order = await Order.findById(orderId);
  if (!order) return null;
  const isParticipant =
    order.client.toString() === userId || order.freelancer.toString() === userId;
  return isParticipant ? order : null;
};

// GET /api/messages/:orderId — historial de mensajes de una orden
router.get('/:orderId', authMiddleware, async (req, res, next) => {
  try {
    const order = await checkOrderAccess(req.params.orderId, req.user.id);
    if (!order) return res.status(403).json({ message: 'No tienes acceso a esta conversación' });

    const messages = await Message.find({ order: req.params.orderId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    next(err);
  }
});

// POST /api/messages — enviar mensaje
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { orderId, text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'El mensaje no puede estar vacío' });
    }

    const order = await checkOrderAccess(orderId, req.user.id);
    if (!order) return res.status(403).json({ message: 'No tienes acceso a esta conversación' });

    const message = await Message.create({ order: orderId, sender: req.user.id, text });
    const populated = await message.populate('sender', 'name avatar');

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
