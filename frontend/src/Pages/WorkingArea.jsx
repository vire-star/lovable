// frontend/src/pages/WorkingArea.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useGetProjectHook, useProjectHook } from '@/hooks/project.hook'
import Editor from '@monaco-editor/react'
import { Send, Code, Eye, MessageSquare, ExternalLink, Download, Save } from 'lucide-react'
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
  const { code, setCode } = useCodeStore()
  const messagesEndRef = useRef(null)
  
  const createProject = useProjectHook()
  const { data, isLoading } = useGetProjectHook(id)

  const navigate = useNavigate()  // ✅ Load existing project data when available
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

  // ✅ Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ✅ Handle file selection
  const handleFileSelect = useCallback((file) => {
    if (file.type === 'file') {
      // Check for unsaved changes
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

  // ✅ Handle editor changes
  const handleEditorChange = useCallback((value) => {
    setCurrentCode(value || '')
    setHasUnsavedChanges(true)
  }, [])

  // ✅ Save manual changes to backend
  const handleManualSave = useCallback(async () => {
    if (!currentCode || !id || !hasUnsavedChanges) return

    setIsSaving(true)

    try {
      const response = await fetch(`${baseUrl}/project/save-file`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        // ❌ REMOVE: 'Authorization': `Bearer ${localStorage.getItem('token')}`
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

  // ✅ Auto-save on Ctrl+S
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

  // ✅ Handle code generation/update with conversational responses
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

  // ✅ Debounce preview updates for performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewCode(currentCode)
    }, 500)

    return () => clearTimeout(timer)
  }, [currentCode])

  // ✅ Deploy to live URL

  // ✅ Loading state
  if (isLoading) {
    return (
      <div className='h-screen w-full flex items-center justify-center bg-slate-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto mb-4'></div>
          <p className='text-slate-600'>Loading project...</p>
        </div>
      </div>
    )
  }

  const isMainAppFile = activeFile === 'src/App.jsx' || activeFile === 'App.jsx'

  return (
    <div className='h-screen w-full flex bg-slate-50'>
      {/* File Tree */}
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

      {/* LEFT SIDEBAR - Chat */}
      <div className='w-full sm:w-[400px] lg:w-[30%] h-full flex flex-col border-r border-slate-200 bg-white'>
        
        <div className='px-4 py-3 border-b border-slate-200 bg-slate-50'>
          <div className='flex items-center gap-2'>
            <MessageSquare className='w-5 h-5 text-slate-700' />
            <h2 className='text-lg font-bold text-slate-900'>AI Assistant</h2>
          </div>
          <p className='text-xs text-slate-500 mt-1'>
            {data?.project?.name || 'Project'} • Version {data?.project?.versions?.length || 1}
          </p>
        </div>

        <div className='flex-1 overflow-y-auto px-4 py-4 space-y-4'>
          {messages.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-full text-center px-4'>
              <div className='w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4'>
                <MessageSquare className='w-8 h-8 text-slate-400' />
              </div>
              <h3 className='text-base font-semibold text-slate-900 mb-2'>
                Start Editing
              </h3>
              <p className='text-sm text-slate-500 mb-4'>
                Tell me what you want to change
              </p>
              <div className='text-left space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg'>
                <p className='font-semibold text-slate-700'>Try asking:</p>
                <p>• "Add dark mode toggle"</p>
                <p>• "Change primary color to blue"</p>
                <p>• "Make it responsive"</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-900 border border-slate-200'
                  }`}
                >
                  <p className='text-sm leading-relaxed whitespace-pre-wrap break-words'>
                    {msg.text}
                  </p>
                  
                  {msg.isLoading && (
                    <div className='flex gap-1 mt-2'>
                      <div className='w-2 h-2 bg-slate-400 rounded-full animate-bounce' style={{ animationDelay: '0ms' }}></div>
                      <div className='w-2 h-2 bg-slate-400 rounded-full animate-bounce' style={{ animationDelay: '150ms' }}></div>
                      <div className='w-2 h-2 bg-slate-400 rounded-full animate-bounce' style={{ animationDelay: '300ms' }}></div>
                    </div>
                  )}

                  {!msg.isLoading && (
                    <span className={`text-xs mt-1 block ${
                      msg.sender === 'user' ? 'text-slate-300' : 'text-slate-500'
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

        <div className='p-3 border-t border-slate-200 bg-white'>
          <form onSubmit={handleSubmit} className='flex gap-2'>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Add dark mode, change colors..."
              disabled={createProject.isPending}
              className='flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed'
            />
            <button
              type='submit'
              disabled={!prompt.trim() || createProject.isPending}
              className='px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
            >
              {createProject.isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className='hidden sm:inline'>...</span>
                </>
              ) : (
                <>
                  <Send className='w-4 h-4' />
                  <span className='hidden sm:inline'>Send</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT SECTION - Code & Preview */}
      <div className='flex-1 h-screen flex flex-col bg-slate-50'>
        
        <div className='w-full h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4'>
          <div className='flex gap-2'>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                activeTab === 'code'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Code className='w-4 h-4' />
              Code
            </button>
            
            {isMainAppFile && (
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Eye className='w-4 h-4' />
                Preview
              </button>
            )}
          </div>

          {currentCode && (
            <div className='flex gap-2 items-center'>
              {/* ✅ Unsaved indicator */}
              {hasUnsavedChanges && (
                <span className='text-xs text-orange-600 font-medium flex items-center gap-1'>
                  <span className='w-2 h-2 bg-orange-600 rounded-full animate-pulse'></span>
                  Unsaved
                </span>
              )}
              
              {/* ✅ Save button */}
              <button
                onClick={handleManualSave}
                disabled={!hasUnsavedChanges || isSaving}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-sm transition-colors ${
                  hasUnsavedChanges && !isSaving
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
                title={hasUnsavedChanges ? 'Save (Ctrl+S)' : 'No changes to save'}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className='hidden sm:inline'>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className='w-4 h-4' />
                    <span className='hidden sm:inline'>
                      {hasUnsavedChanges ? 'Save' : 'Saved'}
                    </span>
                  </>
                )}
              </button>
              
             
              
              <button
              onClick={()=>navigate(`/live/${id}`)}
                className='flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm transition-colors'
              >
                <ExternalLink className='w-4 h-4'  />
                <span className='hidden sm:inline'>Live</span>
              </button>
            </div>
          )}
        </div>

        <div className='flex-1 overflow-hidden'>
          {activeTab === 'code' ? (
            <div className='h-full flex flex-col bg-slate-900'>
              <div className='px-4 py-2 bg-slate-800 text-white text-sm border-b border-slate-700 flex justify-between items-center'>
                <div className='flex items-center gap-2'>
                  <span className='font-mono'>{activeFile}</span>
                  {hasUnsavedChanges && (
                    <span className='text-xs bg-orange-600 text-white px-2 py-0.5 rounded'>
                      Modified
                    </span>
                  )}
                </div>
                kj
                {deployedUrl && (
                  <a 
                    href={deployedUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className='text-xs text-green-400 hover:text-green-300 flex items-center gap-1'
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
                    minimap: { enabled: false },
                    fontSize: 14,
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
                <div className='flex flex-col items-center justify-center h-full text-slate-400'>
                  <Code className='w-16 h-16 mb-4 opacity-50' />
                  <p className='text-sm'>No code available</p>
                  <p className='text-xs text-slate-500 mt-2'>Start by asking AI to generate something</p>
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
                <div className='flex flex-col items-center justify-center h-full text-slate-500'>
                  <Eye className='w-16 h-16 mb-4 opacity-50' />
                  <p className='text-sm'>No preview available</p>
                  <p className='text-xs text-slate-400 mt-2'>Code will render here</p>
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
