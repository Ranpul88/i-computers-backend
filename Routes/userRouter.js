import express from 'express'
import { createUser, getUser, googleLogin, loginUser, sendOTP, updatePassword } from '../controllers/userController.js'

const userRouter = express.Router()

userRouter.post('/', createUser)
userRouter.post('/login', loginUser)
userRouter.get('/', getUser)
userRouter.post('/google-login', googleLogin)
userRouter.get('/send-otp/:email', sendOTP)
userRouter.post('/validate-otp', updatePassword)

export default userRouter