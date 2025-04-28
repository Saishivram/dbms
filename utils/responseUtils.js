/**
 * Standard response format for all API endpoints
 * @param {Object} res - Express response object
 * @param {Number} status - HTTP status code
 * @param {Object|Array} data - Data to be sent in the response
 * @param {String} message - Optional message to be sent in the response
 * @returns {Object} - Standardized response object
 */
const sendResponse = (res, status, data, message = '') => {
  return res.status(status).json({
    success: status >= 200 && status < 300,
    message,
    data
  });
};

/**
 * Error response format for all API endpoints
 * @param {Object} res - Express response object
 * @param {Number} status - HTTP status code
 * @param {String} message - Error message
 * @param {Object} errors - Optional validation errors
 * @returns {Object} - Standardized error response object
 */
const sendError = (res, status, message, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(status).json(response);
};

module.exports = {
  sendResponse,
  sendError
}; 