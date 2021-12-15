import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema(
  {
    tg_id: { type: String, unique: true, required: true },
    isu: { type: String, unique: true, required: true },
    tg_username: { type: String, required: false },
    name: { type: String, required: false },
    email: { type: String, required: false },
    bio: { type: String, required: false },
    progress: { type: String, required: false },
    letter: { type: String, required: false },
    language_code: { type: String, default: 'ru' },
  },
  { timestamps: true },
);
