import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ["AI", "Employee", "Admin"],
      immutable: true,
      required: true,
      default: "AI",
    },
    category: {
      type: String,
      enum: ["CCnHnFF", "CAnIT", "HRD", "PnA"],
      immutable: true,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    question: {
      type: String,
      trim: true,
      required: true,
    },
    answer: {
      type: Number,
      required: true,
      immutable: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return v.length === 4;
        },
        message: "Options array must have exactly 4 items.",
      },
    },
    status: {
      type: String,
      enum: ["done", "extra", "live"],
      required: true,
      default: "live",
    },
    date: {
      type: Date,
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    lastModifiedAt: {
      type: Date,
      default: Date.now,
    },
    org: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Org",
      immutable: true,
      required: true,
    },
  },
  { timestamps: true }
);

const weeklyQuestionSchema = new mongoose.Schema(
  {
    scheduledDate: {
      type: Date,
      required: true,
    },
    question: questionSchema,
    org: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Org",
      immutable: true,
      required: true,
    },
  },
  { timestamps: true }
);

const WeeklyQuestion = mongoose.model("WeeklyQuestion", weeklyQuestionSchema);

export default WeeklyQuestion;