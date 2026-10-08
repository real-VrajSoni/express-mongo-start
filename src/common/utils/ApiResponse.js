// Keep success and error responses in the same easy-to-read shape.
export default function sendResponse(res, statusCode, message, data = null) {
  return res.status(statusCode).json({
    success: statusCode < 400,
    message,
    data,
  });
}
