import sendResponse from '../utils/ApiResponse.js';

export default function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  let statusCode = error.statusCode || error.status || 500;
  let message = error.message;

  if (error.name === 'ValidationError') statusCode = 400;
  if (error.type === 'entity.parse.failed') message = 'Invalid JSON body';
  if (error.code === 11000) {
    statusCode = 409;
    message = 'An account with this email already exists';
  }
  if (statusCode >= 500) {
    console.error(error.message);
    message = 'Something went wrong. Please try again.';
  }

  return sendResponse(res, statusCode, message);
}
