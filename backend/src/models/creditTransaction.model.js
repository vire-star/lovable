import mongoose from "mongoose";

const creditTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  
  type: { 
    type: String, 
    enum: ['generation', 'modification', 'purchase', 'refund'], // ✅ Add refund
    required: true 
  },
  
  amount: { type: Number, required: true },
  
  details: {
    prompt: String,
    action: String,
    paymentMethod: String, // ✅ 'stripe', 'free', etc.
    timestamp: { type: Date, default: Date.now }
  },
  
  balanceAfter: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' } // ✅ Add status
});

export const CreditTransaction = mongoose.model("CreditTransaction", creditTransactionSchema)