// frontend/src/pages/WorkingArea.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useGetProjectHook, useProjectHook } from '@/hooks/project.hook'
import Editor from '@monaco-editor/react'
import { Send, Code, Eye, MessageSquare, ExternalLink, Save, Sparkles, X, Menu } from 'lucide-react'
import { getPreviewHTML } from '@/hooks/livepreview'
import { useNavigate, useParams } from 'react-router-dom'
import { useCodeStore } from '@/Store/CodeStore'
import FileTree from '@/components/FileTree'
import { baseUrl } from '@/Api/baseUrl'

const WorkingArea = () => {
  const { id } = useParams()
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState([])
  const [currentCode, setCurrentCode] = useState('')
  const [previewCode, setPreviewCode] = useState('')
  const [activeTab, setActiveTab] = useState('code')
  const [deployedUrl, setDeployedUrl] = useState(null)
  const [files, setFiles] = useState([])
  const [activeFile, setActiveFile] = useState('src/App.jsx')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false) // Mobile chat toggle
  const { code, setCode } = useCodeStore()
  const messagesEndRef = useRef(null)
  
  const createProject = useProjectHook()
  const { data, isLoading } = useGetProjectHook(id)
  const navigate = useNavigate()

  // Load existing project data
  useEffect(() => {
    if (data?.project) {
      setFiles(data.project.files || [])
      
      const activeFilePath = data.project.activeFile || 'src/App.jsx'
      setActiveFile(activeFilePath)
      
      const activeFileData = data.project.files?.find(f => f.path === activeFilePath && f.type === 'file')
      if (activeFileData) {
        setCurrentCode(activeFileData.content || '')
        setPreviewCode(activeFileData.content || '')
      } else {
        const firstFile = data.project.files?.find(f => f.type === 'file')
        if (firstFile) {
          setCurrentCode(firstFile.content || '')
          setPreviewCode(firstFile.content || '')
          setActiveFile(firstFile.path)
        }
      }
      
      if (data.project.chatHistory && data.project.chatHistory.length > 0) {
        const formattedMessages = data.project.chatHistory
          .filter(msg => {
            const isCodeBlock = msg.content && (
              msg.content.includes('function App()') ||
              msg.content.startsWith('```') ||
              msg.content.length > 500
            )
            return !isCodeBlock
          })
          .map((msg, index) => ({
            id: `history-${index}`,
            text: msg.content,
            sender: msg.role === 'user' ? 'user' : 'ai',
            timestamp: new Date(msg.timestamp || Date.now())
          }))
        
        setMessages(formattedMessages)
      }

      if (data.project.deployUrl) {
        setDeployedUrl(data.project.deployUrl)
      }
    }
  }, [data])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Prevent scroll when mobile chat is open
  useEffect(() => {
    if (isChatOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isChatOpen])

  const handleFileSelect = useCallback((file) => {
    if (file.type === 'file') {
      if (hasUnsavedChanges) {
        const confirm = window.confirm('You have unsaved changes. Do you want to discard them?')
        if (!confirm) return
      }

      setActiveFile(file.path)
      setCurrentCode(file.content || '')
      setPreviewCode(file.content || '')
      setHasUnsavedChanges(false)
      
      setMessages(prev => [...prev, {
        id: `file-switch-${Date.now()}`,
        text: `📂 Opened ${file.name}`,
        sender: 'ai',
        timestamp: new Date()
      }])
    }
  }, [hasUnsavedChanges])

  const handleEditorChange = useCallback((value) => {
    setCurrentCode(value || '')
    setHasUnsavedChanges(true)
  }, [])

  const handleManualSave = useCallback(async () => {
    if (!currentCode || !id || !hasUnsavedChanges) return

    setIsSaving(true)

    try {
      const response = await fetch(`${baseUrl}/project/save-file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          projectId: id,
          filePath: activeFile,
          content: currentCode
        })
      })

      const result = await response.json()

      if (result.success) {
        setHasUnsavedChanges(false)
        setFiles(result.files)
        
        setMessages(prev => [...prev, {
          id: `save-${Date.now()}`,
          text: `💾 Saved changes to ${activeFile.split('/').pop()}`,
          sender: 'ai',
          timestamp: new Date()
        }])
      } else {
        throw new Error(result.error || 'Save failed')
      }
    } catch (error) {
      console.error('Save error:', error)
      
      setMessages(prev => [...prev, {
        id: `save-error-${Date.now()}`,
        text: `❌ Failed to save: ${error.message}`,
        sender: 'ai',
        timestamp: new Date()
      }])
    } finally {
      setIsSaving(false)
    }
  }, [currentCode, id, activeFile, hasUnsavedChanges])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (hasUnsavedChanges) {
          handleManualSave()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasUnsavedChanges, handleManualSave])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    const userMessage = { 
      id: `user-${Date.now()}`,
      text: prompt, 
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    const loadingMessage = {
      id: `loading-${Date.now()}`,
      text: 'Updating your component...',
      sender: 'ai',
      isLoading: true,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, loadingMessage])

    createProject.mutate(
      { 
        prompt, 
        projectId: id,
        isNewProject: false,
        targetFile: activeFile
      },
      {
        onSuccess: (responseData) => {
          if (responseData.files) {
            setFiles(responseData.files)
          }

          const updatedFile = responseData.files?.find(f => f.path === activeFile)
          if (updatedFile) {
            setCurrentCode(updatedFile.content)
            setPreviewCode(updatedFile.content)
          } else {
            const newCode = responseData.code
            if (newCode) {
              setCurrentCode(newCode)
              setPreviewCode(newCode)
            }
          }
          
          setCode(responseData)
          setHasUnsavedChanges(false)
          
          let conversationalResponse = responseData.message || ''
          
          if (!conversationalResponse) {
            const lowerPrompt = prompt.toLowerCase()
            
            if (lowerPrompt.includes('color') || lowerPrompt.includes('colour')) {
              conversationalResponse = "✅ I've updated the colors in your component as requested."
            } else if (lowerPrompt.includes('dark mode') || lowerPrompt.includes('theme')) {
              conversationalResponse = "✅ Dark mode has been added! You can now toggle between themes."
            } else if (lowerPrompt.includes('button')) {
              conversationalResponse = "✅ Button styling has been updated."
            } else if (lowerPrompt.includes('font') || lowerPrompt.includes('text')) {
              conversationalResponse = "✅ Text styles have been modified as you asked."
            } else if (lowerPrompt.includes('layout') || lowerPrompt.includes('responsive')) {
              conversationalResponse = "✅ Layout adjustments completed and optimized for responsiveness."
            } else if (lowerPrompt.includes('add')) {
              conversationalResponse = "✅ New feature added successfully to your component!"
            } else if (lowerPrompt.includes('remove') || lowerPrompt.includes('delete')) {
              conversationalResponse = "✅ Removed as requested. Check the preview!"
            } else if (lowerPrompt.includes('animation') || lowerPrompt.includes('transition')) {
              conversationalResponse = "✅ Animations have been added for a smoother experience."
            } else {
              conversationalResponse = "✅ I've updated your component based on your request. Check the code editor!"
            }
          }

          const versionInfo = responseData.project?.versions?.length 
            ? ` (Version ${responseData.project.versions.length})` 
            : ''

          setMessages(prev => 
            prev.filter(msg => !msg.isLoading).concat({
              id: `ai-${Date.now()}`,
              text: conversationalResponse + versionInfo,
              sender: 'ai',
              timestamp: new Date()
            })
          )
        },
        onError: (error) => {
          console.error('Generation error:', error)
          
          let errorMsg = error.message || 'Failed to generate code'
          
          if (errorMsg.includes('timeout') || errorMsg.includes('timed out')) {
            errorMsg = '⏱️ Request timed out. Try a shorter prompt or simplify your request.'
          }

          setMessages(prev => 
            prev.filter(msg => !msg.isLoading).concat({
              id: `error-${Date.now()}`,
              text: `❌ Sorry, I couldn't complete that request. ${errorMsg}`,
              sender: 'ai',
              timestamp: new Date()
            })
          )
        }
      }
    )

    setPrompt('')
  }, [prompt, id, activeFile, createProject, setCode])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewCode(currentCode)
    }, 500)

    return () => clearTimeout(timer)
  }, [currentCode])

  if (isLoading) {
    return (
      <div className='h-screen w-full flex items-center justify-center bg-slate-950'>
        <div className='text-center'>
          <div className='relative'>
            <div className='w-16 h-16 border-4 border-slate-800 border-t-pink-500 rounded-full animate-spin mx-auto mb-4'></div>
            <Sparkles className='w-6 h-6 text-pink-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
          </div>
          <p className='text-slate-400'>Loading project...</p>
        </div>
      </div>
    )
  }

  const isMainAppFile = activeFile === 'src/App.jsx' || activeFile === 'App.jsx'

  return (
    <div className='h-screen w-full flex flex-col lg:flex-row bg-slate-950 overflow-hidden'>
      {/* File Tree - Hidden on mobile, visible on desktop */}
      <div className='hidden lg:block'>
        <FileTree
          files={files}
          activeFile={activeFile}
          onFileSelect={handleFileSelect}
          onDelete={(path) => {
            console.log('Delete:', path)
          }}
          onCreate={() => {
            console.log('Create new file')
          }}
        />
      </div>

      {/* Mobile File Tree (uses FileTree's built-in mobile support) */}
      <div className='lg:hidden'>
        <FileTree
          files={files}
          activeFile={activeFile}
          onFileSelect={handleFileSelect}
          onDelete={(path) => {
            console.log('Delete:', path)
          }}
          onCreate={() => {
            console.log('Create new file')
          }}
        />
      </div>

      {/* Chat Sidebar - Desktop: Always visible, Mobile: Toggleable */}
      <div className={`
        fixed lg:relative
        inset-y-0 left-0
        w-full sm:w-[400px] lg:w-[30%]
        h-full
        flex flex-col
        border-r border-slate-800 bg-slate-900
        z-30
        transform transition-transform duration-300 ease-in-out
        lg:transform-none
        ${isChatOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className='px-4 py-3 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='relative'>
              <MessageSquare className='w-5 h-5 text-pink-400' />
              <div className='absolute inset-0 blur-sm bg-pink-500/30 rounded-full'></div>
            </div>
            <div>
              <h2 className='text-lg font-bold text-white'>AI Assistant</h2>
              <p className='text-xs text-slate-400'>
                {data?.project?.name || 'Project'} • v{data?.project?.versions?.length || 1}
              </p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setIsChatOpen(false)}
            className='lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors'
          >
            <X className='w-5 h-5 text-slate-400' />
          </button>
        </div>

        {/* Messages */}
        <div className='flex-1 overflow-y-auto px-4 py-4 space-y-4'>
          {messages.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-full text-center px-4'>
              <div className='relative mb-6'>
                <div className='w-20 h-20 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center backdrop-blur-sm'>
                  <Sparkles className='w-10 h-10 text-pink-400' />
                </div>
                <div className='absolute inset-0 bg-pink-500/20 blur-xl rounded-full animate-pulse'></div>
              </div>
              <h3 className='text-base font-semibold text-white mb-2'>
                Start Creating
              </h3>
              <p className='text-sm text-slate-400 mb-6'>
                Tell me what you want to build or change
              </p>
              <div className='text-left space-y-2 text-xs text-slate-300 bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 rounded-xl'>
                <p className='font-semibold text-pink-400 mb-3'>Try asking:</p>
                <p className='flex items-center gap-2'>
                  <span className='text-pink-400'>→</span>
                  "Add dark mode toggle"
                </p>
                <p className='flex items-center gap-2'>
                  <span className='text-pink-400'>→</span>
                  "Change primary color to blue"
                </p>
                <p className='flex items-center gap-2'>
                  <span className='text-pink-400'>→</span>
                  "Make it responsive"
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-xl ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25'
                      : 'bg-slate-800/80 backdrop-blur-sm text-slate-100 border border-slate-700'
                  }`}
                >
                  <p className='text-sm leading-relaxed whitespace-pre-wrap break-words'>
                    {msg.text}
                  </p>
                  
                  {msg.isLoading && (
                    <div className='flex gap-1 mt-2'>
                      <div className='w-2 h-2 bg-pink-400 rounded-full animate-bounce' style={{ animationDelay: '0ms' }}></div>
                      <div className='w-2 h-2 bg-pink-400 rounded-full animate-bounce' style={{ animationDelay: '150ms' }}></div>
                      <div className='w-2 h-2 bg-pink-400 rounded-full animate-bounce' style={{ animationDelay: '300ms' }}></div>
                    </div>
                  )}

                  {!msg.isLoading && (
                    <span className={`text-xs mt-1 block ${
                      msg.sender === 'user' ? 'text-pink-100' : 'text-slate-500'
                    }`}>
                      {msg.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className='p-3 border-t border-slate-800 bg-slate-900'>
          <form onSubmit={handleSubmit} className='flex gap-2'>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Tell me what to build..."
              disabled={createProject.isPending}
              className='flex-1 px-4 py-3 text-sm bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed'
            />
            <button
              type='submit'
              disabled={!prompt.trim() || createProject.isPending}
              className='group relative px-4 lg:px-5 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden'
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300 group-hover:scale-105"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
              
              <div className='relative flex items-center gap-2 text-white'>
                {createProject.isPending ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <Send className='w-4 h-4' />
                )}
              </div>
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Chat Overlay */}
      {isChatOpen && (
        <div 
          className='lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-20'
          onClick={() => setIsChatOpen(false)}
        />
      )}

      {/* Code & Preview Section */}
      <div className='flex-1 flex flex-col bg-slate-950 min-h-0'>
        {/* Top Bar */}
        <div className='w-full h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-2 sm:px-4 gap-2'>
          {/* Left: Chat toggle + Tabs */}
          <div className='flex items-center gap-2'>
            {/* Mobile chat toggle */}
            <button
              onClick={() => setIsChatOpen(true)}
              className='lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors'
            >
              <MessageSquare className='w-5 h-5 text-pink-400' />
            </button>

            {/* Tabs */}
            <div className='flex gap-1 sm:gap-2'>
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                  activeTab === 'code'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Code className='w-4 h-4' />
                <span className='hidden sm:inline'>Code</span>
              </button>
              
              {isMainAppFile && (
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                    activeTab === 'preview'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Eye className='w-4 h-4' />
                  <span className='hidden sm:inline'>Preview</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          {currentCode && (
            <div className='flex gap-1 sm:gap-2 items-center'>
              {hasUnsavedChanges && (
                <span className='hidden sm:flex text-xs text-orange-400 font-medium items-center gap-1'>
                  <span className='w-2 h-2 bg-orange-400 rounded-full animate-pulse'></span>
                  Unsaved
                </span>
              )}
              
              <button
                onClick={handleManualSave}
                disabled={!hasUnsavedChanges || isSaving}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                  hasUnsavedChanges && !isSaving
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
                title={hasUnsavedChanges ? 'Save (Ctrl+S)' : 'No changes'}
              >
                {isSaving ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <Save className='w-4 h-4' />
                )}
                <span className='hidden sm:inline'>
                  {hasUnsavedChanges ? 'Save' : 'Saved'}
                </span>
              </button>
              
              <button
                onClick={() => navigate(`/live/${id}`)}
                className='group relative flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all overflow-hidden'
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300 group-hover:scale-105"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
                
                <div className='relative flex items-center gap-1 sm:gap-2 text-white'>
                  <ExternalLink className='w-4 h-4' />
                  <span className='hidden sm:inline'>Live</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Editor/Preview Area */}
        <div className='flex-1 overflow-hidden'>
          {activeTab === 'code' ? (
            <div className='h-full flex flex-col bg-[#1e1e1e]'>
              <div className='px-2 sm:px-4 py-2 bg-slate-900 text-white text-xs sm:text-sm border-b border-slate-800 flex justify-between items-center'>
                <div className='flex items-center gap-2 min-w-0 flex-1'>
                  <Code className='w-4 h-4 text-pink-400 flex-shrink-0' />
                  <span className='font-mono text-slate-300 truncate'>{activeFile}</span>
                  {hasUnsavedChanges && (
                    <span className='text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded flex-shrink-0'>
                      Modified
                    </span>
                  )}
                </div>
                
                {deployedUrl && (
                  <a 
                    href={deployedUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className='hidden sm:flex text-xs text-green-400 hover:text-green-300 items-center gap-1 transition-colors'
                  >
                    <ExternalLink className='w-3 h-3' />
                    View Live
                  </a>
                )}
              </div>
              {currentCode ? (
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  value={currentCode}
                  onChange={handleEditorChange}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: window.innerWidth > 768 },
                    fontSize: window.innerWidth < 640 ? 12 : 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 16 },
                    wordWrap: 'on',
                    formatOnPaste: true,
                    formatOnType: true,
                    tabSize: 2,
                    insertSpaces: true
                  }}
                />
              ) : (
                <div className='flex flex-col items-center justify-center h-full text-slate-400 bg-slate-950 p-4'>
                  <Code className='w-12 sm:w-16 h-12 sm:h-16 mb-4 opacity-30' />
                  <p className='text-xs sm:text-sm'>No code available</p>
                  <p className='text-xs text-slate-500 mt-2 text-center'>Start by asking AI to generate something</p>
                </div>
              )}
            </div>
          ) : (
            <div className='h-full bg-white'>
              {previewCode ? (
                <iframe
                  key={`${activeFile}-${previewCode.substring(0, 50)}`}
                  srcDoc={getPreviewHTML(previewCode, activeFile)}
                  title="preview"
                  sandbox="allow-scripts allow-same-origin"
                  className='w-full h-full border-0'
                />
              ) : (
                <div className='flex flex-col items-center justify-center h-full bg-slate-950 text-slate-400 p-4'>
                  <Eye className='w-12 sm:w-16 h-12 sm:h-16 mb-4 opacity-30' />
                  <p className='text-xs sm:text-sm'>No preview available</p>
                  <p className='text-xs text-slate-500 mt-2'>Code will render here</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WorkingArea
