const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(201).json({ Logout : "OUT" });
  }

  try {
    const decoded = jwt.verify(token, 'kanna_stawro_founders_withhh_1931_liketha'); // Replace 'kanna_stawro_founders_withhh_1931_liketha' with your actual secret
    req.user = decoded.id;
    if(req.user = decoded.id){
      next();
    }else{
        res.status(201).json({ Logout : "OUT" });
    }
  } catch (err) {
    
  }
};

module.exports = authMiddleware;
