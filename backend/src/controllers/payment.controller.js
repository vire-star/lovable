// backend/controllers/payment.controller.js

import Stripe from "stripe"
import { User } from "../models/user.model.js"
import { CreditTransaction } from "../models/creditTransaction.model.js"
import { getRedisClient } from '../config/redis.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// ✅ Subscription plans (monthly recurring)
const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    credits: 3,
    interval: 'lifetime',
    features: ['3 AI generations (one-time)', 'Basic support']
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 499,  // ₹499/month
    credits: 50,
    interval: 'month',
    features: ['50 AI generations/month', 'Email support', 'Priority queue']
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 999,  // ₹999/month
    credits: 150,
    interval: 'month',
    features: ['150 AI generations/month', 'Priority support', '2x faster generation', 'Advanced features'],
    popular: true
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 2999,  // ₹2999/month
    credits: 500,
    interval: 'month',
    features: ['500 AI generations/month', '24/7 support', '5x faster generation', 'Custom integrations', 'API access']
  }
}

// ✅ 1. Get subscription plans
export const getSubscriptionPlans = async (req, res) => {
  try {
    res.json({
      success: true,
      plans: Object.values(SUBSCRIPTION_PLANS)
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to get plans' })
  }
}

// ✅ 2. Create subscription checkout
export const createSubscriptionCheckout = async (req, res) => {
  try {
    const { planId } = req.body
    const userId = req.id

    // Validate plan
    const plan = SUBSCRIPTION_PLANS[planId]
    if (!plan || plan.id === 'free') {
      return res.status(400).json({ error: "Invalid plan" })
    }

    // Get user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Check if already subscribed
    if (user.subscription?.isPremium && user.subscription?.plan === planId) {
      return res.status(400).json({ 
        error: "Already subscribed to this plan" 
      })
    }

    // Create or get Stripe customer
    let stripeCustomerId = user.subscription?.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: userId.toString() }
      })
      stripeCustomerId = customer.id

      await User.findByIdAndUpdate(userId, {
        'subscription.stripeCustomerId': stripeCustomerId
      })
    }

    // Create line items for subscription
    const lineItems = [{
      price_data: {
        currency: "inr",
        product_data: {
          name: `${plan.name} Plan`,
          description: plan.features.join(', ')
        },
        unit_amount: plan.price * 100, // Convert to paise
        recurring: {
          interval: plan.interval  // 'month' or 'year'
        }
      },
      quantity: 1
    }]


    // Create subscription checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "subscription",  // ⭐ Important: subscription mode
      success_url: `${process.env.CLIENT_URL}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: {
        userId: userId.toString(),
        planId: plan.id,
        credits: plan.credits.toString()
      },
      subscription_data: {
        metadata: {
          userId: userId.toString(),
          planId: plan.id,
          credits: plan.credits.toString()
        }
      }
    })

    console.log(`💳 Subscription checkout created: ${session.id}`)

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      plan: plan.name,
      amount: plan.price
    })

  } catch (error) {
    console.error("❌ Error creating subscription checkout:", error)
    res.status(500).json({
      error: "Error creating subscription checkout",
      message: error.message
    })
  }
}

// ✅ 3. Verify subscription payment
// backend/controllers/payment.controller.js

// ✅ Fixed: Verify subscription payment
// backend/controllers/payment.controller.js

// ✅ Fixed: Verify subscription payment (with proper subscription retrieval)
export const verifySubscription = async (req, res) => {
  try {
    const { sessionId } = req.body
    const userId = req.id

    if (!sessionId) {
      return res.status(400).json({ message: "sessionId is required" })
    }

    // ✅ Retrieve session with expanded subscription
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'subscription.default_payment_method']
    })

    console.log('📦 Session data:', {
      mode: session.mode,
      payment_status: session.payment_status,
      subscription: session.subscription?.id
    })

    // Verify it's a subscription session
    if (session.mode !== 'subscription') {
      return res.status(400).json({
        success: false,
        message: "This is not a subscription session"
      })
    }

    // Verify payment completed
    if (session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment not completed",
        status: session.payment_status
      })
    }

    // Check if subscription exists
    if (!session.subscription) {
      return res.status(400).json({
        success: false,
        message: "No subscription found in session"
      })
    }

    // ✅ Get subscription object (already expanded)
    const subscription = session.subscription

    console.log('📦 Subscription data:', {
      id: subscription.id,
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end
    })

    // ✅ Extract metadata from session (not subscription)
    const credits = parseInt(session.metadata.credits)
    const planId = session.metadata.planId

    // ✅ Convert Unix timestamps to Date
    const currentPeriodStart = subscription.current_period_start 
      ? new Date(subscription.current_period_start * 1000) 
      : new Date()
    
    const currentPeriodEnd = subscription.current_period_end 
      ? new Date(subscription.current_period_end * 1000) 
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default: 30 days

    console.log('📅 Converted dates:', {
      start: currentPeriodStart,
      end: currentPeriodEnd
    })

    // Validate dates
    if (isNaN(currentPeriodStart.getTime()) || isNaN(currentPeriodEnd.getTime())) {
      console.error('❌ Invalid dates:', {
        start: subscription.current_period_start,
        end: subscription.current_period_end
      })
      return res.status(500).json({
        success: false,
        message: "Invalid subscription period dates"
      })
    }

    // Update user subscription
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'subscription.isPremium': true,
          'subscription.plan': planId,
          'subscription.subscriptionId': subscription.id,
          'subscription.currentPeriodStart': currentPeriodStart,
          'subscription.currentPeriodEnd': currentPeriodEnd,
          'subscription.cancelAtPeriodEnd': false
        },
        $inc: {
          "credits.available": credits,
          "credits.total": credits
        }
      },
      { new: true }
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    // Update Redis cache
    try {
      const client = await getRedisClient()
      await client.set(`credits:${userId}`, user.credits.available.toString())
    } catch (error) {
      console.error('⚠️ Redis update failed:', error)
    }

    // Create transaction record
    await CreditTransaction.create({
      userId,
      type: "purchase",
      amount: credits,
      balanceAfter: user.credits.available,
      details: {
        planId,
        subscriptionId: subscription.id,
        paymentMethod: "stripe",
        action: "subscription_started",
        stripeSessionId: sessionId,
        timestamp: new Date()
      },
      status: 'completed'
    })

    console.log(`✅ Subscription activated: User ${userId} → ${planId} plan (${credits} credits)`)

    return res.json({
      success: true,
      message: `Subscription activated! ${credits} credits added.`,
      subscription: {
        isPremium: user.subscription.isPremium,
        plan: user.subscription.plan,
        subscriptionId: user.subscription.subscriptionId,
        currentPeriodStart: user.subscription.currentPeriodStart,
        currentPeriodEnd: user.subscription.currentPeriodEnd
      },
      credits: {
        available: user.credits.available,
        total: user.credits.total
      }
    })

  } catch (error) {
    console.error("❌ Error verifying subscription:", error)
    return res.status(500).json({
      success: false,
      error: "Error verifying subscription",
      message: error.message
    })
  }
}


// ✅ 4. Stripe webhook (handles all subscription events)
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"]

  let event
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  console.log(`🔔 Webhook received: ${event.type}`)

  try {
    switch (event.type) {
      // ✅ Subscription created/activated
      case "checkout.session.completed": {
        const session = event.data.object

        if (session.mode === 'subscription') {
          await handleSubscriptionActivation(session)
        }
        break
      }

      // ✅ Monthly renewal (automatic credit refill)
      case "invoice.payment_succeeded": {
        const invoice = event.data.object

        // Only handle recurring payments, not initial payment
        if (invoice.billing_reason === 'subscription_cycle') {
          await handleMonthlyRenewal(invoice)
        }
        break
      }

      // ✅ Subscription updated (plan change)
      case "customer.subscription.updated": {
        const subscription = event.data.object
        await handleSubscriptionUpdate(subscription)
        break
      }

      // ✅ Subscription cancelled
      case "customer.subscription.deleted": {
        const subscription = event.data.object
        await handleSubscriptionCancellation(subscription)
        break
      }

      // ✅ Payment failed
      case "invoice.payment_failed": {
        const invoice = event.data.object
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`)
    }

    res.json({ received: true })

  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
}

// ✅ Helper: Handle subscription activation
async function handleSubscriptionActivation(session) {
  const userId = session.metadata.userId
  const planId = session.metadata.planId
  const credits = parseInt(session.metadata.credits)
  const subscriptionId = session.subscription

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        'subscription.isPremium': true,
        'subscription.plan': planId,
        'subscription.subscriptionId': subscriptionId,
        'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
        'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
        'subscription.cancelAtPeriodEnd': false
      },
      $inc: {
        "credits.available": credits,
        "credits.total": credits
      }
    },
    { new: true }
  )

  // Update Redis
  try {
    const client = await getRedisClient()
    await client.set(`credits:${userId}`, user.credits.available)
  } catch (error) {
    console.error('⚠️ Redis error:', error)
  }

  // Log transaction
  await CreditTransaction.create({
    userId,
    type: "purchase",
    amount: credits,
    balanceAfter: user.credits.available,
    details: {
      planId,
      subscriptionId,
      paymentMethod: "stripe",
      action: "subscription_started",
      stripeSessionId: session.id,
      timestamp: new Date()
    },
    status: 'completed'
  })

  console.log(`✅ Subscription activated: User ${userId} → ${planId} (${credits} credits)`)
}

// ✅ Helper: Handle monthly renewal (auto credit refill)
async function handleMonthlyRenewal(invoice) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
  const userId = subscription.metadata.userId
  const planId = subscription.metadata.planId
  const plan = SUBSCRIPTION_PLANS[planId]

  if (!plan) return

  // Refill credits every month
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $inc: {
        "credits.available": plan.credits,
        "credits.total": plan.credits
      },
      $set: {
        'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
        'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000)
      }
    },
    { new: true }
  )

  // Update Redis
  try {
    const client = await getRedisClient()
    await client.incrBy(`credits:${userId}`, plan.credits)
  } catch (error) {
    console.error('⚠️ Redis error:', error)
  }

  // Log transaction
  await CreditTransaction.create({
    userId,
    type: "purchase",
    amount: plan.credits,
    balanceAfter: user.credits.available,
    details: {
      planId,
      paymentMethod: "stripe",
      action: "monthly_renewal",
      invoiceId: invoice.id,
      timestamp: new Date()
    },
    status: 'completed'
  })

  console.log(`✅ Monthly renewal: User ${userId} → ${plan.credits} credits added`)
}

// ✅ Helper: Handle subscription update
async function handleSubscriptionUpdate(subscription) {
  const userId = subscription.metadata.userId

  await User.findByIdAndUpdate(userId, {
    $set: {
      'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
      'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
      'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end
    }
  })

  console.log(`✅ Subscription updated: User ${userId}`)
}

// ✅ Helper: Handle subscription cancellation
async function handleSubscriptionCancellation(subscription) {
  const userId = subscription.metadata.userId

  await User.findByIdAndUpdate(userId, {
    $set: {
      'subscription.isPremium': false,
      'subscription.plan': 'free',
      'subscription.subscriptionId': null,
      'subscription.cancelAtPeriodEnd': false,
      'subscription.currentPeriodEnd': null
    }
  })

  console.log(`✅ Subscription cancelled: User ${userId}`)
}

// ✅ Helper: Handle payment failed
async function handlePaymentFailed(invoice) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
  const userId = subscription.metadata.userId

  // Optionally: Send email notification
  console.log(`❌ Payment failed for user ${userId}`)
}

// ✅ 5. Cancel subscription
export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.id
    const user = await User.findById(userId)

    if (!user?.subscription?.subscriptionId) {
      return res.status(400).json({
        error: 'No active subscription found'
      })
    }

    // Cancel at period end (user keeps access until end of billing cycle)
    await stripe.subscriptions.update(user.subscription.subscriptionId, {
      cancel_at_period_end: true
    })

    await User.findByIdAndUpdate(userId, {
      'subscription.cancelAtPeriodEnd': true
    })

    res.json({
      success: true,
      message: 'Subscription will be cancelled at the end of billing period',
      currentPeriodEnd: user.subscription.currentPeriodEnd
    })

  } catch (error) {
    console.error('❌ Cancel subscription error:', error)
    res.status(500).json({
      error: 'Failed to cancel subscription'
    })
  }
}

// ✅ 6. Get current subscription
export const getCurrentSubscription = async (req, res) => {
  try {
    const userId = req.id
    const user = await User.findById(userId).select('subscription credits')

    res.json({
      success: true,
      subscription: user.subscription,
      credits: user.credits
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to get subscription' })
  }
}

// ✅ 7. Change subscription plan (upgrade/downgrade)
export const changeSubscriptionPlan = async (req, res) => {
  try {
    const { newPlanId } = req.body
    const userId = req.id

    const user = await User.findById(userId)

    if (!user?.subscription?.subscriptionId) {
      return res.status(400).json({ error: 'No active subscription' })
    }

    const newPlan = SUBSCRIPTION_PLANS[newPlanId]
    if (!newPlan || newPlan.id === 'free') {
      return res.status(400).json({ error: 'Invalid plan' })
    }

    // Get current subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(
      user.subscription.subscriptionId
    )

    // Update subscription (proration happens automatically)
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.id,
      {
        items: [{
          id: subscription.items.data[0].id,
          price_data: {
            currency: "inr",
            product_data: {
              name: `${newPlan.name} Plan`
            },
            unit_amount: newPlan.price * 100,
            recurring: { interval: newPlan.interval }
          }
        }],
        metadata: {
          userId: userId.toString(),
          planId: newPlan.id,
          credits: newPlan.credits.toString()
        },
        proration_behavior: 'create_prorations'  // Pro-rated billing
      }
    )

    // Update user plan
    await User.findByIdAndUpdate(userId, {
      'subscription.plan': newPlan.id
    })

    res.json({
      success: true,
      message: `Plan changed to ${newPlan.name}`,
      subscription: updatedSubscription
    })

  } catch (error) {
    console.error('❌ Change plan error:', error)
    res.status(500).json({ error: 'Failed to change plan' })
  }
}
