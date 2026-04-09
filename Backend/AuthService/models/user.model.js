import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+\@.+\..+/, "Please fill a valid email address"],
    },
    phone: {
      type: String,
      default: null,
    },
    password: {
      type: String || null,
      select: false,
      minlength: [6, "Password must be at least 6 characters long"],
      default: null,
    },
    role: {
      type: String,
      enum: ["landlord", "tenant", "admin"],
      default: null,
    },
    isRoleSelected: {
      type: Boolean,
      default: false,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      require: true,
      default: "local",
    },
    googleId: {
      type: String,
      default: null,
      index: true,
    },
    // ==========================================
    // 🔥 IDENTITY VERIFICATION (KYC) FIELDS 🔥
    // ==========================================
    isVerified:{
      type: Boolean,
      default: false, // Will turn true when admin approves
    },
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified",
    },
    identityDocument: {
      type: String,
      default: null, // Will store the Cloudinary URL
    },
    idType: {
      type: String,
      enum: ["Aadhar", "PAN", "Passport", "Driving License", "Voter ID", "Other"],
      default: null,
    },
    verificationMessage: {
      type: String,
      default: null, // Admin notes (e.g., "Image is blurry, please re-upload")
    },
    // ==========================================
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive:{
      type: Boolean,
      default: true,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    resetOTP: {
      type: String,
      select: false, 
      default: null,
    },
    resetOTPExpiry: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

userSchema.methods.generateAccessToken = function () {
 return jwt.sign({ _id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
}

userSchema.methods.generateRefreshToken = function () {
 return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
}
const User = mongoose.model("User", userSchema);
export default User;
