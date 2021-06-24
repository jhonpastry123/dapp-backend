const mongoose = require("mongoose");

const { Schema } = mongoose;

// const UserModel = () => {

const userSchema = new Schema(
  {
    id: { type: Schema.Types.ObjectId },
    name: { type: String },
    email: { type: String, required: true },
    email_verified_at: { type: Date },
    kyc_verified_at: { type: Date },
    password: { type: String },
    status: { type: Boolean, default: false },
    registerMethod: { type: String },
    lastLogin: { type: Date },
    role: { type: String, default: "user" },
    walletType: { type: String },
    walletAddress: { type: String },
    remember_token: { type: Date },
    updated_at: { type: Date },
    created_at: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", userSchema);
