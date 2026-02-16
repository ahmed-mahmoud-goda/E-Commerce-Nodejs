const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, , "Please enter a valid email"],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },
  passwordChangedAt: {
    type: Date,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  verificationExpires: Date,
  resetToken: String,
  resetTokenExpires: Date,
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (pass, passDb) {
  return await bcrypt.compare(pass, passDb);
};
userSchema.methods.createToken = function (type) {
  const token = crypto.randomBytes(32).toString("hex");
  if (type === "verification") {
    this.verificationToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    this.verificationExpires = Date.now() + 15 * 60 * 1000;
  } else if (type === "reset") {
    this.resetToken = crypto.createHash("sha256").update(token).digest("hex");
    this.resetTokenExpires = Date.now() + 15 * 60 * 1000;
  }
  return token;
};
userSchema.methods.isPasswordChanged = function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    const passwordTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return jwtTimeStamp < passwordTimeStamp;
  }
  return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
