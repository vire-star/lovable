import { useCreatePaymentHook } from '@/hooks/payment.hook'
import React from 'react'
import { Sparkles, Crown, Zap, Rocket } from 'lucide-react'

const Offers = () => {
  const { mutate, isPending } = useCreatePaymentHook()
  
  const handleClick = (planId) => {
    console.log('🚀 Initiating payment for:', planId)
    mutate({ planId }) // ✅ Fixed: Send as object with planId key
  }

  return (
    <div className='min-h-screen bg-slate-950 py-12 px-4'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-12'>
          <h1 className='text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-pink-100 to-pink-200 text-transparent bg-clip-text mb-4'>
            Choose Your Plan
          </h1>
          <p className='text-slate-400 text-lg'>
            Select the perfect plan for your needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {/* Free Plan */}
          <div className='bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all'>
            <div className='mb-4'>
              <Sparkles className='w-8 h-8 text-slate-400 mb-2' />
              <h3 className='text-2xl font-bold text-white'>Free</h3>
              <p className='text-slate-400 text-sm mt-2'>Get started for free</p>
            </div>
            <div className='mb-6'>
              <span className='text-4xl font-bold text-white'>₹0</span>
              <span className='text-slate-400'>/lifetime</span>
            </div>
            <ul className='space-y-3 mb-6'>
              <li className='text-slate-300 text-sm'>✓ 3 AI generations</li>
              <li className='text-slate-300 text-sm'>✓ Basic support</li>
            </ul>
            <button
              disabled
              className='w-full py-3 bg-slate-800 text-slate-400 rounded-lg cursor-not-allowed'
            >
              Current Plan
            </button>
          </div>

          {/* Starter Plan */}
          <div className='bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-pink-500/50 transition-all'>
            <div className='mb-4'>
              <Rocket className='w-8 h-8 text-blue-400 mb-2' />
              <h3 className='text-2xl font-bold text-white'>Starter</h3>
              <p className='text-slate-400 text-sm mt-2'>Perfect for individuals</p>
            </div>
            <div className='mb-6'>
              <span className='text-4xl font-bold text-white'>₹499</span>
              <span className='text-slate-400'>/month</span>
            </div>
            <ul className='space-y-3 mb-6'>
              <li className='text-slate-300 text-sm'>✓ 50 AI generations/month</li>
              <li className='text-slate-300 text-sm'>✓ Email support</li>
              <li className='text-slate-300 text-sm'>✓ Priority queue</li>
            </ul>
            <button
              onClick={() => handleClick('starter')}
              disabled={isPending}
              className='w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isPending ? 'Processing...' : 'Subscribe Now'}
            </button>
          </div>

          {/* Pro Plan - Popular */}
          <div className='bg-slate-900 border-2 border-pink-500 rounded-2xl p-6 relative hover:border-pink-400 transition-all'>
            <div className='absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full'>
              POPULAR
            </div>
            <div className='mb-4'>
              <Crown className='w-8 h-8 text-pink-400 mb-2' />
              <h3 className='text-2xl font-bold text-white'>Pro</h3>
              <p className='text-slate-400 text-sm mt-2'>For professionals</p>
            </div>
            <div className='mb-6'>
              <span className='text-4xl font-bold text-white'>₹999</span>
              <span className='text-slate-400'>/month</span>
            </div>
            <ul className='space-y-3 mb-6'>
              <li className='text-slate-300 text-sm'>✓ 150 AI generations/month</li>
              <li className='text-slate-300 text-sm'>✓ Priority support</li>
              <li className='text-slate-300 text-sm'>✓ 2x faster generation</li>
              <li className='text-slate-300 text-sm'>✓ Advanced features</li>
            </ul>
            <button
              onClick={() => handleClick('pro')}
              disabled={isPending}
              className='w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/25'
            >
              {isPending ? 'Processing...' : 'Subscribe Now'}
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className='bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all'>
            <div className='mb-4'>
              <Zap className='w-8 h-8 text-purple-400 mb-2' />
              <h3 className='text-2xl font-bold text-white'>Enterprise</h3>
              <p className='text-slate-400 text-sm mt-2'>For teams & agencies</p>
            </div>
            <div className='mb-6'>
              <span className='text-4xl font-bold text-white'>₹2,999</span>
              <span className='text-slate-400'>/month</span>
            </div>
            <ul className='space-y-3 mb-6'>
              <li className='text-slate-300 text-sm'>✓ 500 AI generations/month</li>
              <li className='text-slate-300 text-sm'>✓ 24/7 support</li>
              <li className='text-slate-300 text-sm'>✓ 5x faster generation</li>
              <li className='text-slate-300 text-sm'>✓ Custom integrations</li>
              <li className='text-slate-300 text-sm'>✓ API access</li>
            </ul>
            <button
              onClick={() => handleClick('enterprise')}
              disabled={isPending}
              className='w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isPending ? 'Processing...' : 'Subscribe Now'}
            </button>
          </div>
        </div>

        {/* Info Note */}
        <div className='mt-8 text-center text-sm text-slate-500'>
          <p>💳 All payments are processed securely through Stripe</p>
          <p className='mt-2'>🔄 Cancel anytime. No hidden fees.</p>
        </div>
      </div>
    </div>
  )
}

export default Offers
