module.exports = (req, res, next) => {
  res.jsend = (data) => {
    res.json({ status: "success", data });
  };
  res.jfail = (data) => {
    res.json({ status: "fail", data });
  };
  res.jerror = (message, data, code) => {
    res.json({ status: "error", message, data, code });
  };
  next();
};
