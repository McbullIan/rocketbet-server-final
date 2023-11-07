import mongoose from 'mongoose';
const games = new mongoose.Schema({
  gameID: {
    type: String,
  },
  gameHash: {
    type: String,
  },
  crashAt: {
    type: Number,
    default: 0,
  },
  // round_number: {
  //   type: Number,
  //   default: 1,
  // },
  active_player_id_list: {
    type: [],
    default: [],
  },
  // b_betting_phase: {
  //   type: Boolean,
  //   default: false,
  // },
  // b_game_phase: {
  //   type: Boolean,
  //   default: false,
  // },
  // b_cashout_phase: {
  //   type: Boolean,
  //   default: false,
  // },
  generatedAt: {
    type: String,
  },
  // previous_crashes: {
  //   type: [Number],
  //   default: [],
  // },
  // round_id_list: {
  //   type: [Number],
  //   default: [],
  // },
  // chat_messages_list: {
  //   type: [],
  //   default: [],
  // },
});

export default mongoose.model('games', games);
