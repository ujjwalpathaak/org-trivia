import mongoose from "mongoose";

const liveQuestionSchema = new mongoose.Schema({
    // need to add fields
}, { timestamps: true });

const liveQuestion = mongoose.model("liveQuestion", liveQuestionSchema);

export default liveQuestion;