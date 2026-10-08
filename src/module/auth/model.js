import mongoose from 'mongoose';

// Change these fields to match the user data your project needs.
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  // Store a password hash, never the plain password.
  passwordHash: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

export default User;
