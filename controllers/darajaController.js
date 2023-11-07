import asynHandler from 'express-async-handler';
// import Transactions from '../models/Transactions.js';
import Deposits from '../models/Deposits.js';
import User from '../models/User.js';
import genTokenDaraja from '../utils/mpesa/generateDarajaAuthToken.js';
import checkTransactionStatus from '../utils/mpesa/checkTransactionStatus.js';
// import { decryptHash } from '../utils/generateRandomHash.js';
import Payout from '../models/Payouts.js';
// @desc Auth api/darajaCB
// route GET /api/darajaCB
// @access Private

const darajaDepositCheckStatus = asynHandler(async (req, res) => {
  // Find the user from the headers
  const CheckoutRequestID = req.body.amount;
  const user = await User.findById(req.user);
  if (user) {
    // If we find the user, find the transaction and check the status
    const findTransaction = await Deposits.findOne({ CheckoutRequestID });
    if (findTransaction) {
      const consumerKey = process.env.consumerKeyC2B;
      const consumerSecret = process.env.consumerSecretC2B;
      const token = await genTokenDaraja(consumerKey, consumerSecret);
      if (token) {
        const status = await checkTransactionStatus(
          token,
          findTransaction.CheckoutRequestID
        ).catch((err) => err);
        console.log(status);
        if (
          status.ResultDesc ===
            'The service request is processed successfully.' &&
          findTransaction.status === 'success'
        ) {
          return res.status(200).json({ message: status.ResultDesc });
        }
        if (
          status.ResultDesc ===
            'The service request is processed successfully.' &&
          !findTransaction.status
        ) {
          return res
            .status(200)
            .json({ message: 'Waiting for third party response' });
        }
        if (status.ResultDesc === 'The initiator information is invalid.') {
          return res.status(403).json({ message: 'Invalid pin' });
        }
        return res.status(500).json({ message: status.ResultDesc });
      }
      res.status(500).json({ message: 'Transaction not available' });
    }
  }
});

const darajaWithdrawCallbackHandler = async (req, res) => {
  const findPayout = await Payout.findOne({
    OriginatorConversationID: req.body.token,
  });
  if (findPayout) {
    if (findPayout.status === 'success') {
      return res.status(200).json({ message: 'Withdrawal successful' });
    }
    return res
      .status(200)
      .json({ message: 'Waiting for third party response' });
  }

  return res
    .status(500)
    .json({ message: 'Withdrawal failed', paymentDetails: findPayment.status });
};

export { darajaDepositCheckStatus, darajaWithdrawCallbackHandler };
