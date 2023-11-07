/* eslint-disable new-cap */
import dayjs from 'dayjs';
import axios from 'axios';
const businessShortCode = process.env.businessShortCodeC2B;
const passKey = process.env.passKey;

export const genPassword = (timeStamp) => {
  const dataToEncode = businessShortCode + passKey + timeStamp;
  const password = new Buffer.from(dataToEncode).toString('base64');
  return password;
};

// export const checkTransactionStatus = async (token, CheckoutRequestID) => {
//   const businessShortCode = process.env.businessShortCodeC2B;
//   const year = dayjs().format('YYYY');
//   const month = dayjs().format('MM');
//   const day = dayjs().format('DD');
//   const hour = dayjs().format('HH');
//   const minute = dayjs().format('mm');
//   const seconds = dayjs().format('ss');
//   const timeStamp = year + month + day + hour + minute + seconds;

//   const checkTransactionStatusPayload = {
//     BusinessShortCode: businessShortCode,
//     Password: genPassword(timeStamp),
//     Timestamp: timeStamp,
//     CheckoutRequestID,
//   };
//   try {
//     const response = await axios.post(
//       'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
//       checkTransactionStatusPayload,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     return error;
//   }
// };

const initiateSTKDeposit = async (token, amount, phoneNumber) => {
  const businessShortCode = process.env.businessShortCodeC2B;
  const year = dayjs().format('YYYY');
  const month = dayjs().format('MM');
  const day = dayjs().format('DD');
  const hour = dayjs().format('HH');
  const minute = dayjs().format('mm');
  const seconds = dayjs().format('ss');
  const timeStamp = year + month + day + hour + minute + seconds;

  const payload = {
    BusinessShortCode: businessShortCode,
    Password: genPassword(timeStamp),
    Timestamp: timeStamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phoneNumber,
    PartyB: businessShortCode,
    PhoneNumber: phoneNumber,
    CallBackURL:
      'https://betting-site-app-server-production.up.railway.app/vOfgzQxOa6wxgmUYX',
    AccountReference: phoneNumber,
    TransactionDesc: 'Test',
  };
  try {
    const response = await axios.post(
      'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    return error;
  }
};
export default initiateSTKDeposit;
