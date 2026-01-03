// backend/models/user.model.js

import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatarUrl: { type: String },
  
  credits: {
    available: { type: Number, default: 3 },
    total: { type: Number, default: 3 },
    lastReset: { type: Date, default: Date.now },
    resetPeriod: { type: String, enum: ['daily', 'monthly', 'none'], default: 'none' }
  },
  
  subscription: {
    isPremium: { type: Boolean, default: false },
    plan: { type: String, enum: ['free', 'starter', 'pro', 'enterprise'], default: 'free' },
    stripeCustomerId: { type: String },
    subscriptionId: { type: String },
    currentPeriodStart: { type: Date },  // ✅ Add this
    currentPeriodEnd: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false }
  },
  
  usage: {
    totalProjects: { type: Number, default: 0 },
    totalGenerations: { type: Number, default: 0 }
  },
  
  createdAt: { type: Date, default: Date.now }
})

export const User = mongoose.model("User", userSchema)
