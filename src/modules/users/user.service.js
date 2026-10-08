import { User } from './user.model.js';
import { AppError } from '../../common/utils/AppError.js';

export function createUser(data) {
  return User.create({ name: data.name, email: data.email });
}

export async function listUsers({ page, limit }) {
  const [users, total] = await Promise.all([
    User.find().sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments(),
  ]);
  return { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function getUser(id) {
  const user = await User.findById(id).lean();
  if (!user) throw new AppError('User not found', 404);
  return user;
}

export async function updateUser(id, data) {
  const updates = {};
  if (Object.hasOwn(data, 'name')) updates.name = data.name;
  if (Object.hasOwn(data, 'email')) updates.email = data.email;
  const user = await User.findByIdAndUpdate(id, { $set: updates }, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
}

export async function deleteUser(id) {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new AppError('User not found', 404);
}
