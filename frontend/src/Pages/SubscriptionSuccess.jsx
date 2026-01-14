import { usePaymentVerifyHook } from '@/hooks/payment.hook'
import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, Loader2, Sparkles, Zap, ArrowRight } from 'lucide-react'

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const navigate = useNavigate()
  const { mutate, isPending, isSuccess, isError, data, error } = usePaymentVerifyHook()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (sessionId) {
      console.log('Verifying payment for session ID:', sessionId)
      mutate({ sessionId })
    } else {
      console.log('No session ID found in URL parameters.')
      navigate('/')
    }
  }, [sessionId, mutate, navigate])

  // Countdown timer
  useEffect(() => {
    if (isSuccess && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)

      return () => clearTimeout(timer)
    } else if (isSuccess && countdown === 0) {
      navigate('/projects')
    }
  }, [isSuccess, countdown, navigate])

  return (
    <div className='min-h-screen bg-slate-950 flex items-center justify-center px-4'>
      <div className='max-w-md w-full'>
        {/* Verifying State */}
        {isPending && (
          <div className='bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center'>
            <div className='relative mb-6'>
              <div className='w-20 h-20 mx-auto'>
                <Loader2 className='w-full h-full text-pink-400 animate-spin' />
              </div>
              <div className='absolute inset-0 blur-xl bg-pink-500/20 rounded-full animate-pulse'></div>
            </div>
            
            <h2 className='text-2xl font-bold text-white mb-2'>
              Verifying Payment
            </h2>
            <p className='text-slate-400'>
              Please wait while we confirm your subscription...
            </p>

            <div className='mt-6 flex items-center justify-center gap-1'>
              <div className='w-2 h-2 bg-pink-400 rounded-full animate-bounce' style={{ animationDelay: '0ms' }}></div>
              <div className='w-2 h-2 bg-pink-400 rounded-full animate-bounce' style={{ animationDelay: '150ms' }}></div>
              <div className='w-2 h-2 bg-pink-400 rounded-full animate-bounce' style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        {/* Success State */}
        {isSuccess && (
          <div className='bg-slate-900 border-2 border-green-500/50 rounded-2xl p-8 text-center relative overflow-hidden'>
            {/* Background Effect */}
            <div className='absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-pink-500/10'></div>
            
            <div className='relative z-10'>
              {/* Success Icon */}
              <div className='relative mb-6'>
                <div className='w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50'>
                  <CheckCircle className='w-12 h-12 text-white' />
                </div>
                <div className='absolute inset-0 blur-2xl bg-green-500/30 rounded-full animate-pulse'></div>
              </div>

              {/* Success Message */}
              <h2 className='text-3xl font-bold bg-gradient-to-r from-white to-green-200 text-transparent bg-clip-text mb-2'>
                Payment Successful!
              </h2>
              <p className='text-slate-300 mb-6'>
                {data?.message || 'Your subscription has been activated successfully.'}
              </p>

              {/* Credits Info */}
              {data?.credits && (
                <div className='bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6'>
                  <div className='flex items-center justify-center gap-3 mb-2'>
                    <Zap className='w-6 h-6 text-yellow-400' />
                    <span className='text-2xl font-bold text-white'>
                      +{data.credits.available}
                    </span>
                    <span className='text-slate-400'>Credits</span>
                  </div>
                  <p className='text-xs text-slate-500'>
                    Total: {data.credits.total} credits
                  </p>
                </div>
              )}

              {/* Subscription Info */}
              {data?.subscription && (
                <div className='bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-xl p-4 mb-6'>
                  <div className='flex items-center justify-center gap-2 mb-2'>
                    <Sparkles className='w-5 h-5 text-pink-400' />
                    <span className='text-lg font-bold text-white capitalize'>
                      {data.subscription.plan} Plan
                    </span>
                  </div>
                  <p className='text-xs text-slate-400'>
                    Active until {new Date(data.subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Countdown */}
              <div className='flex items-center justify-center gap-2 text-sm text-slate-400 mb-6'>
                <span>Redirecting in</span>
                <span className='text-pink-400 font-bold'>{countdown}s</span>
              </div>

              {/* Action Button */}
              <button
                onClick={() => navigate('/projects')}
                className='group relative w-full py-3 rounded-xl font-semibold text-white overflow-hidden transition-all hover:scale-105'
              >
                <div className='absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500'></div>
                <div className='absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300'></div>
                <div className='relative flex items-center justify-center gap-2'>
                  <span>Go to Projects</span>
                  <ArrowRight className='w-4 h-4' />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className='bg-slate-900 border-2 border-red-500/50 rounded-2xl p-8 text-center'>
            <div className='relative mb-6'>
              <div className='w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center'>
                <span className='text-4xl'>❌</span>
              </div>
            </div>

            <h2 className='text-2xl font-bold text-white mb-2'>
              Payment Failed
            </h2>
            <p className='text-slate-400 mb-6'>
              {error?.response?.data?.message || 'Something went wrong. Please try again.'}
            </p>

            <div className='space-y-3'>
              <button
                onClick={() => navigate('/offers')}
                className='w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all font-semibold'
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/')}
                className='w-full py-3 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-all font-semibold'
              >
                Go Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SubscriptionSuccess
