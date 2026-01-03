// backend/routes/payment.route.js

import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import {   createSubscriptionCheckout, getCurrentSubscription, getSubscriptionPlans, verifySubscription } from '../controllers/payment.controller.js'

const paymentRoute = express.Router()

// ✅ Public routes
// paymentRoute.get('/packages', getCreditPackages)

// // ✅ Webhook (NO authentication, RAW body required)
// paymentRoute.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook)

// ✅ Protected routes (require authentication)
paymentRoute.post('/create-checkout', authMiddleware, createSubscriptionCheckout)
paymentRoute.post('/verify', authMiddleware, verifySubscription)
paymentRoute.get('/getPlan', authMiddleware, getSubscriptionPlans)
paymentRoute.get('/getCurrentPlan', authMiddleware, getCurrentSubscription)
// paymentRoute.get('/balance', isAuthenticated, getCreditBalance)
// paymentRoute.get('/transactions', isAuthenticated, getTransactionHistory)

export default paymentRoute
