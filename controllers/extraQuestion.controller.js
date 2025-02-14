import mongoose from "mongoose";

const extraQuestionSchema = new mongoose.Schema({
    // need to add fields
}, { timestamps: true });

const extraQuestion = mongoose.model("extraQuestion", extraQuestionSchema);

export default extraQuestion;