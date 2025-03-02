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
      ref: 'Quiz',
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    answers: {
      type: [
        {
          questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question', // Ensure 'Question' is the correct model name
          },
          answer: Number,
        },
      ],
    },
  },
  { timestamps: true },
);

const Answer = mongoose.model('Answer', answerSchema);

export default Answer;
