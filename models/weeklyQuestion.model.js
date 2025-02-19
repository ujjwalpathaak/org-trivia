import mongoose from "mongoose";

const weeklyQuestionSchema = new mongoose.Schema({
  scheduledDate: {
    type: Date,
    required: true,
    unique: true,
  },
  question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "unusedQuestion",
      required: true,
  },
  org: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Org",
    immutable: true,
    required: true,
  },
});

const WeeklyQuestion = mongoose.model("WeeklyQuestion", weeklyQuestionSchema);

export default WeeklyQuestion;
