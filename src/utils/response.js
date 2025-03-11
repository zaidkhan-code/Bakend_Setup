// utils/response.js
export const successResponse = (res, statusCode, data) => {
  res.status(statusCode).json({
    Code: "SUCCESS",
    data,
  });
};

export const errorResponse = (res, statusCode, message) => {
  res.status(statusCode).json({
    Code: "FAIL",
    error: message,
  });
};
