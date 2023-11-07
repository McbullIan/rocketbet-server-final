/* eslint-disable new-cap */
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getActiveBets,
  AddBetToList,
  getAllBets,
  getHighestWins,
} from '../controllers/gameController.js';
const router = express.Router();

router.get('/all-active-bets', protect, getActiveBets);
router.get('/all-bets', protect, getAllBets);
router.get('/highest-wins', protect, getHighestWins);
router.post('/add-active', protect, AddBetToList);

export default router;
