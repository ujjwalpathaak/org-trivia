import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    // need to add fields
}, { timestamps: true });

const Question = mongoose.model("Question", questionSchema);

export default Question;