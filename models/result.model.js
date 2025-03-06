import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
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
    results: {
      type: [
        {
          questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
          },
          answer: Number,
        },
      ],
    },
  },
  { timestamps: true },
);

const Result = mongoose.model('Result', resultSchema);

export default Result;
