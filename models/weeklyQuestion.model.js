import mongoose from 'mongoose';

const weeklyQuestionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true,
      },
    ],
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Org',
      immutable: true,
      required: true,
    },
    genre: {
      type: String,
      enum: ['CAnIT', 'HRP', 'PnA'],
      required: true,
    },
  },
  { timestamps: false },
);

const WeeklyQuestion = mongoose.model('WeeklyQuestion', weeklyQuestionSchema);

export default WeeklyQuestion;
