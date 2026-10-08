// Express 5 sends errors from async routes here.
function errorHandler(error, req, res, next) {
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: error.message });
  }

  if (error.status) {
    return res.status(error.status).json({ message: error.message });
  }

  console.error(error);
  res.status(500).json({ message: 'Something went wrong' });
}

export default errorHandler;
