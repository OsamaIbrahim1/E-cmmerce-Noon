export const globalResponse = (err, req, res, next) => {
  if (err) {
    res.status(err["cause"] || 500).json({
      message: "error",
      error_msg: err.message,
    });

    next();
  }
};
