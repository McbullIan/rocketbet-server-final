import mongoose, { Schema } from 'mongoose';

export const PayoutsScheme = new Schema(
  {
    ConversationID: {
      type: String,
      required: true,
    },
    OriginatorConversationID: {
      type: String,
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
      type: Number,
    },
    resultDescription: {
      type: String,
    },
    TransactionID: {
      type: String,
    },
    amount: {
      type: Number,
    },
    TransactionReceipt: {
      type: String,
    },
    MPESACustomer: {
      type: String,
    },
    PaymentTo: {
      type: String,
    },
    TransactionCompletedOn: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Payouts = mongoose.model('Payouts', PayoutsScheme);
export default Payouts;
