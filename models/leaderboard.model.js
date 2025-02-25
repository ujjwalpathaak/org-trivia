import mongoose from 'mongoose';

const rankingSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
});

const leaderboardSchema = new mongoose.Schema(
  {
    rankings: {
      type: [rankingSchema],
      default: [],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    org: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Org',
      immutable: true,
      required: true,
    },
  },
  { timestamps: true },
);

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

export default Leaderboard;
