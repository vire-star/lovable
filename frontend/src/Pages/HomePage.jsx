// frontend/src/pages/HomePage.jsx

import { useProjectHook } from '@/hooks/project.hook'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Code2, Loader2, AlertCircle, Zap, Layers, Palette } from 'lucide-react'

const HomePage = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm()
  const { mutate, isPending, error: mutationError } = useProjectHook()
  const navigate = useNavigate()
  const [generationError, setGenerationError] = useState(null)

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
          // Navigate to the AI room
          navigate(`/AI-room/${responseData.projectId}`)
        },
        onError: (error) => {
          console.error('❌ Project creation error:', error)
          setGenerationError(error.message || 'Failed to create project. Please try again.')
        }
      }
    )
  }

  const examplePrompts = [
    {
      icon: <Zap className="w-5 h-5" />,
      text: "Todo app with dark mode",
      prompt: "Create a todo list app with dark mode toggle, add/delete tasks, and mark as complete"
    },
    {
      icon: <Layers className="w-5 h-5" />,
      text: "Weather dashboard",
      prompt: "Build a weather dashboard with current conditions, 5-day forecast, and temperature unit toggle"
    },
    {
      icon: <Palette className="w-5 h-5" />,
      text: "Portfolio website",
      prompt: "Create a modern portfolio website with hero section, projects grid, and contact form"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-4">
            Build React Apps with{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              AI Magic
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Describe your idea in plain English and watch AI transform it into a beautiful, 
            working React application in seconds.
          </p>
        </div>

        {/* Main Form */}
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Code2 className="w-5 h-5 text-gray-400" />
              </div>
              <textarea
                {...register("prompt", {
                  required: "Please describe your project",
                  minLength: {
                    value: 10,
                    message: "Description should be at least 10 characters"
                  },
                  maxLength: {
                    value: 500,
                    message: "Description should not exceed 500 characters"
                  }
                })}
                placeholder="Describe your project... (e.g., 'Create a task manager with drag and drop, priority labels, and dark mode')"
                disabled={isPending}
                rows={4}
                className={`w-full pl-12 pr-4 py-4 text-base border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none ${
                  errors.prompt 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-200 focus:border-blue-500'
                } ${
                  isPending ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                }`}
              />
              
              {/* Character count */}
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {register("prompt").ref?.current?.value?.length || 0}/500
              </div>
            </div>

            {/* Validation Error */}
            {errors.prompt && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.prompt.message}</span>
              </div>
            )}

            {/* Mutation Error */}
            {generationError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900">Creation Failed</p>
                  <p className="text-sm text-red-700 mt-1">{generationError}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all transform ${
                isPending
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02] active:scale-[0.98]'
              } text-white shadow-lg hover:shadow-xl flex items-center justify-center gap-3`}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating your project...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Create New Project</span>
                </>
              )}
            </button>
          </form>

          {/* Loading Progress */}
          {isPending && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <p className="text-sm font-semibold text-blue-900">
                  AI is crafting your application...
                </p>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-blue-600 animate-pulse" style={{ width: '70%' }}></div>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                This may take 30-60 seconds. Please wait...
              </p>
            </div>
          )}

          {/* Example Prompts */}
          <div className="mt-8">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Need inspiration? Try these:
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    // Auto-fill the textarea with example prompt
                    const textarea = document.querySelector('textarea')
                    if (textarea) {
                      textarea.value = example.prompt
                      textarea.dispatchEvent(new Event('input', { bubbles: true }))
                    }
                  }}
                  disabled={isPending}
                  className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-blue-600 group-hover:scale-110 transition-transform">
                      {example.icon}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {example.text}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {example.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid gap-8 sm:grid-cols-3 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
            <p className="text-sm text-gray-600">
              Generate complete React apps in under a minute
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-3">
              <Code2 className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Production Ready</h3>
            <p className="text-sm text-gray-600">
              Clean, optimized code with Tailwind CSS styling
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
              <Layers className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Fully Editable</h3>
            <p className="text-sm text-gray-600">
              Modify code manually or use AI to make changes
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
