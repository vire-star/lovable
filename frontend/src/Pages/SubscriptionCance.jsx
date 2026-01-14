import React from 'react'
import { useNavigate } from 'react-router-dom'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'

const SubscriptionCancel = () => {
  const navigate = useNavigate()

  return (
    <div className='min-h-screen bg-slate-950 flex items-center justify-center px-4'>
      <div className='max-w-md w-full'>
        <div className='bg-slate-900 border-2 border-orange-500/50 rounded-2xl p-8 text-center relative overflow-hidden'>
          {/* Background Effect */}
          <div className='absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10'></div>
          
          <div className='relative z-10'>
            {/* Cancel Icon */}
            <div className='relative mb-6'>
              <div className='w-20 h-20 mx-auto bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/50'>
                <XCircle className='w-12 h-12 text-white' />
              </div>
              <div className='absolute inset-0 blur-2xl bg-orange-500/30 rounded-full'></div>
            </div>

            {/* Cancel Message */}
            <h2 className='text-3xl font-bold bg-gradient-to-r from-white to-orange-200 text-transparent bg-clip-text mb-2'>
              Payment Canceled
            </h2>
            <p className='text-slate-300 mb-6'>
              You canceled the subscription process. No charges were made.
            </p>

            {/* Info Box */}
            <div className='bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6 text-left'>
              <p className='text-sm text-slate-400 mb-3'>
                <strong className='text-white'>What happened?</strong>
              </p>
              <ul className='space-y-2 text-sm text-slate-400'>
                <li className='flex items-start gap-2'>
                  <span className='text-orange-400'>•</span>
                  <span>Your payment was not processed</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-orange-400'>•</span>
                  <span>No charges were made to your card</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-orange-400'>•</span>
                  <span>You can try again anytime</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className='space-y-3'>
              <button
                onClick={() => navigate('/offers')}
                className='group relative w-full py-3 rounded-xl font-semibold text-white overflow-hidden transition-all hover:scale-105'
              >
                <div className='absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500'></div>
                <div className='absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300'></div>
                <div className='relative flex items-center justify-center gap-2'>
                  <RefreshCw className='w-4 h-4' />
                  <span>Try Again</span>
                </div>
              </button>

              <button
                onClick={() => navigate('/')}
                className='w-full flex items-center justify-center gap-2 py-3 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-all font-semibold'
              >
                <ArrowLeft className='w-4 h-4' />
                <span>Go Home</span>
              </button>
            </div>

            {/* Help Text */}
            <p className='text-xs text-slate-500 mt-6'>
              Need help? Contact our support team
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionCancel
