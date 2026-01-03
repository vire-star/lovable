// frontend/src/pages/Projects.jsx

import { useGetAllProjectsHook } from '@/hooks/project.hook'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FolderOpen, 
  Loader2, 
  Plus, 
  Code2, 
  Calendar, 
  FileText,
  ArrowRight,
  AlertCircle,
  Sparkles
} from 'lucide-react'

const Projects = () => {
  const { data, isLoading, error } = useGetAllProjectsHook()
  const navigate = useNavigate()
  
  console.log('Projects data:', data)

  // Loading State
  if (isLoading) {
    return (
      <div className='min-h-screen bg-slate-950 flex items-center justify-center'>
        <div className='text-center space-y-4'>
          <Loader2 className='w-12 h-12 text-pink-500 animate-spin mx-auto' />
          <p className='text-slate-400'>Loading your projects...</p>
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className='min-h-screen bg-slate-950 flex items-center justify-center p-4'>
        <div className='max-w-md w-full p-6 bg-slate-900/50 backdrop-blur-xl border border-red-500/20 rounded-xl'>
          <AlertCircle className='w-12 h-12 text-red-400 mx-auto mb-4' />
          <h2 className='text-xl font-semibold text-white text-center mb-2'>
            Failed to Load Projects
          </h2>
          <p className='text-slate-400 text-center mb-4'>
            {error.message || 'Something went wrong'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className='w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors'
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const projects = data?.projects || []

  return (
    <div className='min-h-screen bg-slate-950 relative overflow-hidden'>
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-pink-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>

      {/* Content */}
      <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        
        {/* Header */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12'>
          <div>
            <h1 className='text-4xl font-bold text-white mb-2 flex items-center gap-3'>
              <div className='relative'>
                <div className='absolute inset-0 bg-pink-500/20 blur-xl rounded-full'></div>
                <FolderOpen className='relative w-10 h-10 text-pink-400' />
              </div>
              My Projects
            </h1>
            <p className='text-slate-400'>
              {projects.length} {projects.length === 1 ? 'project' : 'projects'} created
            </p>
          </div>

          {/* Create New Project Button */}
          <button
            onClick={() => navigate('/')}
            className='group relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 overflow-hidden hover:scale-105'
          >
            <div className='absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600'></div>
            <div className='absolute inset-0 bg-gradient-to-r from-pink-400 via-rose-400 to-purple-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300'></div>
            <div className='relative flex items-center gap-2 text-white'>
              <Plus className='w-5 h-5' />
              <span>New Project</span>
            </div>
          </button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          // Empty State
          <div className='flex flex-col items-center justify-center py-20'>
            <div className='relative mb-6'>
              <div className='absolute inset-0 bg-pink-500/10 blur-2xl rounded-full'></div>
              <div className='relative w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 flex items-center justify-center'>
                <FolderOpen className='w-12 h-12 text-slate-600' />
              </div>
            </div>
            
            <h2 className='text-2xl font-bold text-white mb-2'>No projects yet</h2>
            <p className='text-slate-400 mb-8 text-center max-w-md'>
              Start building amazing React applications with AI assistance
            </p>
            
            <button
              onClick={() => navigate('/')}
              className='group relative px-8 py-4 rounded-xl font-semibold transition-all duration-300 overflow-hidden hover:scale-105'
            >
              <div className='absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600'></div>
              <div className='absolute inset-0 bg-gradient-to-r from-pink-400 via-rose-400 to-purple-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300'></div>
              <div className='relative flex items-center gap-2 text-white'>
                <Sparkles className='w-5 h-5' />
                <span>Create Your First Project</span>
                <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
              </div>
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {projects.map((project) => (
              <div
                key={project._id}
                onClick={() => navigate(`/AI-room/${project._id}`)}
                className='group relative p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-800 hover:border-pink-500/30 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden'
              >
                {/* Gradient overlay on hover */}
                <div className='absolute inset-0 bg-gradient-to-br from-pink-500/5 via-rose-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                
                <div className='relative'>
                  {/* Icon */}
                  <div className='flex items-center justify-between mb-4'>
                    <div className='w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500/10 to-purple-500/10 flex items-center justify-center border border-pink-500/20 group-hover:scale-110 transition-transform duration-300'>
                      <Code2 className='w-6 h-6 text-pink-400' />
                    </div>
                    
                    <ArrowRight className='w-5 h-5 text-slate-600 group-hover:text-pink-400 group-hover:translate-x-1 transition-all duration-300' />
                  </div>

                  {/* Project Name */}
                  <h2 className='text-xl font-semibold text-white mb-3 group-hover:text-pink-200 transition-colors line-clamp-2'>
                    {project.name}
                  </h2>

                  {/* Metadata */}
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-sm text-slate-400'>
                      <FileText className='w-4 h-4 text-slate-500' />
                      <span>{project.files?.length || 0} files</span>
                    </div>
                    
                    <div className='flex items-center gap-2 text-sm text-slate-400'>
                      <Calendar className='w-4 h-4 text-slate-500' />
                      <span>
                        {new Date(project.metadata?.lastModified || project.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Bottom gradient line */}
                  <div className='mt-4 h-1 bg-gradient-to-r from-pink-500/0 via-pink-500/50 to-pink-500/0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Projects
