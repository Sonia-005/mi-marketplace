const express = require('express');
const User = require('../models/User');
const Service = require('../models/Service');
const Review = require('../models/Review');
const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');

const router = express.Router();

// GET /api/users/profile/:id — perfil público de un freelancer con servicios y rating
router.get('/profile/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const services = await Service.find({ freelancer: req.params.id, isActive: true });
    const reviews = await Review.find({ reviewed: req.params.id });

    const avgRating = reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    res.json({ user, services, avgRating, totalReviews: reviews.length });
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/me — editar mi propio perfil
router.put('/me', authMiddleware, upload.single('avatar'), async (req, res, next) => {
  try {
    const { name, bio, skills } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (skills) updates.skills = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim());
    if (req.file) updates.avatar = req.file.path;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
