import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ['AI', 'Employee', 'Admin'],
      immutable: true,
      required: true,
      default: 'AI',
    },
    category: {
      type: String,
      enum: ['CCnHnFF', 'CAnIT', 'HRD', 'PnA'],
      immutable: true,
      required: true,
    },
    image: {
      type: String,
      default: '',
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
      validate: {
        validator: function (v) {
          return v >= 0 && v < 4;
        },
        message: 'Answer must be an index between 0 and 3.',
      },
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length === 4;
        },
        message: 'Options array must have exactly 4 items.',
      },
    },
    status: {
      type: String,
      enum: ['done', 'extra', 'live'],
      required: true,
      default: 'extra',
    },
    config: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true },
);

const Question = mongoose.model('Question', questionSchema);

export default Question;
