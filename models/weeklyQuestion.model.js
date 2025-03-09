import mongoose from 'mongoose';

const weeklyQuestionSchema = new mongoose.Schema(
  {
    isApproved: {
      type: Boolean,
      required: true,
      default: false,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Org',
      immutable: true,
      required: true,
    },
  },
  { timestamps: true },
);

const WeeklyQuestion = mongoose.model('WeeklyQuestion', weeklyQuestionSchema);

export default WeeklyQuestion;
