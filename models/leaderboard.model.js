import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema(
  {
    rankings: {
      type: [{
        employeeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Employee',
          required: true,
        },
        score: {
          type: Number,
          required: true,
        },
      }],
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
