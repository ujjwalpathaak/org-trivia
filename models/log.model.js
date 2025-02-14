import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
    // need to add fields
}, { timestamps: true });

const Log = mongoose.model("Log", logSchema);

export default Log;