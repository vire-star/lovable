// frontend/src/pages/HomePage.jsx

import { useProjectHook } from '@/hooks/project.hook'
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Code2, Loader2, AlertCircle, Zap, Layers, Palette, ArrowRight, Stars } from 'lucide-react'

const HomePage = () => {
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm()
  const { mutate, isPending } = useProjectHook()
  const navigate = useNavigate()
  const [generationError, setGenerationError] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  
  const promptValue = watch("prompt", "")

  // Timer for generation
  useEffect(() => {
    let interval
    if (isPending) {
      setElapsedTime(0)
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    } else {
      setElapsedTime(0)
    }
    return () => clearInterval(interval)
  }, [isPending])

  const handleSubmitForm = (data) => {
    setGenerationError(null)
    
    mutate(
      {
        prompt: data.prompt,
        isNewProject: true,
        projectId: undefined
      },
      {
        onSuccess: (responseData) => {
          console.log('✅ Project created:', responseData)
          reset()
          navigate(`/AI-room/${responseData.projectId}`)
        },
        onError: (error) => {
          console.error('❌ Project creation error:', error)
          
          let errorMessage = error.message || 'Failed to create project'
          if (errorMessage.includes('timeout')) {
            errorMessage = '⏱️ Request took too long. Try a simpler prompt.'
          }
          setGenerationError(errorMessage)
        }
      }
    )
  }

  const examplePrompts = [
    {
      icon: <Zap className="w-5 h-5" />,
      text: "Todo App",
      prompt: "Create a todo list app with dark mode toggle, add/delete tasks, and mark as complete",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      icon: <Layers className="w-5 h-5" />,
      text: "Weather Dashboard",
      prompt: "Build a weather dashboard with current conditions, 5-day forecast, and temperature unit toggle",
      gradient: "from-purple-500 to-indigo-500"
    },
    {
      icon: <Palette className="w-5 h-5" />,
      text: "Portfolio Site",
      prompt: "Create a modern portfolio website with hero section, projects grid, and contact form",
      gradient: "from-rose-500 to-pink-500"
    }
  ]

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-rose-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>

      {/* Content */}
      <div className="relative max-w-6xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-purple-500/10 border border-pink-500/20 backdrop-blur-sm">
            <Stars className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-medium bg-gradient-to-r from-pink-200 via-rose-200 to-purple-200 text-transparent bg-clip-text">
              AI-Powered Development
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="block text-white mb-2">
              Build React Apps
            </span>
            <span className="block bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 text-transparent bg-clip-text">
              In Seconds
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Describe your idea in plain English. Watch AI transform it into a beautiful, 
            production-ready React application instantly.
          </p>
        </div>

        {/* Main Form */}
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-5">
            
            {/* Input Container */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-start pt-4 pointer-events-none z-10">
                  <Code2 className="w-5 h-5 text-slate-500" />
                </div>
                
                <textarea
                  {...register("prompt", {
                    required: "Please describe your project",
                    minLength: { value: 10, message: "At least 10 characters required" },
                    maxLength: { value: 500, message: "Maximum 500 characters" }
                  })}
                  placeholder="Describe your project... (e.g., 'Create a task manager with drag and drop, priority labels, and dark mode')"
                  disabled={isPending}
                  rows={5}
                  className={`w-full pl-12 pr-4 py-4 text-base bg-slate-900/90 backdrop-blur-xl border rounded-2xl focus:outline-none transition-all resize-none text-slate-100 placeholder:text-slate-500 ${
                    errors.prompt 
                      ? 'border-red-500/50 focus:border-red-500' 
                      : 'border-slate-800 focus:border-pink-500/50'
                  } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                
                {/* Character count */}
                <div className="absolute bottom-3 right-3 text-xs text-slate-600 font-mono">
                  {promptValue.length}/500
                </div>
              </div>
            </div>

            {/* Error Messages */}
            {errors.prompt && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errors.prompt.message}</span>
              </div>
            )}

            {generationError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-300">Creation Failed</p>
                  <p className="text-sm text-red-400 mt-1">{generationError}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending || !promptValue.trim()}
              className="group relative w-full py-4 px-6 rounded-xl font-semibold text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 transition-all duration-300 group-hover:scale-105"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-rose-400 to-purple-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
              
              <div className="relative flex items-center justify-center gap-3 text-white">
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating... {elapsedTime}s</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Project</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Loading Progress */}
          {isPending && (
            <div className="mt-6 p-5 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-ping"></div>
                    <div className="w-2 h-2 bg-pink-500 rounded-full absolute inset-0"></div>
                  </div>
                  <p className="text-sm font-medium text-slate-300">
                    {elapsedTime < 15 && 'Analyzing requirements...'}
                    {elapsedTime >= 15 && elapsedTime < 30 && 'Generating components...'}
                    {elapsedTime >= 30 && elapsedTime < 45 && 'Applying styles...'}
                    {elapsedTime >= 45 && 'Finalizing project...'}
                  </p>
                </div>
                <span className="text-xs text-slate-500 font-mono">{elapsedTime}s</span>
              </div>
              
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min((elapsedTime / 60) * 100, 95)}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Example Prompts */}
          <div className="mt-12">
            <p className="text-sm font-medium text-slate-400 mb-4">
              ✨ Quick start examples
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    const textarea = document.querySelector('textarea[name="prompt"]')
                    if (textarea) {
                      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                        window.HTMLTextAreaElement.prototype,
                        'value'
                      ).set
                      nativeInputValueSetter.call(textarea, example.prompt)
                      textarea.dispatchEvent(new Event('input', { bubbles: true }))
                    }
                  }}
                  disabled={isPending}
                  className="group relative p-4 bg-slate-900/50 backdrop-blur-xl border border-slate-800 hover:border-pink-500/30 rounded-xl transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${example.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`text-transparent bg-gradient-to-r ${example.gradient} bg-clip-text group-hover:scale-110 transition-transform duration-300`}>
                        {example.icon}
                      </div>
                      <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                        {example.text}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {example.prompt}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid gap-8 sm:grid-cols-3 max-w-5xl mx-auto">
          {[
            {
              icon: Zap,
              title: "Lightning Fast",
              description: "Generate complete React apps in under a minute",
              gradient: "from-pink-500 to-rose-500"
            },
            {
              icon: Code2,
              title: "Production Ready",
              description: "Clean, optimized code with modern styling",
              gradient: "from-rose-500 to-purple-500"
            },
            {
              icon: Layers,
              title: "Fully Editable",
              description: "Modify code manually or use AI assistance",
              gradient: "from-purple-500 to-pink-500"
            }
          ].map((feature, index) => (
            <div key={index} className="group relative p-6 bg-slate-900/30 backdrop-blur-xl border border-slate-800 rounded-xl hover:border-pink-500/30 transition-all duration-300">
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl`}></div>
              
              <div className="relative">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} bg-opacity-10 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 bg-gradient-to-r ${feature.gradient} text-transparent bg-clip-text`} />
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HomePage
