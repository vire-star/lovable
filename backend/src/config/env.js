import { configDotenv } from "dotenv";

configDotenv({quiet:true})

export const ENV={
    PORT:process.env.PORT,
    CLIENT_URl:process.env.CLIENT_URL,
    MONGO_URI:process.env.MONGO_URI,
    JWT_SECRET:process.env.JWT_SECRET,
    GEMINI_API_KEY:process.env.GEMINI_API_KEY
}