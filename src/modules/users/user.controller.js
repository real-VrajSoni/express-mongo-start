import * as userService from './user.service.js';
import { parsePagination } from './user.validation.js';

export async function createUser(req, res) {
  const user = await userService.createUser(req.body);
  res.status(201).json({ success: true, data: user });
}

export async function listUsers(req, res) {
  const { users, pagination } = await userService.listUsers(parsePagination(req.query));
  res.json({ success: true, data: users, pagination });
}

export async function getUser(req, res) {
  const user = await userService.getUser(req.params.id);
  res.json({ success: true, data: user });
}

export async function updateUser(req, res) {
  const user = await userService.updateUser(req.params.id, req.body);
  res.json({ success: true, data: user });
}

export async function deleteUser(req, res) {
  await userService.deleteUser(req.params.id);
  res.status(204).end();
}
