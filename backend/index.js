import cookieParser from "cookie-parser";
import express from "express";
import cors from 'cors'
import { ENV } from "./src/config/env.js";
import { connectDb } from "./src/config/db.js";
import userRoute from "./src/routes/user.route.js";
import projectRoute from "./src/routes/project.route.js";
import { redisClient } from "./src/config/redis.js";
import path from "path";
import paymentRoute from "./src/routes/payment.route.js";
const app = express()

//  hi

app.use(cors({ 
    origin:true,
    credentials:true
}))
app.use(cookieParser())
app.use(express.urlencoded({extended:true}))
app.use(express.json())


app.get("/api/health", (req, res) => {
  res.json({ status: "OK", instance: process.pid });
});
 
app.use('/api', userRoute)
app.use('/preview', express.static(path.join(process.cwd(), 'sandbox')));
app.use('/api/project', projectRoute)
app.use('/api/payment', paymentRoute)
app.listen(ENV.PORT,()=>{
    console.log(`server started on port , ${ENV.PORT}`)
    connectDb()
})