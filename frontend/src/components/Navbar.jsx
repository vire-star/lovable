// frontend/src/components/Navbar.jsx

import { userStore } from '@/Store/UserStore'
import React, { useState, useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { useGetUserHook, useLogoutHook } from '@/hooks/user.hook'
import { useNavigate } from 'react-router-dom'
import { LogOut, FolderOpen, Loader2, Sparkles, Code2, Menu, X, Zap, Crown } from 'lucide-react'

const Navbar = () => {
  const user = userStore((state) => state.user)
  const clearUser = userStore((state) => state.clearUser)
  const navigate = useNavigate()
  const { mutate: logout, isPending } = useLogoutHook()
  const { data } = useGetUserHook()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  console.log(data)

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [navigate])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const logoutHandler = () => {
    console.log('🚪 Logout initiated')
    
    logout({}, {
      onSuccess: (data) => {
        console.log('✅ Logout success:', data)
        clearUser()
        setIsMobileMenuOpen(false)
        setTimeout(() => navigate('/'), 100)
      },
      onError: (error) => {
        console.error('❌ Logout failed:', error)
        clearUser()
        setIsMobileMenuOpen(false)
        navigate('/')
      }
    })
  }

  return (
    <>
      <nav className='sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            {/* Logo Section */}
            <div 
              onClick={() => navigate('/')}
              className='flex items-center gap-2 cursor-pointer group z-50'
            >
              <div className='relative'>
                <div className='absolute inset-0 bg-pink-500/20 blur-xl rounded-full group-hover:bg-pink-500/30 transition-all duration-300'></div>
                <div className='relative w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/25 group-hover:shadow-pink-500/40 transition-all duration-300'>
                  <Code2 className='w-5 h-5 text-white' strokeWidth={2.5} />
                </div>
              </div>
              <span className='text-xl font-bold bg-gradient-to-r from-white via-pink-100 to-pink-200 text-transparent bg-clip-text group-hover:from-pink-200 group-hover:via-pink-100 group-hover:to-white transition-all duration-300'>
                Buildly
              </span>
            </div>
            
            {/* Desktop Menu */}
            <div className='hidden md:flex items-center gap-4'>
              {user ? (
                <>
                  {/* Credits Display */}
                  <div className='flex items-center gap-3 px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg'>
                    <div className='relative'>
                      <Zap className='w-5 h-5 text-yellow-400' />
                      <div className='absolute inset-0 blur-sm bg-yellow-400/30 rounded-full'></div>
                    </div>
                    <div className='flex flex-col'>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-bold text-white'>
                          {user?.credits?.available || 0}
                        </span>
                        <span className='text-xs text-slate-500'>/</span>
                        <span className='text-xs text-slate-400'>
                          {user?.credits?.total || 0}
                        </span>
                      </div>
                      <span className='text-xs text-slate-500'>Credits</span>
                    </div>
                  </div>

                  {/* My Projects Button */}
                  <button
                    onClick={() => navigate('/projects')}
                    className='group relative px-4 py-2 rounded-lg overflow-hidden transition-all duration-300'
                  >
                    <div className='absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                    <div className='absolute inset-0 border border-pink-500/0 group-hover:border-pink-500/30 rounded-lg transition-all duration-300'></div>
                    <div className='relative flex items-center gap-2'>
                      <FolderOpen className='w-4 h-4 text-slate-400 group-hover:text-pink-400 transition-colors duration-300' />
                      <span className='text-sm font-medium text-slate-300 group-hover:text-white transition-colors duration-300'>
                        Projects
                      </span>
                    </div>
                  </button>

                  {/* Upgrade Button */}
                  <button
                    onClick={() => navigate('/offers')}
                    className='group relative px-4 py-2 rounded-lg overflow-hidden transition-all duration-300'
                  >
                    <div className='absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                    <div className='absolute inset-0 border border-yellow-500/0 group-hover:border-yellow-500/30 rounded-lg transition-all duration-300'></div>
                    <div className='relative flex items-center gap-2'>
                      <Crown className='w-4 h-4 text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300' />
                      <span className='text-sm font-medium text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300'>
                        Upgrade
                      </span>
                    </div>
                  </button>
                  
                  {/* User Profile Popover */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className='group relative flex items-center gap-3 pl-3 pr-4 py-2 rounded-lg hover:bg-slate-900/50 transition-all duration-300'>
                        <div className='relative'>
                          <div className='absolute inset-0 bg-pink-500/30 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                          <div className='relative w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-md shadow-pink-500/20 group-hover:shadow-pink-500/40 transition-all duration-300'>
                            <span className='text-sm font-bold text-white'>
                              {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                        </div>
                        <span className='text-sm font-medium text-slate-300 group-hover:text-white transition-colors duration-300'>
                          {user?.name}
                        </span>
                      </button>
                    </PopoverTrigger>
                    
                    <PopoverContent 
                      className='w-72 p-0 bg-slate-900 border border-slate-800 shadow-2xl shadow-black/50 overflow-hidden' 
                      align='end'
                      sideOffset={8}
                    >
                      <div className='relative px-4 py-4 bg-gradient-to-br from-slate-900 via-slate-900 to-pink-950/20 border-b border-slate-800'>
                        <div className='absolute inset-0 bg-gradient-to-r from-pink-500/5 to-purple-500/5'></div>
                        <div className='relative'>
                          <p className='text-sm font-semibold text-white truncate'>
                            {user?.name}
                          </p>
                          <p className='text-xs text-slate-400 truncate mt-0.5'>
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      
                      <div className='p-2'>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            logoutHandler()
                          }}
                          disabled={isPending}
                          className='group w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                          <div className='w-8 h-8 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 flex items-center justify-center transition-colors duration-200'>
                            {isPending ? (
                              <Loader2 className='w-4 h-4 text-red-400 animate-spin' />
                            ) : (
                              <LogOut className='w-4 h-4 text-red-400' />
                            )}
                          </div>
                          <span className='font-medium'>
                            {isPending ? 'Logging out...' : 'Logout'}
                          </span>
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </>
              ) : (
                <div className='flex items-center gap-3'>
                  <button 
                    onClick={() => navigate('/login')}
                    className='px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200'
                  >
                    Sign In
                  </button>
                  
                  <button 
                    onClick={() => navigate('/register')}
                    className='group relative px-5 py-2 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105'
                  >
                    <div className='absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 opacity-100 group-hover:opacity-90 transition-opacity duration-300'></div>
                    <div className='absolute inset-0 bg-gradient-to-r from-pink-400 via-rose-400 to-purple-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300'></div>
                    <div className='relative flex items-center gap-2'>
                      <Sparkles className='w-4 h-4 text-white' />
                      <span className='text-sm font-semibold text-white'>
                        Get Started
                      </span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='md:hidden relative z-50 p-2 rounded-lg hover:bg-slate-900/50 transition-colors'
              aria-label='Toggle menu'
            >
              {isMobileMenuOpen ? (
                <X className='w-6 h-6 text-white' />
              ) : (
                <Menu className='w-6 h-6 text-white' />
              )}
            </button>
          </div>
        </div>
        
        <div className='h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent'></div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className='md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40'
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <div
        className={`md:hidden fixed top-16 right-0 bottom-0 w-full sm:w-80 bg-slate-900 border-l border-slate-800 z-40 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className='flex flex-col h-full'>
          {data ? (
            <>
              {/* User Info */}
              <div className='p-4 border-b border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-pink-950/20'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='relative w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/25'>
                    <span className='text-lg font-bold text-white'>
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-semibold text-white truncate'>
                      {user?.name}
                    </p>
                    <p className='text-xs text-slate-400 truncate'>
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Credits Display Mobile */}
                <div className='flex items-center gap-3 px-3 py-2 bg-slate-800/50 rounded-lg'>
                  <Zap className='w-5 h-5 text-yellow-400' />
                  <div className='flex-1'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-bold text-white'>
                        {data?.credits?.available || 0}
                      </span>
                      <span className='text-xs text-slate-500'>/</span>
                      <span className='text-xs text-slate-400'>
                        {data?.credits?.total || 0}
                      </span>
                    </div>
                    <span className='text-xs text-slate-500'>Credits Available</span>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className='flex-1 overflow-y-auto p-4 space-y-2'>
                <button
                  onClick={() => {
                    navigate('/projects')
                    setIsMobileMenuOpen(false)
                  }}
                  className='w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all'
                >
                  <FolderOpen className='w-5 h-5 text-pink-400' />
                  <span className='text-sm font-medium'>My Projects</span>
                </button>

                <button
                  onClick={() => {
                    navigate('/offers')
                    setIsMobileMenuOpen(false)
                  }}
                  className='w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all'
                >
                  <Crown className='w-5 h-5 text-yellow-400' />
                  <span className='text-sm font-medium'>Upgrade to Pro</span>
                </button>
              </div>

              {/* Logout Button */}
              <div className='p-4 border-t border-slate-800'>
                <button
                  onClick={logoutHandler}
                  disabled={isPending}
                  className='w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50'
                >
                  {isPending ? (
                    <Loader2 className='w-5 h-5 text-red-400 animate-spin' />
                  ) : (
                    <LogOut className='w-5 h-5 text-red-400' />
                  )}
                  <span className='text-sm font-medium'>
                    {isPending ? 'Logging out...' : 'Logout'}
                  </span>
                </button>
              </div>
            </>
          ) : (
            <div className='p-4 space-y-3'>
              <button
                onClick={() => {
                  navigate('/login')
                  setIsMobileMenuOpen(false)
                }}
                className='w-full px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all'
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  navigate('/register')
                  setIsMobileMenuOpen(false)
                }}
                className='w-full group relative px-4 py-3 rounded-lg overflow-hidden transition-all'
              >
                <div className='absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600'></div>
                <div className='relative flex items-center justify-center gap-2'>
                  <Sparkles className='w-4 h-4 text-white' />
                  <span className='text-sm font-semibold text-white'>
                    Get Started
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Navbar
