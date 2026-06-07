const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['diseño', 'desarrollo', 'marketing', 'redacción', 'video', 'otro'],
    required: true,
  },
  price: { type: Number, required: true, min: 1 },
  deliveryDays: { type: Number, required: true, min: 1 },
  images: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Índice de texto para búsqueda por título y descripción
serviceSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Service', serviceSchema);
