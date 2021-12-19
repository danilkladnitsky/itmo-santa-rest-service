import * as mongoose from 'mongoose';

export const GiftSchema = new mongoose.Schema(
  {
    receiverId: { type: String },
    creatorId: { type: String },
    giftCode: { type: Number, unique: true, default: 100000 },
    letter: {
      type: String,
      required: false,
      default: '* No letter was attached *',
    },
    status: { type: String },
  },
  { timestamps: true },
);
