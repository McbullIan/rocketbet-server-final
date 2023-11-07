import dayjs from 'dayjs';
import axios from 'axios';
const businessShortCode = process.env.businessShortCodeC2B;
import { genPassword } from './c2b.js';

const checkTransactionStatus = async (token, CheckoutRequestID) => {
  const year = dayjs().format('YYYY');
  const month = dayjs().format('MM');
  const day = dayjs().format('DD');
  const hour = dayjs().format('HH');
  const minute = dayjs().format('mm');
  const seconds = dayjs().format('ss');
  const timeStamp = year + month + day + hour + minute + seconds;

  const checkTransactionStatusPayload = {
    BusinessShortCode: businessShortCode,
    Password: genPassword(timeStamp),
    Timestamp: timeStamp,
    CheckoutRequestID,
  };
  try {
    const response = await axios.post(
      'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query',
      checkTransactionStatusPayload,
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

export default checkTransactionStatus;
