import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    currentStreak: {
      type: Number, // no. of days
      default: 0,
    },
    currentPoints: {
      type: Number,
      default: 0,
    },
    badges: {
      type: [Object],
      default: [],
    },
    submittedQuestion: {
      type: [Object],
      default: [],
    },
  },
  { timestamps: true }
);

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
