/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable new-cap */
import axios from 'axios';
// const consumerKey = 'AUKtWEaSEe7usQbMEUJe53uN4Ao2AniY';
// const consumerSecret = 'vNR88kpWuzVowUNo';

// This function generates the auth token required to authenticate all daraja calls
// It's called every time we want to make a call to the endpoints and generates a new access token

const generateToken = async (consumerKey,consumerSecret) => {
  const buff = new Buffer.from(`${consumerKey}:${consumerSecret}`);
  const requestEncoding = buff.toString('base64');
  try {
    const response = await axios(process.env.authTokenURLEndpointProduction, {
      headers: {
        Authorization: `Basic ${requestEncoding}`,
      },
    });
    const { access_token } = response.data;
    return access_token;
  } catch (error) {
    return error.response;
  }
};

export default generateToken;
