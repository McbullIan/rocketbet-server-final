import crypto from 'crypto';

const getResult = (gameHash, salt) => {
  const hm = crypto.createHmac('sha256', Buffer.from(gameHash, 'utf-8'));
  hm.update(Buffer.from(salt, 'utf-8'));
  const h = hm.digest('hex');

  if (parseInt(h, 16) % 33 === 0) {
    return 1;
  }

  const hValue = parseInt(h.slice(0, 13), 16);
  const e = Math.pow(2, 52);

  return Math.floor(((100 * e - hValue) / (e - hValue)) * 100) / 100;
};

export default getResult;
