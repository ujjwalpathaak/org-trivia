import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    correctAnswer: {
      type: Number,
      required: true,
    },
    employeeAnswer: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const resultSchema = new mongoose.Schema({
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
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  points: {
    type: Number,
    required: true,
  },
  multiplier: {
    type: Number,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  genre: {
    type: String,
    enum: ['PnA', 'CAnIT', 'HRD'],
  },
  answers: {
    type: [answerSchema],
    default: [],
  },
});

const Result = mongoose.model('Result', resultSchema);

export default Result;
