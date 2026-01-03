import { ENV } from "../config/env.js";
import { User } from "../models/user.model.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
export const register = async(req, res)=>{
    try {
        const {name, email, password} = req.body;
        if(!name|| !email || !password){
            return res.status(401).json({
                message:"Please provide all the details"
            })
        }

        const existinguser = await User.findOne({email})

        if(existinguser){
            return res.status(401).json({
                message:"User alread exist please try with different email"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)


        const user =await User.create({
            name,
            email,
            password:hashedPassword
        })

        const token = await jwt.sign({userId:user._id}, ENV.JWT_SECRET)

        return res.status(201).cookie("token", token, { 
        maxAge: 20 * 24 * 60 * 60 * 1000, 
        httpOnly: true, 
        secure: true, 
        sameSite: "none"
      }).json({
        message:"User created successfully",
        user
      })
    } catch (error) {
        console.log(`error from register, ${error}`)
    }
}



export const login = async(req,res)=>{
    try {
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(401).json({
                message:"Please provide all the details"
            })
        }

        const user = await User.findOne({email})

        if(!user){
            return res.status(401).json({
                message:"Something wrong with password or email"
            })
        }


        const isPasswordCorrect = await bcrypt.compare(password,user.password)


        if(!isPasswordCorrect){
            return res.status(401).json({
                message:"Something wrong with password or email"
            })
        }


        const token = await jwt.sign({userId:user._id}, ENV.JWT_SECRET) 
        return res.status(201).cookie("token", token,{ 
        maxAge: 20 * 24 * 60 * 60 * 1000, 
        httpOnly: true, 
        secure: true, 
        sameSite: "none"
      }).json({
        message:`Welcome ${user.name}`,
        user
      })
    } catch (error) {
        console.log(`error from login ,${error}`)
    }
}


export const getUser = async(req,res)=>{
    try {
        const userId = req.id

        const user = await User.findById(userId)

        if(!user){
            return res.status(401).json({
                message:"User not logged in"
            })
        }


        return res.status(201).json(user)

        
    } catch (error) {
        console.log(`error from getUser`)
    }
}


export const logout =async(req,res)=>{
    try {
        return res.status(201).cookie("token","").json({
            message:"User logged out successfully"
        })
    } catch (error) {
        console.log(error)
    }
}