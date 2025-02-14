import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    // need to add fields
}, { timestamps: true });

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;