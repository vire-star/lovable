import { User } from "../models/user.model.js";
import { CreditTransaction } from "../models/creditTransaction.model.js";
import { getRedisClient } from '../config/redis.js';

export class CreditService {
  
  // ✅ Check if user has credits
  static async hasCredits(userId) {
    try {
      const client = await getRedisClient(); // ✅ Correct way
      const key = `credits:${userId}`;
      
      let credits = await client.get(key);

      if (credits === null) {
        const user = await User.findById(userId).select("credits");
        
        if (!user) {
          throw new Error('User not found');
        }

        credits = user.credits?.available || 0;
        await client.setEx(key, 3600, credits.toString());
        
        console.log(`💾 Cache MISS for user ${userId} - Stored: ${credits} credits`);
      } else {
        console.log(`✅ Cache HIT for user ${userId} - Credits: ${credits}`);
      }

      return Number(credits) > 0;
    } catch (error) {
      console.error('❌ Error checking credits:', error);
      
      // Fallback to DB if Redis fails
      const user = await User.findById(userId).select("credits");
      return user?.credits?.available > 0;
    }
  }

  // ✅ Get current credit balance
  static async getBalance(userId) {
    try {
      const client = await getRedisClient();
      const key = `credits:${userId}`;
      
      let credits = await client.get(key);

      if (credits === null) {
        const user = await User.findById(userId).select("credits");
        credits = user?.credits?.available || 0;
        await client.setEx(key, 3600, credits.toString());
      }

      return Number(credits);
    } catch (error) {
      console.error('❌ Error getting balance:', error);
      const user = await User.findById(userId).select("credits");
      return user?.credits?.available || 0;
    }
  }

  // ✅ Deduct credit (ATOMIC with rollback)
  static async deductCredit(userId, projectId, prompt, action) {
    const client = await getRedisClient();
    const key = `credits:${userId}`;

    try {
      const exists = await client.exists(key);
      
      if (!exists) {
        const user = await User.findById(userId).select("credits");
        if (!user) {
          throw new Error('User not found');
        }
        await client.setEx(key, 3600, user.credits.available.toString());
      }

      const remaining = await client.decr(key);

      if (remaining < 0) {
        await client.incr(key);
        throw new Error("Insufficient credits");
      }

      const updateResult = await User.findByIdAndUpdate(
        userId,
        { $inc: { "credits.available": -1 } },
        { new: true }
      );

      if (!updateResult) {
        await client.incr(key);
        throw new Error('Failed to update user credits');
      }

      await CreditTransaction.create({
        userId,
        projectId,
        type: action === "new_project" ? "generation" : "modification",
        amount: -1,
        details: { prompt, action },
        balanceAfter: remaining,
        timestamp: new Date()
      });

      console.log(`💳 Credit deducted for user ${userId}. Remaining: ${remaining}`);

      return { 
        remainingCredits: remaining,
        unlimited: remaining >= 9999
      };

    } catch (error) {
      console.error('❌ Credit deduction failed:', error);
      throw error;
    }
  }

  // Similarly update other methods...
  static async invalidateCache(userId) {
    try {
      const client = await getRedisClient();
      await client.del(`credits:${userId}`);
      console.log(`🗑️ Cache invalidated for user ${userId}`);
    } catch (error) {
      console.error('❌ Error invalidating cache:', error);
    }
  }
}
