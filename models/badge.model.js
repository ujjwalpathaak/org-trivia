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
      trim: true,
    },
    streak: {
      type: String,
      enum: ['3 Months', '6 Months', '1 Year'],
      trim: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

const Badge = mongoose.model('Badge', badgeSchema);

export default Badge;
