import crypto from 'crypto-js';

export const generateHashForCrash = (value) => {
  const secretKey = process.env.random_token;
  const encryptedRandomValue = crypto.AES.encrypt(
    value.toString(),
    secretKey
  ).toString();

  return encryptedRandomValue;
};

export const decryptHash = (cipher) => {
  const secretKey = process.env.random_token;
  const decrypted = crypto.AES.decrypt(cipher, secretKey).toString(
    crypto.enc.Utf8
  );
  return decrypted;
};

const generateRandomNumberHash = (min, max) => {
  // const currentTimeInMilliseconds = new Date().getTime();
  const randomNumber = Math.floor(Math.random() * (max - min + 1) + min);
  const secretKey = process.env.random_token;
  const encryptedRandomNumber = crypto.AES.encrypt(
    randomNumber.toString(),
    secretKey
  ).toString();

  return encryptedRandomNumber;
};

export default generateRandomNumberHash;
