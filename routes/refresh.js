/* eslint-disable new-cap */
import express from 'express';
import handleRefreshToken from '../controllers/refreshTokenController.js';
const router = express.Router();

router.post('/', handleRefreshToken);

export default router;
