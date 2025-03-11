import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    rank: {
      type: String,
      enum: ['Silver', 'Gold', 'Bronze'],
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

const Badge = mongoose.model('Badge', badgeSchema);

export default Badge;
