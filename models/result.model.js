import mongoose from 'mongoose';

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
      type: [
        {
          questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
          },
          correctAns: Number,
          myAns: Number,
        },
      ],
      _id: false,
    },
  },
  { timestamps: true },
);

const Result = mongoose.model('Result', resultSchema);

export default Result;
