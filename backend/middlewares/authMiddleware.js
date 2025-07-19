const { ERROR_MESSAGES } = require("../utils/constants");

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode =
    err.message === ERROR_MESSAGES.UNAUTHORIZED
      ? 401
      : err.message === ERROR_MESSAGES.ADMIN_REQUIRED
      ? 403
      : 500;

  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
};

module.exports = {
  errorHandler,
};
