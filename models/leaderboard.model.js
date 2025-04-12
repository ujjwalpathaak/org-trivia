import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Org',
      required: true,
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    month: {
      type: Number,
      required: true,
      max: 12,
      min: 1,
    },
    year: {
      type: Number,
      required: true,
      min: 2025,
      max: 2100,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

export default Leaderboard;
