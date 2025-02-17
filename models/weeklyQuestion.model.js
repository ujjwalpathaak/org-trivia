import mongoose from "mongoose";
import { SchedulerSystem } from "pixi.js";

const weeklyQuestionSchema = new mongoose.Schema({
  scheduledDate: {
    type: Date,
    required: true,
    unique: true,
  },
  question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
});

const WeeklyQuestion = mongoose.model("WeeklyQuestion", weeklyQuestionSchema);

export default WeeklyQuestion;
