import axios from 'axios';
import { faker } from '@faker-js/faker';
const b2c = async (token, amount, phoneNumber) => {
  const shortCode = process.env.businessShortCodeB2C;
  const securityCredential = process.env.securityCredential;
  const payload = {
    OriginatorConversationID: faker.string.uuid(),
    InitiatorName: 'Ericm',
    SecurityCredential: securityCredential,
    CommandID: 'BusinessPayment',
    Amount: amount,
    PartyA: shortCode,
    PartyB: phoneNumber,
    Remarks: 'here are my remarks',
    QueueTimeOutURL:
      'https://betting-site-app-server-production.up.railway.app/b2c/0h4Lo06IEGm64pG',
    ResultURL:
      'https://betting-site-app-server-production.up.railway.app/b2c/LP9Uu331mvpCapyVHm',
    Occassion: 'Payout',
  };
  try {
    const response = await axios.post(
      'https://api.safaricom.co.ke/mpesa/b2c/v1/paymentrequest',
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
export default b2c;
