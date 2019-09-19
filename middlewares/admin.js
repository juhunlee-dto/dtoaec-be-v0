module.exports = function(req, res, next) {
  if (!req.user)
    return res.status(401).send("Access denied. No token provided.");
  //401 Unauthorized.  just a wrong token
  //403 Forbidden. just not allowed
  if (!req.user.isAdmin) {
    return res.status(403).send("Access denied. Forbidden.");
  }
  next();
};
