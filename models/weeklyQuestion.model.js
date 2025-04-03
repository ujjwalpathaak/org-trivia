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
        ref: 'Question', // Assuming 'Question' is the model name
        required: true,
      },
    ],
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Org',
      immutable: true,
      required: true,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

const WeeklyQuestion = mongoose.model('WeeklyQuestion', weeklyQuestionSchema);

export default WeeklyQuestion;
