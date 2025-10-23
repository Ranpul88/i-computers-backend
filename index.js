 import express from 'express'
import mongoose from 'mongoose'
import userRouter from './Routes/userRouter.js'
import jwt from "jsonwebtoken"
import productRouter from './Routes/productRouter.js'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const mongoURI = process.env.MONGO_URI

mongoose.connect(mongoURI).then(()=>{
    console.log("Connected to MongoDB cluster")
})

const app = express()

app.use(cors())

app.use(express.json())

app.use((req, res, next)=>{
    const authorizationHeader = req.header("Authorization")
    
    if(authorizationHeader != null){
        const token = authorizationHeader.replace("Bearer ", "")

        jwt.verify(token, process.env.JWT_SECRET, (error, content)=>{
            if(content == null){
                res.json({
                    message: "Invalid token"
                })
            }else{                
                req.user = content
                
                next()
            }
        })
    }else{
        next()
    }
})

app.use("/api/users", userRouter)
app.use("/api/products", productRouter)

app.listen(5000, ()=>{
    console.log("Server is running...")
})