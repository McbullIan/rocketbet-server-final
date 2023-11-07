import { faker } from '@faker-js/faker';

const generateBets = (number = 1) => {
  const allBets = [];
  for (let i = 0; i < number; i++) {
    allBets.push({
      userName: faker.person.firstName(),
      betAmount: Number(faker.commerce.price({ min: 400, max: 7000, dec: 0 })),
      crashAt: faker.number.float({ min: 1, max: 10, precision: 0.01 }),
      cashoutAt: faker.number.float({ min: 1, max: 10, precision: 0.01 }),
    });
  }
  return allBets;
};
const generateWins = (number = 1) => {
  const allWins = [];
  for (let i = 0; i < number; i++) {
    allBets.push({
      userName: faker.person.firstName(),
      betAmount: Number(faker.commerce.price({ min: 400, max: 7000, dec: 0 })),
      target: faker.number.float({ min: 1, max: 10, precision: 0.01 }),
      outcome: faker.number.float({ min: 1, precision: 0.01 }),
    });
  }
  return allWins;
};

export { generateBets, generateWins };
