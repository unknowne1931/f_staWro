const jwt = require('jsonwebtoken');

const users_admin_Middle = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(500).json({ Status : 505 });
  }

  try {
    const decoded = jwt.verify(token, "kanna_stawro_founrs_withhh_1931_liketha"); // Replace with your actual secret
    req.id = decoded.id;
    if (req.id === decoded.id) {
      next();
    } else {
      return res.status(200).json({ Status : 505 });
    }
  } catch (err) {
    return res.status(200).json({ Status : 505 });
  }
};

module.exports = users_admin_Middle;
