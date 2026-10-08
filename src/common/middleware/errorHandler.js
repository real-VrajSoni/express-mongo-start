import { AppError } from '../utils/AppError.js';

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  let status = 500;
  let message = 'Internal server error';

  if (error instanceof AppError) {
    status = error.statusCode;
    message = error.message;
  } else if (error.name === 'ValidationError') {
    status = 400;
    message = Object.values(error.errors).map((item) => item.message).join('; ');
  } else if (error.name === 'CastError') {
    status = 400;
    message = 'Invalid value or resource ID';
  } else if (error.code === 11000) {
    status = 409;
    message = 'A user with this email already exists';
  } else if (error.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON body';
  } else if (error.type === 'entity.too.large') {
    status = 413;
    message = 'Request body exceeds the 100 KB limit';
  } else if (error.status === 415) {
    status = 415;
    message = 'Unsupported request encoding';
  }

  if (status >= 500) console.error(error);
  res.status(status).json({ success: false, message });
}
