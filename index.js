import express from 'express'
import mongoose from 'mongoose'
import jwt from "jsonwebtoken"
import productRouter from './Routes/productRouter.js'
import cors from 'cors'
import dotenv from 'dotenv'
import orderRouter from './Routes/orderRouter.js'
import userRouter from './Routes/userRouter.js'
import reviewRouter from './Routes/reviewRouter.js'
dotenv.config()

const mongoURI = process.env.MONGO_URI

mongoose.connect(mongoURI)
    .then(()=>{
        console.log("Connected to MongoDB cluster")
    })
    .catch((error)=>{
        console.log("MongoDB connection failed...")
        console.log(error)
    })

const app = express()

// app.use(cors())
app.use(cors({
  origin: "*"
}));

app.use(express.json())

app.use((req, res, next)=>{
    const authorizationHeader = req.header("Authorization")
    
    if(authorizationHeader != null){
        const token = authorizationHeader.replace("Bearer ", "")

        jwt.verify(token, process.env.JWT_SECRET, (error, content)=>{
            if(content == null){
                res.status(401).json({
                    message: "Invalid token"
                    
                })
                return
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
app.use("/api/orders", orderRouter)
app.use("/api/reviews", reviewRouter)

app.listen(5000, ()=>{
    console.log("Server is running...")
})