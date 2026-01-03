// frontend/src/pages/Login.jsx

import { useLoginHook } from '@/hooks/user.hook'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { 
  Mail, 
  Lock, 
  Loader2, 
  AlertCircle,
  Eye,
  EyeOff,
  LogIn,
  Code2,
  ArrowRight
} from 'lucide-react'

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { mutate, isPending } = useLoginHook()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState(null)

  const loginHandler = (data) => {
    setApiError(null)
    mutate(data, {
      onSuccess: (response) => {
        console.log('✅ Login successful:', response)
        navigate('/')
      },
      onError: (error) => {
        console.error('❌ Login failed:', error)
        setApiError(error.response?.data?.message || 'Invalid email or password')
      }
    })
  }

  return (
    <div className='min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center p-4'>
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>

      {/* Content */}
      <div className='relative w-full max-w-md'>
        
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center mb-4'>
            <div className='relative'>
              <div className='absolute inset-0 bg-pink-500/20 blur-xl rounded-full'></div>
              <div className='relative w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/25'>
                <Code2 className='w-8 h-8 text-white' strokeWidth={2.5} />
              </div>
            </div>
          </div>
          
          <h1 className='text-3xl font-bold text-white mb-2'>
            Welcome Back
          </h1>
          <p className='text-slate-400'>
            Sign in to continue building with AI
          </p>
        </div>

        {/* Form Card */}
        <div className='relative group'>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
          
          <div className='relative bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl'>
            
            {/* API Error */}
            {apiError && (
              <div className='mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3'>
                <AlertCircle className='w-5 h-5 text-red-400 flex-shrink-0' />
                <div>
                  <p className='text-sm font-semibold text-red-300'>Login Failed</p>
                  <p className='text-sm text-red-400 mt-1'>{apiError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(loginHandler)} className='space-y-5'>
              
              {/* Email Input */}
              <div>
                <label className='block text-sm font-medium text-slate-300 mb-2'>
                  Email Address
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Mail className='w-5 h-5 text-slate-500' />
                  </div>
                  <input
                    type="email"
                    placeholder='you@example.com'
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    disabled={isPending}
                    className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all ${
                      errors.email 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-slate-700 focus:border-pink-500 focus:ring-pink-500/20'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                </div>
                {errors.email && (
                  <p className='mt-1 text-sm text-red-400 flex items-center gap-1'>
                    <AlertCircle className='w-3 h-3' />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label className='block text-sm font-medium text-slate-300 mb-2'>
                  Password
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Lock className='w-5 h-5 text-slate-500' />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder='••••••••'
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                    disabled={isPending}
                    className={`w-full pl-10 pr-12 py-3 bg-slate-800/50 border rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all ${
                      errors.password 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-slate-700 focus:border-pink-500 focus:ring-pink-500/20'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors'
                  >
                    {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                  </button>
                </div>
                {errors.password && (
                  <p className='mt-1 text-sm text-red-400 flex items-center gap-1'>
                    <AlertCircle className='w-3 h-3' />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className='flex justify-end'>
                <a
                  href="#"
                  className='text-sm text-pink-400 hover:text-pink-300 transition-colors'
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type='submit'
                disabled={isPending}
                className='group relative w-full py-3 px-6 rounded-lg font-semibold text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden mt-6'
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 transition-all duration-300 group-hover:scale-105"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-rose-400 to-purple-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
                
                <div className='relative flex items-center justify-center gap-2 text-white'>
                  {isPending ? (
                    <>
                      <Loader2 className='w-5 h-5 animate-spin' />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className='w-5 h-5' />
                      <span>Sign In</span>
                      <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Divider */}
            <div className='relative my-6'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-slate-700'></div>
              </div>
              <div className='relative flex justify-center text-xs'>
                <span className='px-2 bg-slate-900 text-slate-500'>
                  Don't have an account?
                </span>
              </div>
            </div>

            {/* Register Link */}
            <Link
              to="/signup"
              className='block w-full py-3 px-6 text-center border border-slate-700 hover:border-pink-500/50 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all'
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Footer Text */}
        <p className='mt-6 text-center text-xs text-slate-500'>
          Protected by industry-standard encryption
        </p>
      </div>
    </div>
  )
}

export default Login
