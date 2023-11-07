import crypto from 'crypto';
const crashHash = crypto.randomBytes(16).toString('hex');
const salt =
  '0xd2867566759e9158bda9bf93b343bbd9aa02ce1e0c5bc2b37a2d70d391b04f14';

export const generateHash = (seed) => {
  return crypto.createHash('sha256').update(seed).digest('hex');
};

const divisible = (hash, mod) => {
  let val = 0;

  const o = hash.length % 4;
  for (let i = o > 0 ? o - 4 : 0; i < hash.length; i += 4) {
    val = ((val << 16) + parseInt(hash.substring(i, i + 4), 16)) % mod;
  }

  return val === 0;
};

export const crashPointFromHash = (serverSeed) => {
  const hash = crypto
    .createHmac('sha256', serverSeed)
    .update(salt)
    .digest('hex');

  const hs = parseInt(100 / 4);
  if (divisible(hash, hs)) {
    return 1;
  }

  const h = parseInt(hash.slice(0, 52 / 4), 16);
  const e = Math.pow(2, 52);

  return Math.floor((100 * e - h) / (e - h)) / 100.0;
};

export const getPreviousGames = () => {
  const previousGames = [];
  let gameHash = generateHash(crashHash);

  for (let i = 0; i < 100; i++) {
    const gameResult = crashPointFromHash(gameHash);
    previousGames.push({ gameHash, gameResult });
    gameHash = generateHash(gameHash);
  }

  return previousGames;
};

const verifyCrash = () => {
  const gameResult = crashPointFromHash(crashHash);
  const previousHundredGames = getPreviousGames();

  return { gameResult, previousHundredGames };
};

export default verifyCrash;
