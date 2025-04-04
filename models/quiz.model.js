import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Org',
    required: true,
  },
  scheduledDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (v) {
        return v >= new Date().setHours(0, 0, 0, 0);
      },
      message: 'Scheduled date must be in the future.',
    },
  },
  status: {
    type: String,
    enum: ['upcoming', 'scheduled', 'cancelled', 'live', 'expired'],
    required: true,
    default: 'scheduled',
  },
  genre: {
    type: String,
    enum: ['PnA', 'CAnIT', 'HRP'],
    required: true,
  },
});

const Quiz = mongoose.model('Quiz', quizSchema, 'quizzes');

export default Quiz;
