const express = require('express');
const Service = require('../models/Service');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { upload } = require('../middleware/upload');

const router = express.Router();

// GET /api/services — listar todos con filtros opcionales
router.get('/', async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, search } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const services = await Service.find(filter)
      .populate('freelancer', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(services);
  } catch (err) {
    next(err);
  }
});

// GET /api/services/:id — detalle de un servicio
router.get('/:id', async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate('freelancer', 'name avatar bio skills');
    if (!service) return res.status(404).json({ message: 'Servicio no encontrado' });
    res.json(service);
  } catch (err) {
    next(err);
  }
});

// POST /api/services — crear servicio (solo freelancers)
router.post('/', authMiddleware, roleMiddleware('freelancer'), upload.array('images', 5), async (req, res, next) => {
  try {
    const { title, description, category, price, deliveryDays } = req.body;
    const images = req.files ? req.files.map((f) => f.path) : [];

    const service = await Service.create({
      freelancer: req.user.id,
      title,
      description,
      category,
      price: Number(price),
      deliveryDays: Number(deliveryDays),
      images,
    });

    res.status(201).json(service);
  } catch (err) {
    next(err);
  }
});

// PUT /api/services/:id — editar servicio (solo el dueño)
router.put('/:id', authMiddleware, roleMiddleware('freelancer'), upload.array('images', 5), async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Servicio no encontrado' });
    if (service.freelancer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso para editar este servicio' });
    }

    const { title, description, category, price, deliveryDays } = req.body;
    const newImages = req.files ? req.files.map((f) => f.path) : [];

    service.title = title || service.title;
    service.description = description || service.description;
    service.category = category || service.category;
    service.price = price ? Number(price) : service.price;
    service.deliveryDays = deliveryDays ? Number(deliveryDays) : service.deliveryDays;
    if (newImages.length > 0) service.images = newImages;

    await service.save();
    res.json(service);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/services/:id — desactivar servicio (solo el dueño)
router.delete('/:id', authMiddleware, roleMiddleware('freelancer'), async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Servicio no encontrado' });
    if (service.freelancer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso para desactivar este servicio' });
    }

    service.isActive = false;
    await service.save();
    res.json({ message: 'Servicio desactivado correctamente' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
