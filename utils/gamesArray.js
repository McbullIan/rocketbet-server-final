/* eslint-disable no-unused-vars */
const gameHash =
  '100af1b49f5e9f87efc81f838bf9b1f5e38293e5b4cf6d0b366c004e0a8d9987'; // Update to latest game's hash for more results
const firstGame =
  '77b271fe12fca03c618f63dfb79d4105726ba9d4a25bb3f1964e435ccf9cb209';

const results = [];
let count = 0;

while (gameHash !== firstGame) {
  count++;
  results.push(getResult(gameHash));
  gameHash = getPrevGame(gameHash);
}

const resultsArray = results;
