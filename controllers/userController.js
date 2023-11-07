/* eslint-disable new-cap */
import { faker } from '@faker-js/faker';
import asynHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Deposits from '../models/Deposits.js';
import { generateFakePlayers } from '../utils/users/generateUsers.js';
import genTokenDaraja from '../utils/mpesa/generateDarajaAuthToken.js';
import Payments from '../models/Payouts.js';
import c2b from '../utils/mpesa/c2b.js';
import b2c from '../utils/mpesa/b2c.js';

// @desc Auth user/set token
// route POST /api/users/auth
// @access Public

const authUser = asynHandler((req, res) => {
  res.status(200).json({ message: 'Authenticated user' });
});

// @desc Register a new user
// route POST /api/users/register
// @access Public

const registerUser = asynHandler(async (req, res) => {
  const { userName, password, phoneNumber } = req.body;
  const userExists = await User.findOne({ userName });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }
  console.log(userName, password, phoneNumber);
  const user = await User.create({
    userName,
    password,
    phoneNumber,
    avatar: faker.image.avatar(),
  });
  if (user) {
    return res.status(201).json({
      id: user._id,
      userName: user.userName,
      phoneNumber: user.phoneNumber,
    });
  } else {
    return res.status(400).json({ message: 'Invalid user data' });
  }
});

// @desc Users uses
// route GET /api/users
// @access Public

const getAllUsers = asynHandler(async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
});

// @desc Login a user
// route POST /api/users/login
// @access Public

const loginUser = asynHandler(async (req, res) => {
  const { phoneNumber, password } = req.body;
  const user = await User.findOne({ phoneNumber });
  if (user && (await user.matchPassword(password))) {
    // generateToken(res, user._id);
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '30m' }
    );
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '1d' }
    );

    const updatedUser = await user.updateOne(
      { refreshToken },
      { upsert: true }
    );
    if (updatedUser) {
      res.cookie('jwt', refreshToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.status(200).json({
        id: user._id,
        userName: user.userName,
        phoneNumber: user.phoneNumber,
        avatarImage: user.avatar,
        userBalance: user.userBalance,
        accessToken,
        refreshToken,
      });
    } else {
      res.status(500).json({ message: 'Unable to update user' });
    }
  } else {
    res.status(401).json({ message: 'Invalid phone number or password' });
  }
});

// @desc update user balance
// route POST /api/users/update-balance
// @access Private

const updateUserBalance = asynHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user);
    console.log(user);
    res.status(200).json({ message: 'User found' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'User not found' });
  }
});

// @desc Log out user
// route POST /api/users/logout
// @access Public

const logoutUser = asynHandler(async (req, res) => {
  // Logout the user by removing the refreshToken from the DB
  // Check cookies in the request body
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.sendStatus(204); // No content
  }
  const refreshToken = cookies.jwt;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV !== 'development',
    });
    return res.sendStatus(204);
  }
  // Delete refreshToken from the DB
  const userUpdated = user.updateOne(
    { refreshToken: null },
    {
      upsert: true,
    }
  );
  if (userUpdated) {
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV !== 'development',
    });
    return res.sendStatus(204);
  }
  return res.status(500).json({ message: 'Unable to update user' });
});

// @desc Get user email to reset password
// route GET /api/users/confirm-email
// @access Public

const confirmEmail = asynHandler(async (req, res) => {
  const userEmail = req.body.email;
  console.log(userEmail);
  const findUser = await User.find({ email: userEmail });
  if (findUser) {
    return res.status(200);
  }
  return res.status(404).json({ message: 'Email does not exist' });
});

// @desc Get user profile
// route GET /api/users/profile
// @access Private

const getUserProfile = asynHandler(async (req, res) => {
  const user = await User.findById(req.user);
  if (user) {
    const { userName, userBalance, avatar, notifications } = user;
    if (userBalance < 100) {
      notifications.push({ message: 'You are running low on funds' });
    }
    return res.status(200).json({
      userName,
      userBalance,
      notifications,
      avatar,
      players: generateFakePlayers(10),
    });
  }

  res.status(500).json({ message: 'Something went wrong' });
});

// @desc Deposit funds to a users account
// route POST /api/users/deposit
// @access Private

const depositFunds = asynHandler(async (req, res) => {
  const user = await User.findById(req.user);

  if (user) {
    const consumerKey = process.env.consumerKeyC2B;
    const consumerSecret = process.env.consumerSecretC2B;

    const tokenDaraja = await genTokenDaraja(consumerKey, consumerSecret);
    //  console.log(tokenDaraja)
    if (tokenDaraja) {
      const stkPushResponse = await c2b(
        tokenDaraja,
        req.body.amount,
        user.phoneNumber.replace('+', '')
      ).catch((err) => err);
      if (stkPushResponse.ResponseCode) {
        // console.log('Stk push was successful');
        // Create a new deposit and store the checkoutRequestID
        const newTransaction = await Deposits.create({
          CheckoutRequestID: stkPushResponse.CheckoutRequestID,
          userId: user._id,
        });
        if (newTransaction) {
          return res.status(200).json({
            message: 'Transaction created',
            amount: newTransaction.CheckoutRequestID,
          });
        } else {
          // console.log('Unable to save the transaction in the DB');
          return res
            .status(500)
            .json({ message: 'Unable to create transaction' });
        }
      } else {
        return res.status(500).json({
          message: 'STK push failed',
        });
      }
    }
  }

  res.status(500).json({ message: 'Something went wrong' });
});

// @desc Withdraw funds to a users account
// route POST /api/users/withdraw
// @access Private
const withdrawFunds = asynHandler(async (req, res) => {
  const user = await User.findById(req.user);
  if (user) {
    const consumerKey = process.env.consumerKeyB2C;
    const consumerSecret = process.env.consumerSecretB2C;
    const tokenDaraja = await genTokenDaraja(consumerKey, consumerSecret);
    if (tokenDaraja) {
      const responseDaraja = await b2c(
        tokenDaraja,
        req.body.amount,
        user.phoneNumber.replace('+', '')
      );
      if (responseDaraja) {
        const newPayment = await Payments.create({
          ConversationID: responseDaraja.ConversationID,
          OriginatorConversationID: responseDaraja.OriginatorConversationID,
          userId: user._id,
        });
        if (newPayment) {
          return res
            .status(200)
            .json({ hash: responseDaraja.OriginatorConversationID });
        }
      }
      return res.send(500).json({ message: 'An error occured ' });
    }
    return res.send(500).json({ message: 'Token could not be generated' });
  }

  res.status(500).json({ message: 'User was not found' });
});

// @desc Update user profule
// route POST /api/users/profile
// @access Private

const updateUserProfile = asynHandler(async (req, res) => {
  const user = await User.findById(req.user);
  if (user) {
    user.userName = req.body.userName || user.userName;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    user.userBalance = req.body.newBalance || user.userBalance
    if (req.body.password) {
      user.password = req.body.password;
    }
    const updatedUser = await user.save();
   return res.status(200).json({
      _id: updatedUser._id,
      userName: updatedUser.userName,
      phoneNumber: updatedUser.phoneNumber,
    });
  } else {
    throw new Error('User not found');
  }
});

export {
  authUser,
  registerUser,
  loginUser,
  withdrawFunds,
  depositFunds,
  updateUserBalance,
  logoutUser,
  getAllUsers,
  getUserProfile,
  confirmEmail,
  updateUserProfile,
};
