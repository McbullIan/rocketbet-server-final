/* eslint-disable new-cap */
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  registerUser,
  loginUser,
  logoutUser,
  getAllUsers,
  withdrawFunds,
  depositFunds,
  getUserProfile,
  updateUserProfile,
  confirmEmail,
  updateUserBalance,
} from '../controllers/userController.js';
import {
  darajaDepositCheckStatus,
  darajaWithdrawCallbackHandler,
} from '../controllers/darajaController.js';
import { generateTarget,getGameHistory } from '../controllers/gameController.js';
const router = express.Router();

router.get('/', getAllUsers);
router.post('/', registerUser);

router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.get('/multiplier', generateTarget);
router.get('/history', getGameHistory);
router.post('/deposit', protect, depositFunds);
router.post('/withdraw', protect, withdrawFunds);
router.post('/deposit-status', protect, darajaDepositCheckStatus);
router.post('/confirm-email', confirmEmail);
router.post('/daraja-cb-withdraw', protect, darajaWithdrawCallbackHandler);
router.post('/update-balance', protect, updateUserBalance);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default router;
