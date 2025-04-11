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

const resultSchema = new mongoose.Schema(
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
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    genre: {
      type: String,
      enum: ['PnA', 'CAnIT', 'HRP'],
    },
    answers: {
      type: [answerSchema],
      default: [],
    },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

const Result = mongoose.model('Result', resultSchema);

export default Result;
