export const globalResponse = (err, req, res, next) => {
  if (err) {
    console.log(err)
    return res.status(err["cause"] || 500).json({
      message: "error",
      error_msg: err.message,
    });
  }
};
