import jwt from 'jsonwebtoken'
import { ENV } from '../config/env.js'
export const authMiddleware = async(req,res, next)=>{
    try {
        const token  = req.cookies.token
        if(!token) {
            return res.status(401).json({
                message:"Please provide token"
            })
        }


        const decode = await jwt.verify(token,ENV.JWT_SECRET )

        // console.log(decode)
        if(!decode){
            return res.status(401).json({
                message:"You are not authorized to login"
            })
        }

        req.id = decode.userId 
        next()
    } catch (error) {
        return res.status(401).json({
      message: "Unauthorized: Invalid or expired token",
    })
    }
}