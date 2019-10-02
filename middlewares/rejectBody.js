module.exports = function(req, res, next) {
  const bodyIsEmpty =
    Object.entries(req.body).length === 0 && req.body.constructor === Object;
  if (!bodyIsEmpty)
    return res.status(403).send("Forbidden: body is not allowed");
  next();
};
