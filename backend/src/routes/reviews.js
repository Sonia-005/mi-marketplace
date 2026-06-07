const express = require('express');
const Review = require('../models/Review');
const Order = require('../models/Order');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/reviews — crear reseña (solo si la orden está completada y sin reseña previa)
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { orderId, rating, comment } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Orden no encontrada' });
    if (order.status !== 'completed') {
      return res.status(400).json({ message: 'Solo se puede reseñar órdenes completadas' });
    }
    if (order.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Solo el cliente puede dejar una reseña' });
    }

    const existing = await Review.findOne({ order: orderId });
    if (existing) return res.status(400).json({ message: 'Esta orden ya tiene una reseña' });

    const review = await Review.create({
      order: orderId,
      reviewer: req.user.id,
      reviewed: order.freelancer,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
});

// GET /api/reviews/freelancer/:userId — reseñas de un freelancer con datos del reviewer
router.get('/freelancer/:userId', async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewed: req.params.userId })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
