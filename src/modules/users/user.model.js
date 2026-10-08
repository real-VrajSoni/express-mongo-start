import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must contain at least 2 characters'],
    maxlength: [100, 'Name must contain at most 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    maxlength: 254,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email must be valid'],
    unique: true, // Creates a unique index; duplicate writes produce error 11000.
  },
}, { timestamps: true, versionKey: false });

export const User = mongoose.model('User', userSchema);
