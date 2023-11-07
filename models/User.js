/* eslint-disable no-invalid-this */
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
// import { TransactionsScheme } from './Transactions.js';
import { DepositsScheme } from './Deposits.js';
import { PayoutsScheme } from './Payouts.js';
const UserScheme = new Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: { type: String },
    phoneNumber: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      unique: true,
    },
    avatar: {
      type: String,
    },
    userBalance: {
      type: Number,
      default: 0,
    },
    accessToken: {
      type: String || null,
    },
    notifications: {
      type: Array,
    },
    refreshToken: {
      type: String,
    },
    deposits: [DepositsScheme],
    payouts: [PayoutsScheme],
  },
  {
    timestamps: true,
  }
);

UserScheme.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserScheme.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserScheme);
export default User;
