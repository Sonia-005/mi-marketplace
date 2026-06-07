const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'freelancer', 'admin'], default: 'client' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: [{ type: String }],
  isActive: { type: Boolean, default: true },
  isBanned: { type: Boolean, default: false },
  totalOrders: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
