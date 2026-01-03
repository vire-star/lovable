import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { deleteProject, generateCode, getAllProjects, getProject, saveFile, saveProject } from "../controllers/project.controller.js";
import { deployProject } from "../controllers/deploy.controller.js";




const projectRoute = express.Router()

projectRoute.post('/generate', authMiddleware, generateCode)
projectRoute.put('/save', authMiddleware, saveProject)
projectRoute.get('/:id', authMiddleware, getProject)
projectRoute.delete('/:id', authMiddleware, deleteProject)
projectRoute.get('/', authMiddleware, getAllProjects)
projectRoute.post('/save-file', authMiddleware, saveFile)
// projectRoute.delete('/:projectId', authMiddleware, deleteProject)
projectRoute.post('/deploy', authMiddleware, deployProject)

export default projectRoute

