// backend/controllers/deploy.controller.js
// import { Project } from '../models/project.models.js'
import { nanoid } from 'nanoid'
import fs from 'fs/promises'
import path from 'path'
import { Project } from '../models/project.model.js'

// ✅ Deploy project to unique URL
export const deployProject = async (req, res) => {
  try {
    const { projectId, code } = req.body
    const userId = req.id

    if (!projectId || !code) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      })
    }

    // Find project
    const project = await Project.findById(projectId)

    if (!project || project.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      })
    }

    // ✅ Generate unique deploy ID
    const deployId = project.deployId || nanoid(10)
    
    // ✅ Create deploy directory
    const deployDir = path.join(process.cwd(), 'public', 'deploys', deployId)
    await fs.mkdir(deployDir, { recursive: true })

    // ✅ Generate complete HTML file
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${project.name || 'Generated App'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${code}
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  </script>
</body>
</html>`

    // ✅ Write HTML file
    await fs.writeFile(path.join(deployDir, 'index.html'), htmlContent)

    // ✅ Update project with deploy info
    project.deployId = deployId
    project.deployedAt = new Date()
    project.deployUrl = `${process.env.BASE_URL}/deploys/${deployId}`
    await project.save()

    console.log(`🚀 Project deployed: ${project.deployUrl}`)

    res.json({
      success: true,
      deployUrl: project.deployUrl,
      deployId: deployId,
      message: 'Deployed successfully'
    })

  } catch (error) {
    console.error('❌ Deploy error:', error)
    res.status(500).json({
      success: false,
      error: 'Deployment failed',
      message: error.message
    })
  }
}

// ✅ Get deployed project
export const getDeployedProject = async (req, res) => {
  try {
    const { deployId } = req.params

    const htmlPath = path.join(process.cwd(), 'public', 'deploys', deployId, 'index.html')
    
    // Check if file exists
    try {
      await fs.access(htmlPath)
      res.sendFile(htmlPath)
    } catch {
      res.status(404).send('<h1>Deployment not found</h1>')
    }

  } catch (error) {
    console.error('❌ Error serving deployment:', error)
    res.status(500).send('<h1>Error loading deployment</h1>')
  }
}
