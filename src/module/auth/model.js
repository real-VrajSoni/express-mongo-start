import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true, select: false },
  sessionTokenHash: { type: String, select: false },
  sessionExpiresAt: { type: Date, select: false },
  resetTokenHash: { type: String, select: false },
  resetTokenExpiresAt: { type: Date, select: false },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
