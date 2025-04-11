import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    state: {
      type: Number,
      enum: [0, 1, 2], // 0 -> unUsed, 1 -> pending, 2 -> used
      required: true,
      default: 0,
    },
    category: {
      type: String,
    },
    puzzleType: {
      type: String,
    },
    file: {
      type: String,
    },
    source: {
      type: String,
      enum: ['AI', 'Employee'],
      required: true,
      default: 'AI',
    },
    date: {
      type: Date,
      default: () => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return now;
      },
    },
  },
  { _id: false },
);

const orgSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  questionsPnA: {
    type: [questionSchema],
    default: [],
  },
  questionsHRP: {
    type: [questionSchema],
    default: [],
  },
  questionsCAnIT: {
    type: [questionSchema],
    default: [],
  },
  admins: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Admins' }],
    default: [],
  },
  employees: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employees' }],
    default: [],
  },
  settings: {
    type: {
      isTriviaEnabled: { type: Boolean, default: false },
      companyCurrentAffairsTimeline: {
        type: Number,
        default: 4,
        min: 1,
        max: 4,
      },
      currentGenre: { type: Number, default: 0, min: 0, max: 3 },
      unavailableGenre: {
        type: [String],
        default: ['PnA', 'HRP', 'CAnIT'],
        set: (arr) => [...new Set(arr ?? [])],
      },
      selectedGenre: {
        type: [String],
        default: ['PnA', 'HRP', 'CAnIT'],
        set: function (arr) {
          const unavailable = this?.settings?.unavailableGenre ?? [];
          return (arr ?? []).filter((genre) => !unavailable.includes(genre));
        },
      },
    },
    default: () => ({
      isTriviaEnabled: true,
      currentGenre: 0,
      companyCurrentAffairsTimeline: 3,
      selectedGenre: ['PnA', 'HRP', 'CAnIT'],
      unavailableGenre: [],
    }),
  },
},{
  timestamps: false,
  versionKey: false,
});

orgSchema.pre('save', function (next) {
  this.settings.unavailableGenre = this.settings.unavailableGenre ?? [];
  this.settings.selectedGenre = this.settings.selectedGenre.filter(
    (genre) => !this.settings.unavailableGenre.includes(genre),
  );
  next();
});

const Org = mongoose.model('Org', orgSchema);

export default Org;
