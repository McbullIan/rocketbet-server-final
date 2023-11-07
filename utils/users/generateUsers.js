import User from '../../models/User.js';
import { faker } from '@faker-js/faker';

const generateFakeUsers = (number = 1) => {
  const fakeUsers = [];
  for (let i = 0; i < number; i++) {
    fakeUsers.push({
      userName: faker.person.firstName(),
      phoneNumber: faker.phone.number(),
      password: faker.internet.password(),
      avatar: faker.image.avatar(),
    });
  }
  User.collection.insertMany(fakeUsers, (err, docs) => {
    if (err) {
      console.err(err);
    } else {
      console.log('☑️ Multiple documents inserted');
    }
  });
  return fakeUsers;
};

const generateFakePlayers = (number = 1) => {
  const fakePlayers = [];
  for (let i = 0; i < number; i++) {
    fakePlayers.push({
      userName: faker.person.firstName(),
      currentBet: Number(faker.commerce.price({ min: 400, max: 7000, dec: 0 })),
    });
  }
  return fakePlayers;
};

export { generateFakeUsers, generateFakePlayers };
