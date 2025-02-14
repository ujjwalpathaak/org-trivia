import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
    // need to add fields
}, { timestamps: true });

const Answer = mongoose.model("Answer", answerSchema);

export default Answer;