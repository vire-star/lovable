import express from "express";
import { getUser, login, logout, register } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";


const userRoute = express.Router()


userRoute.post('/register', register)
userRoute.post('/login', login)
userRoute.get('/getUser', authMiddleware, getUser)
userRoute.post('/logout', authMiddleware, logout)


export default userRoute