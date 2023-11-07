import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
// import User from '../models/User.js';

const protect = asyncHandler(async (req, res, next) => {
  // Check for the existence of a token in the cookie
  // We are looking for a cookie called jwt.
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: 'You are unauthorized to view this resource' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded.userId;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Not authorized, invalid token' });
  }
  // const token = req.cookies.jwt;
  // if (token) {
  //   try {
  //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
  //     req.user = await User.findById(decoded.userId).select('-password');
  //     next();
  //   } catch (error) {
  //     res.status(401).json({ message: 'Not authorized, invalid token' });
  //   }
  // } else {
  //   res.status(401).json({ message: 'Not authorized, no token' });
  // }
});

export { protect };
