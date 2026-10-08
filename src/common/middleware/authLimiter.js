import { rateLimit } from 'express-rate-limit';
import sendResponse from '../utils/ApiResponse.js';

// Slow down repeated auth requests from the same IP address.
export default rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => sendResponse(res, 429, 'Too many requests. Try again later.'),
});
