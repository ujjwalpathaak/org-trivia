import mongoose from "mongoose";

const optionsSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 200,
  },
  isAnswer: {
    type: Boolean,
    required: true,
  },
}, { timestamps: true });

const unusedQuestionSchema = new mongoose.Schema({
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
    required: true
  },
  image: {
    type: String,
    default: NULL,
  },
  description: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
  answer: {
    type: Number,
    required: true,
    immutable: true,
  },
  options: {
    type: [optionsSchema],
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
    default: "extra"
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
}, { timestamps: true });

const unusedQuestion = mongoose.model("unusedQuestion", unusedQuestionSchema);

export default unusedQuestion;
