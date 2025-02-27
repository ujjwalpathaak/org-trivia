import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Questions',
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    answers: {
      type: [
        {
          questionId: mongoose.Schema.Types.ObjectId,
          ref: 'Questions',
          answer: Number,
        },
      ],
      required: true,
    },
  },
  { timestamps: true },
);

const Answer = mongoose.model('Answer', answerSchema);

export default Answer;
