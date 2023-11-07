import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  // Generate a jwt token and use the userId to sign the token. The use the JWT secret that's stored in the environment variables
  
  // Set the expiration date to 30 days

  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '2m',
  });
  res.cookie('jwt', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

export default generateToken;
