/* eslint-disable new-cap */
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import chalk from 'chalk';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
const port = 3300;
import userRoutes from './routes/userRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import refresh from './routes/refresh.js';
import dayjs from 'dayjs';
import User from './models/User.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
// import Transactions from './models/Transactions.js';
// import { faker } from '@faker-js/faker';

import Payouts from './models/Payouts.js';
import Deposits from './models/Deposits.js';
import http from 'http';
import { Server } from 'socket.io';
import Stopwatch from 'statman-stopwatch';

const app = express();
const server = http.Server(app);
export const sw = new Stopwatch(true);
export const socketIO = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.mongourl, {
    dbName: 'production_db',
  })
  .then(() => console.log(chalk.yellow('MongoDB Cluster connected')))
  .catch((err) => {
    console.log(chalk.redBright(err));
    process.exit(1);
  });

app.use(cookieParser());
socketIO.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);
  socket.emit('news_by_server', {
    message:
      "🚀 Welcome to RocketBet, where the thrill of betting reaches new heights! 🚀🌟 At RocketBet, we've got your adrenaline pumping, heart-racing, and fun-filled betting experience covered. 🌟",
  });
  // socket.on('target_reached', (data) => {
  //   console.log('Target Reached');
  //   socket.emit('bet_history', { message: 'Betting history' });
  // });
  socket.on('disconnect', () => {
    console.log('🔥: A user disconnected');
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the betting site api 🎊' });
});

app.post('/vOfgzQxOa6wxgmUYX', async (req, res) => {
  const callbackData = req.body;
  const responseData = callbackData.Body.stkCallback;
  //  console.log(responseData.CallbackMetadata);
  // ❓What operations should we conduct if the transaction was successfull.
  // ✅ If the request was unsuccessfull, we would need to:
  // ✅ Update the transaction on the db

  if (responseData.ResultCode !== 0) {
    const getTransaction = await Deposits.findOneAndUpdate(
      { CheckoutRequestID: responseData.CheckoutRequestID },
      {
        status: 'unsuccessful',
        resultDescription: responseData.ResultDesc,
      },
      { new: true }
    );
    if (getTransaction) {
      return res.status(200).json({ message: responseData.ResultDesc });
    }
  }
  // Otherwise the response was successful, update the proper document

  // ❓ What operations should we conduct if the transaction was successfull.
  // If the request was successfull, we would need to:
  // ✅ Update the transaction on the db
  // ✅ Update the user with the new balance

  const getTransaction = await Deposits.findOne({
    CheckoutRequestID: responseData.CheckoutRequestID,
  });
  if (getTransaction) {
    const transactionDetails = {
      amount: responseData.CallbackMetadata.Item[0].Value,
      receiptNumber: responseData.CallbackMetadata.Item[1].Value,
      transactionDate: dayjs().format('DD/MM/YYYY'),
      phoneNumber: responseData.CallbackMetadata.Item[3].Value,
      transactionCompletedAt: `${dayjs().format('ddd')}, ${dayjs().format(
        'DD'
      )} ${dayjs().format('YYYY')} ${dayjs().format('HH')}:${dayjs().format(
        'mm'
      )}:${dayjs().format('ss')}`,
    };
    getTransaction.status = 'success';
    getTransaction.TransactionDetails.push(transactionDetails);
    const updatedDoc = await getTransaction.save();
    if (updatedDoc) {
      // If the transaction was updated succesfully, update the user as well with the new balance
      const user = await User.findById(getTransaction.userId);
      if (user) {
        // ✅ update the user balance if the transaction was successfull
        user.userBalance =
          responseData.CallbackMetadata.Item[0].Value + user.userBalance;

        const updatedUser = await user.save();
        if (updatedUser) {
          // If the users balance was successfully updated, add the notification
          return res.status(200).json({ message: 'Success' });
        } else {
          return res.status(503).json({
            message: 'Unable to update user',
          });
        }
      }
    } else {
      return res.status(200).json({ message: 'Unable to save new document' });
    }
  }
  // Send a response back to the M-Pesa
  return res.json({ status: 'success' });
});
app.post('/b2c/0h4Lo06IEGm64pG', (req, res) => {
  return res.json({ status: 'success' });
});
app.post('/b2c/LP9Uu331mvpCapyVHm', async (req, res) => {
  const requestBodyResult = req.body.Result;
  if (
    requestBodyResult.ResultDesc !==
    'The service request is processed successfully.'
  ) {
    const findPayout = await Payouts.findOne({
      OriginatorConversationID: requestBodyResult.OriginatorConversationID,
    });
    if (findPayout) {
      findPayout.status = 'failed';
      findPayout.responseMessage = requestBodyResult.ResultDesc;
      const updatedPayout = await findPayout.save();
      if (updatedPayout) {
        return res.json({ status: 'success' });
      }
      return res.json({ status: 'success' });
    }
    return res.json({ status: 'success' });
  } else {
    const requestBodyResult = req.body.Result;
    const resultsParams = requestBodyResult.ResultParameters.ResultParameter;
    const amount = resultsParams[0].Value;
    const receipt = resultsParams[1].Value;
    const mpesaClient = resultsParams[6].Value;
    const paymentTo = resultsParams[2].Value;
    const transactionCompletedOn = resultsParams[3].Value;
    const findPayout = await Payouts.findOne({
      OriginatorConversationID: requestBodyResult.OriginatorConversationID,
    });
    // Find the payout, then find the user

    if (findPayout) {
      const findUser = await User.findById(findPayout.userId);
      if (findUser) {
        findUser.userBalance = findUser.userBalance - Number(amount);
        const updateUser = await findUser.save();
        if (updateUser) {
          findPayout.status = 'success';
          findPayout.responseMessage = requestBodyResult.ResultDesc;
          findPayout.amount = amount;
          findPayout.TransactionReceipt = receipt;
          findPayout.PaymentTo = paymentTo;
          findPayout.MPESACustomer = mpesaClient;
          findPayout.TransactionCompletedOn = transactionCompletedOn;
          const updatedPayout = await findPayout.save();
          if (updatedPayout) {
            return res.json({ status: 'success' });
          }
          return res.json({ status: 'success' });
        }
      }
      return res.json({ status: 'success' });
    }
  }
  return res.json({ status: 'success' });
});

app.use('/api/users', userRoutes);
app.use('/api/refresh', refresh);
app.use('/api/games', gameRoutes);
app.use(notFound);
app.use(errorHandler);

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
