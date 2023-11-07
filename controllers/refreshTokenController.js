import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

const handleRefreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refresh_token;
  
  if (!refreshToken) {
    return res.sendStatus(401);
  }
  // If there is a refresh token, find the user with that refreshToken
  const user = await User.findOne({ refreshToken });
  if (!user) {
    // The user was not found because the refreshToken changed.
    // The only reason this can happen is if the user logged in from a different device
    return res.sendStatus(404);
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '2h' }
    );
    res.status(200).json({
      accessToken,
    });
  } catch (err) {
    return res.sendStatus(403);
  }
});

export default handleRefreshToken;
