import mongoose from 'mongoose';
import { AppError } from '../../common/utils/AppError.js';

export function validateUserId(req, res, next, id) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    throw new AppError('Invalid user ID', 400);
  }
  next();
}

export function validateUserBody({ partial = false } = {}) {
  return (req, res, next) => {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new AppError('A JSON object body is required', 400);
    }
    const fields = Object.keys(body);
    if (!fields.length || fields.some((field) => !['name', 'email'].includes(field))) {
      throw new AppError('Provide only name and email fields', 400);
    }
    if (!partial && (!Object.hasOwn(body, 'name') || !Object.hasOwn(body, 'email'))) {
      throw new AppError('Name and email are required', 400);
    }
    for (const field of fields) {
      if (typeof body[field] !== 'string' || !body[field].trim()) {
        throw new AppError(`${field} must be a non-empty string`, 400);
      }
    }
    // Mongoose performs length and email validation when writing the document.
    next();
  };
}

export function parsePagination(query) {
  const page = parsePositiveInteger(query.page, 'page', 1);
  const limit = parsePositiveInteger(query.limit, 'limit', 10);
  if (limit > 100) throw new AppError('limit cannot exceed 100', 400);
  if (!Number.isSafeInteger((page - 1) * limit)) {
    throw new AppError('page is too large', 400);
  }
  return { page, limit };
}

function parsePositiveInteger(value, field, fallback) {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    throw new AppError(`${field} must be a positive integer`, 400);
  }
  const number = Number(value);
  if (!Number.isSafeInteger(number)) throw new AppError(`${field} is too large`, 400);
  return number;
}
