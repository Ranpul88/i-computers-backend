import express from 'express'
import mongoose from 'mongoose'
import userRouter from './Routes/userRouter.js'
import jwt from "jsonwebtoken"
import productRouter from './Routes/productRouter.js'

const mongoURI = "mongodb+srv://admin:1234@cluster0.hoin2bz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

mongoose.connect(mongoURI).then(()=>{
    console.log("Connected to MongoDB cluster")
})

const app = express()

app.use(express.json())

app.use((req, res, next)=>{
    const authorizationHeader = req.header("Authorization")
    
    if(authorizationHeader != null){
        const token = authorizationHeader.replace("Bearer ", "")

        jwt.verify(token, "secretKey96$2025", (error, content)=>{
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

app.use("/users", userRouter)
app.use("/products", productRouter)

app.listen(5000, ()=>{
    console.log("Server is running...")
})