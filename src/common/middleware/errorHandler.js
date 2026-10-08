import sendResponse from '../utils/ApiResponse.js';

// Express 5 sends errors from async routes here.
export default function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  let statusCode = error.statusCode || error.status || 500;
  if (error.name === 'ValidationError') statusCode = 400;

  if (statusCode >= 500 && statusCode !== 501) {
    console.error(error);
    return sendResponse(res, statusCode, 'Something went wrong');
  }

  return sendResponse(res, statusCode, error.message);
}
