// backend/controllers/project.controller.js
import { Project } from '../models/project.model.js'
import { User } from '../models/user.model.js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { ENV } from '../config/env.js'
import { CreditService } from '../services/creditService.js'

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY)
 
//  backend/controllers/project.controller.js

const stripFences = (code) => {
  if (!code) return ''
  
  let cleanCode = code
    // ✅ Step 1: Remove markdown code fences
    .replace(/^```[a-zA-Z]*\n/gm, '')
    .replace(/\n```$/gm, '')
    .replace(/^```$/gm, '')
    
    // ✅ Step 2: Remove import statements (React is global in preview)
    .replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, '')
    .replace(/^import\s+['"].*?['"];?\s*$/gm, '')
    
    // ✅ Step 3: Handle different export patterns
    // Pattern 1: export default function App() { ... }
    .replace(/^export\s+default\s+function\s+(\w+)/gm, 'function $1')
    
    // Pattern 2: export default App;
    .replace(/^export\s+default\s+\w+\s*;?\s*$/gm, '')
    
    // Pattern 3: export { App as default }
    .replace(/^export\s*{\s*\w+\s+as\s+default\s*}\s*;?\s*$/gm, '')
    
    // ✅ Step 4: Convert named exports to regular declarations
    .replace(/^export\s+(const|let|var|function|class)\s+/gm, '$1 ')
    
    // ✅ Step 5: Remove empty lines (multiple newlines)
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    
    .trim()
  
  // ✅ DEBUG: Log the cleaned code
  console.log('🧹 Cleaned code length:', cleanCode.length)
  console.log('🧹 Has "function App"?', cleanCode.includes('function App'))
  
  return cleanCode
}


// ✅ Helper: Create default project structure
// backend/controllers/project.controller.js

// ✅ Fixed: Folders don't need content
// backend/controllers/project.controller.js

// ✅ Create default structure with files inside folders
const createDefaultStructure = () => {
  return [
    {
      name: 'src',
      path: 'src',
      type: 'folder'
    },
    {
      name: 'App.jsx',
      path: 'src/App.jsx',
      type: 'file',
      language: 'javascript',
      content: `function App() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome to Your App</h1>
        <div className="space-y-4">
          <p className="text-gray-600">Click the button below to get started:</p>
          <button 
            onClick={() => setCount(count + 1)}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Clicked {count} times
          </button>
        </div>
      </div>
    </div>
  );
}`
    },
    {
      name: 'components',
      path: 'src/components',
      type: 'folder'
    },
    // ✅ ADD: Placeholder file in components folder
    {
      name: 'Button.jsx',
      path: 'src/components/Button.jsx',
      type: 'file',
      language: 'javascript',
      content: `function Button({ children, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={\`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors \${className}\`}
    >
      {children}
    </button>
  );
}`
    },
    {
      name: 'utils',
      path: 'src/utils',
      type: 'folder'
    },
    // ✅ ADD: Placeholder file in utils folder
    {
      name: 'helpers.js',
      path: 'src/utils/helpers.js',
      type: 'file',
      language: 'javascript',
      content: `// Utility functions

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

export const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};`
    }
  ]
}



// ✅ Generate/Edit Code with multi-file support
export const generateCode = async (req, res) => {
  try {
    const { prompt, projectId, isNewProject, targetFile } = req.body
    const userId = req.id

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      })
    }

    const hasCredits = await CreditService.hasCredits(userId);
if (!hasCredits) {
  return res.status(402).json({
    success: false,
    message: "No credits left. Please purchase credits."
  });
}

    console.log(`🤖 Generating code for user ${userId}...`)

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    let existingFiles = []
    let currentFileContent = ''
    let chatContext = ''
    let currentFilePath = targetFile || 'src/App.jsx'

    // ✅ Load existing project
    if (!isNewProject && projectId) {
      const project = await Project.findById(projectId)
      if (project) {
        existingFiles = project.files
        
        // Get current file content
        const currentFile = existingFiles.find(f => f.path === currentFilePath && f.type === 'file')
        if (currentFile) {
          currentFileContent = currentFile.content
        }

        // Build chat context
        const recentChats = project.chatHistory.slice(-6)
        chatContext = recentChats
          .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
          .join('\n\n')
      }
    }

    // ✅ Build file structure context
    const fileStructure = existingFiles
      .filter(f => f.type === 'file')
      .map(f => `${f.path}: ${f.content.substring(0, 200)}...`)
      .join('\n\n')

    const systemPrompt = `You are an expert React developer. ${
      currentFileContent 
        ? `MODIFY the existing file "${currentFilePath}" based on user request. Keep all existing functionality unless explicitly asked to change.`
        : 'Generate clean, production-ready code for a new React component.'
    }

CRITICAL RULES:
- Define a function component named "App" (required)
- NO import statements (React is loaded globally)
- NO export statements
- Use React.useState instead of useState
- Use React.useEffect instead of useEffect
- Use React.useRef instead of useRef
- Use Tailwind CSS classes for styling
- Make it fully functional and responsive
- Return JSX from the App function

${currentFileContent ? `
CURRENT FILE (${currentFilePath}):
\`\`\`javascript
${currentFileContent}
\`\`\`

PROJECT STRUCTURE:
${fileStructure}

PREVIOUS CONVERSATION:
${chatContext}

INSTRUCTIONS: Only modify the parts mentioned in the user request. Keep everything else intact. If user asks to create a new component, respond with "NEW_FILE: ComponentName" first.
` : ''}

IMPORTANT: Always wrap your code in a function named "App".`

    const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}`
    
    const result = await model.generateContent(fullPrompt)
    const rawCode = result.response.text()
    
    // ✅ Check if AI wants to create a new file
    let isNewFile = false
    let newFileName = ''
    
    if (rawCode.includes('NEW_FILE:')) {
      isNewFile = true
      const match = rawCode.match(/NEW_FILE:\s*(\w+)/)
      if (match) {
        newFileName = match[1]
        currentFilePath = `src/components/${newFileName}.jsx`
      }
    }
    
    const generatedCode = stripFences(rawCode)

    console.log(`✅ Code generated (${generatedCode.length} chars) for ${currentFilePath}`)

    let project
    let conversationalResponse = ''

    if (isNewProject) {
      // ✅ Create new project with structure
      const defaultFiles = createDefaultStructure()
      defaultFiles[1].content = generatedCode // Update App.jsx

      project = await Project.create({
        userId,
        name: `Project ${Date.now()}`,
        files: defaultFiles,
        activeFile: 'src/App.jsx',
        chatHistory: [
          {
            role: 'user',
            content: prompt,
            filesModified: ['src/App.jsx'],
            creditsUsed: 1,
            timestamp: new Date()
          },
          {
            role: 'assistant',
            content: '✅ Created your project with a clean folder structure!',
            timestamp: new Date()
          }
        ],
        versions: [{
          versionNumber: 1,
          files: defaultFiles,
          description: 'Initial generation'
        }],
        metadata: {
          totalGenerations: 1,
          lastModified: new Date()
        }
      })

      await User.findByIdAndUpdate(userId, {
        $inc: { 'usage.totalProjects': 1, 'usage.totalGenerations': 1 }
      })

      conversationalResponse = '✅ Created your project with a clean folder structure!'
      
    } else {
      // ✅ Edit existing project
      if (!projectId) {
        return res.status(400).json({
          success: false,
          error: 'Project ID required'
        })
      }

      project = await Project.findById(projectId)

      if (!project || project.userId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      // ✅ Update or create file
      const fileIndex = project.files.findIndex(f => f.path === currentFilePath)
      
      if (fileIndex !== -1) {
        project.files[fileIndex].content = generatedCode
        conversationalResponse = `✅ Updated ${currentFilePath.split('/').pop()}`
      } else if (isNewFile) {
        // ✅ Create new file
        project.files.push({
          name: newFileName + '.jsx',
          path: currentFilePath,
          type: 'file',
          language: 'javascript',
          content: generatedCode
        })
        conversationalResponse = `✅ Created new component: ${newFileName}.jsx`
      }

      // ✅ Add to chat history
      project.chatHistory.push(
        {
          role: 'user',
          content: prompt,
          filesModified: [currentFilePath],
          creditsUsed: 1,
          timestamp: new Date()
        },
        {
          role: 'assistant',
          content: conversationalResponse,
          timestamp: new Date()
        }
      )

      // ✅ Save new version
      project.versions.push({
        versionNumber: project.versions.length + 1,
        files: project.files,
        description: `Edit ${project.versions.length + 1}`
      })

      project.metadata.totalGenerations += 1
      project.metadata.lastModified = new Date()
      project.activeFile = currentFilePath

      await project.save()

      await User.findByIdAndUpdate(userId, {
        $inc: { 'usage.totalGenerations': 1 }
      })
    }

    // 🔥 Deduct credit AFTER successful generation
await CreditService.deductCredit(
  userId,
  project._id,
  prompt,
  isNewProject ? "new_project" : "edit"
)

    res.json({
      success: true,
      code: generatedCode,
      projectId: project._id,
      projectName: project.name,
      files: project.files,
      activeFile: currentFilePath,
      message: conversationalResponse,
      isNew: isNewProject
    })

  } catch (error) {
    console.error('❌ Code generation error:', error)
    res.status(500).json({
      success: false,
      error: 'Generation failed',
      message: error.message
    })
  }
}

// ✅ Create new file/folder
// ✅ Fixed: Handle folders properly
export const createFileOrFolder = async (req, res) => {
  try {
    const { projectId, name, path, type } = req.body
    const userId = req.id

    const project = await Project.findById(projectId)

    if (!project || project.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      })
    }

    // ✅ Check if already exists
    const exists = project.files.some(f => f.path === path)
    if (exists) {
      return res.status(400).json({
        success: false,
        error: 'File or folder already exists'
      })
    }

    // ✅ Create new file/folder
    const newItem = {
      name,
      path,
      type,
      language: type === 'file' ? 'javascript' : undefined
    }

    // ✅ Only add content for files
    if (type === 'file') {
      newItem.content = '// Start coding...'
    }

    project.files.push(newItem)

    await project.save()

    res.json({
      success: true,
      files: project.files,
      message: `${type === 'file' ? 'File' : 'Folder'} created successfully`
    })

  } catch (error) {
    console.error('❌ Create error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create'
    })
  }
}


// ✅ Delete file/folder
export const deleteFile = async (req, res) => {
  try {
    const { projectId, path } = req.body
    const userId = req.id

    const project = await Project.findById(projectId)

    if (!project || project.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      })
    }

    // ✅ Remove file and all children if folder
    project.files = project.files.filter(f => {
      if (f.path === path) return false
      if (f.path.startsWith(path + '/')) return false
      return true
    })

    await project.save()

    res.json({
      success: true,
      files: project.files,
      message: 'Deleted successfully'
    })

  } catch (error) {
    console.error('❌ Delete error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete'
    })
  }
}



// Keep other controllers same (getAllProjects, deleteProject, saveProject)


// ✅ 2. Save Code Manually (Auto-save)
// ✅ Save specific file
export const saveProject = async (req, res) => {
  try {
    const { projectId, code, filePath } = req.body // ✅ Add filePath
    const userId = req.id

    if (!projectId || !code) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      })
    }

    const project = await Project.findById(projectId)

    if (!project || project.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      })
    }

    // ✅ Update specific file
    const targetPath = filePath || project.activeFile || 'src/App.jsx'
    const fileIndex = project.files.findIndex(f => f.path === targetPath && f.type === 'file')

    if (fileIndex !== -1) {
      project.files[fileIndex].content = code
    } else {
      // Fallback to first file
      const firstFile = project.files.find(f => f.type === 'file')
      if (firstFile) {
        firstFile.content = code
      }
    }

    project.metadata.lastModified = new Date()
    
    await project.save()

    res.json({
      success: true,
      message: 'Project saved'
    })

  } catch (error) {
    console.error('❌ Save error:', error)
    res.status(500).json({
      success: false,
      error: 'Save failed'
    })
  }
}


// ✅ 3. Get Single Project (Load on refresh)
// ✅ Updated to return all files
export const getProject = async (req, res) => {
  try {
    const projectId = req.params.id
    const userId = req.id

    const project = await Project.findById(projectId)

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      })
    }

    if (project.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      })
    }

    res.json({
      success: true,
      project: {
        id: project._id,
        name: project.name,
        files: project.files, // ✅ Return all files
        activeFile: project.activeFile, // ✅ Active file path
        chatHistory: project.chatHistory,
        deployUrl: project.deployUrl,
        lastModified: project.metadata.lastModified
      }
    })

  } catch (error) {
    console.error('❌ Get project error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to load project'
    })
  }
}


// ✅ 4. Get All Projects (Project List)
export const getAllProjects = async (req, res) => {
  try {
    const userId = req.id

    const projects = await Project.find({ userId })
      .select('name metadata.lastModified deployUrl createdAt')
      .sort({ 'metadata.lastModified': -1 })
      .limit(50)

    res.json({
      success: true,
      projects: projects.map(p => ({
        id: p._id,
        name: p.name,
        lastModified: p.metadata.lastModified,
        deployUrl: p.deployUrl,
        createdAt: p.createdAt
      }))
    })

  } catch (error) {
    console.error('❌ Get projects error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to load projects'
    })
  }
}

// ✅ 5. Delete Project
export const deleteProject = async (req, res) => {
  try {
    const projectId  = req.params.id
    const userId = req.id

    const project = await Project.findById(projectId)

    if (!project || project.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      })
    }

    await Project.findByIdAndDelete(projectId)

    // ✅ Update user stats
    await User.findByIdAndUpdate(userId, {
      $inc: { 'usage.totalProjects': -1 }
    })

    res.json({
      success: true,
      message: 'Project deleted'
    })

  } catch (error) {
    console.error('❌ Delete error:', error)
    res.status(500).json({
      success: false,
      error: 'Delete failed'
    })
  }
}



// backend/controllers/project.controller.js

// ✅ Save manually edited file
export const saveFile = async (req, res) => {
  try {
    const { projectId, filePath, content } = req.body
    const userId = req.id

    console.log('📥 Save request:', { projectId, filePath, userId })

    if (!projectId || !filePath || content === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: projectId, filePath, or content'
      })
    }

    const project = await Project.findById(projectId)

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      })
    }

    if (project.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access'
      })
    }

    // ✅ Find and update file
    const fileIndex = project.files.findIndex(f => f.path === filePath && f.type === 'file')

    if (fileIndex === -1) {
      return res.status(404).json({
        success: false,
        error: `File not found: ${filePath}`
      })
    }

    // ✅ Update file content
    project.files[fileIndex].content = content

    // ✅ Create new version
    project.versions.push({
      versionNumber: project.versions.length + 1,
      files: project.files,
      description: `Manual edit: ${filePath.split('/').pop()}`,
      timestamp: new Date()
    })

    project.metadata.lastModified = new Date()

    await project.save()

    console.log(`💾 File saved successfully: ${filePath}`)

    res.json({
      success: true,
      files: project.files,
      message: 'File saved successfully'
    })

  } catch (error) {
    console.error('❌ Save file error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to save file',
      message: error.message
    })
  }
}
