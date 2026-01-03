import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatarUrl: { type: String }, // ✅ Add profile picture
  
  // ✅ Credit System - Perfect!
  credits: {
    available: { type: Number, default: 3 },
    total: { type: Number, default: 3 },
    lastReset: { type: Date, default: Date.now },
    resetPeriod: { type: String, enum: ['daily', 'monthly', 'none'], default: 'none' } // ✅ Add reset logic
  },
  
  // ✅ Subscription - Good! Add expiry
  subscription: {
    isPremium: { type: Boolean, default: false },
    plan: { type: String, enum: ['free', 'beginner', 'intermediate', 'advanced'], default: 'free' }, // ✅ Your plan names
    stripeCustomerId: String,
    subscriptionId: String,
    currentPeriodEnd: Date, // ✅ Add subscription expiry
    cancelAtPeriodEnd: { type: Boolean, default: false } // ✅ Cancel tracking
  },
  
  usage: { // ✅ Add usage tracking
    totalProjects: { type: Number, default: 0 },
    totalGenerations: { type: Number, default: 0 }
  },
  
  createdAt: { type: Date, default: Date.now }
});


export const User = mongoose.model("User", userSchema)