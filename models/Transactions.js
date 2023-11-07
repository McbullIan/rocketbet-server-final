import mongoose, { Schema } from 'mongoose';
import { PayoutsScheme } from './Payouts.js';
import { DepositsScheme } from './Deposits.js';

export const TransactionsScheme = new Schema(
  {
    withdrawals: [PayoutsScheme],
    deposits: [DepositsScheme],
  },
  {
    timestamps: true,
  }
);

const Transactions = mongoose.model('Transactions', TransactionsScheme);
export default Transactions;
