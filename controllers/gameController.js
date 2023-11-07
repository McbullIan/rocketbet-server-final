import gameLoop from '../models/gameLoop.js';
import User from '../models/User.js';
import asynHandler from 'express-async-handler';
import crypto from 'crypto';
import dayjs from 'dayjs';
import { crashPointFromHash } from '../utils/roobet.js';
import { generateHash } from '../utils/roobet.js';
import { generateHashForCrash } from '../utils/generateRandomHash.js';
import localized from 'dayjs/plugin/localizedFormat.js';
import { socketIO } from '../index.js';
import { sw } from '../index.js';
import {
  generateBets,
  generateWins,
} from '../utils/games/generateBetsAndWins.js';

dayjs.extend(localized);

// @desc get all active bets
// route GET /api/game/all-bets
// @access Private

const getActiveBets = asynHandler(async (req, res) => {
  //   const lastTenGames = await gameLoop.find();
  //   if(lastTenGames){

  //   }

  res.json({ message: 'getActiveBets endpoint called' });
});

// @desc get all active bets
// route POST /api/game/add-bet
// @access Private
const AddBetToList = asynHandler(async (req, res) => {
  const { gameID, amount } = req.body;
  if (amount > 0) {
    const findUser = await User.findById(req.user);
    if (findUser) {
      const activeUser = {
        userID: req.user,
        userName: findUser.userName,
        currentBet: amount,
        betPlacedOn: dayjs().format('LTS'),
      };
      const options = { new: true };
      const update = { $push: { active_player_id_list: activeUser } };
      try {
        const findGame = await gameLoop.findOneAndUpdate(
          { gameID },
          update,
          options
        );
        socketIO.emit('active_players', {
          activePlayers: findGame.active_player_id_list,
        });
      } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Unable to add user' });
      }
    } else {
      console.log("Couldn't find user");
    }
  }
  res.json({ message: 'Adding a bet to the list' });
});

// @desc get all bets
// route GET /api/game/all-bets
// @access Private

const getAllBets = asynHandler(async (req, res) => {
  return res.status(200).json({ allBets: generateBets(10) });
});

// @desc get highest wins
// route GET /api/game/highest-wins
// @access Private

const getHighestWins = asynHandler(async (req, res) => {
  return res.status(200).json({ highestWins: generateWins(10) });
});

// @desc get game history
// route GET /api/game/history
// @access Private

const getGameHistory = asynHandler(async (req, res) => {
  const allGames = await gameLoop.find();
  // Check if games are more than 10, if they are, slice the result..otherwise return the results as is
  if (allGames) {
    if (allGames.length > 10) {
      const lastTen = allGames
        .slice(-10)
        .map((game) => game.crashAt)
        .slice(0, -1);
      return res.status(200).json({ lastTen });
    }
    const lastTen = allGames.map((game) => game.crashAt);
    return res.status(200).json({ lastTen });
  }
  res.status(500).json({ message: 'Unable to fetch game history' });
});

// @desc generate crash point
// route GET /api/user/multiplier
// @access Private
const generateTarget = asynHandler(async (req, res) => {
  try {
    const crashHash = crypto.randomBytes(16).toString('hex');
    // Create a new game
    const newGame = await gameLoop.create({
      crashAt: crashPointFromHash(generateHash(crashHash)),
      gameID: crashHash,
      active_player_id_list: [],
      generatedAt: dayjs().format('LLLL'),
    });
    // If the new game was successfully generated,
    if (newGame) {
      const allGames = await gameLoop.find();
      if (allGames) {
        allGames.length > 10
          ? socketIO.emit('get_crash_history', {
              crashPoints: allGames
                .slice(-10)
                .map((game) => game.crashAt)
                .slice(0, -1),
            })
          : socketIO.emit('get_crash_history', {
              crashPoints: allGames
                .slice(-10)
                .map((game) => game.crashAt)
                .slice(0, -1),
            });
        // Emit active_bets
        socketIO.emit('get_active_bets', {
          activeUsers: [{ userName: 'Ian', currentBet: 0 }],
        });
        socketIO.emit('crash', {
          hash: generateHashForCrash(newGame.crashAt),
          gameID: newGame.gameID,
        });
        const delta = sw.read(2);
        let seconds = delta / 1000.0;
        seconds = seconds.toFixed(2);
        console.log(seconds);
        // Send the crashHash to the client
        return res.status(200).json({
          hash: generateHashForCrash(newGame.crashAt),
          gameID: newGame.gameID,
        });
      }
    }
    res.status(500).json({ message: 'Server error' });
  } catch (error) {
    return res.status(404).json({ message: 'Not authorized' });
  }
});

export {
  getActiveBets,
  AddBetToList,
  generateTarget,
  getGameHistory,
  getAllBets,
  getHighestWins,
};
