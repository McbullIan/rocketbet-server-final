import mongoose, { Schema } from 'mongoose';

export const DepositsScheme = new Schema(
  {
    CheckoutRequestID: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
    },
    status: {
      type: String,
      default: null,
    },
    responseMessage: {
      type: String,
    },
    resultCode: {
      type: String,
    },
    resultDescription: {
      type: String,
    },
    TransactionDetails: {
      type: [],
    },
  },
  {
    timestamps: true,
  }
);

const Deposits = mongoose.model('Deposits', DepositsScheme);
export default Deposits;
