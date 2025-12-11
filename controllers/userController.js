import User from "../models/User.js"
import Otp from "../models/Otp.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from "dotenv"
import axios from "axios"
import nodemailer from "nodemailer"

dotenv.config()

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "vinujavithanage88@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD
    }
})

export function createUser(req, res){
    const data = req.body

    const hashedPassword = bcrypt.hashSync(data.password, 10)

    const user = new User({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: hashedPassword,
    })
    user.save()
        .then(()=>{
            return res.json(
                {
                    message: "user created successfully"
                }
            )
        })
        .catch((error)=>{
            return res.status(500).json({
                message: "Error creating user",
                error: error.message
            })
        })
}

export function loginUser(req, res){
    const email = req.body.email
    const password = req.body.password

    User.find({ email: email })
        .then((users)=>{
            if(users[0] == null){
                return res.status(404).json({
                    message : "User not found."
                })
            }else{
                const user = users[0]

                if(user.isBlocked){
                    return res.status(403).json({
                        message: "User a is blocked. Contact an admin."
                    })
                }

                const isPasswordCorrect = bcrypt.compareSync(password, user.password)
                
                if(isPasswordCorrect){
                    const payload = {
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        isEmailVerified: user.isEmailVerified,
                        image: user.image
                    }

                    const token = jwt.sign(payload, process.env.JWT_SECRET,{
                        expiresIn: "150h"
                    })

                    return res.json({
                        message: "Login successful.",
                        token: token,
                        role: user.role
                    })
                }else{
                    return res.status(401).json({
                        message: "Invalid password."
                    })
                }
            }
        })
}

export async function googleLogin(req, res){
    try {
        const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                Authorization: `Bearer ${req.body.token}`
            }
        })

        const user = await User.findOne({ email: response.data.email })

        if(user == null){
            const user = new User({
                email: response.data.email,
                firstName: response.data.given_name,
                lastName: response.data.family_name,
                password: "123",
                image: response.data.picture
            })

            await user.save()
             const payload = {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isEmailVerified: true,
                image: user.image
             }

             const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "150h"})

             res.json({
                message: "Login successfull",
                token: token,
                role: user.role
             })
        }else{
            if(user.isBlocked){
                return res.status(403).json({
                    message: "User is blocked. Contact an admin."
                })
            }

            const payload = {
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        isEmailVerified: user.isEmailVerified,
                        image: user.image
                    }

                    const token = jwt.sign(payload, process.env.JWT_SECRET,{
                        expiresIn: "150h"
                    })

                    return res.json({
                        message: "Login successful.",
                        token: token,
                        role: user.role
                    })
        }
    }catch(err){
        return res.status(500).json({
            message: "Google login failed",
            error: err.message
        })
    }
}

export async function sendOTP(req,res){
    
    try {
        const email = req.params.email

    const user = await User.findOne({ email:email })

    if(user==null){
        return res.status(404).json({
            message: "user not found"
        })
    }

    await Otp.deleteMany({ email:email })

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

    const otp = new Otp({
        email: email,
        otp: otpCode
    })

    await otp.save()

    const message = {
        from: "vinujavithanage88@gmail.com",
        to: email,
        subject: "Your OTP Code",
        text: "Your OTP code " + otpCode
    }

    transporter.sendMail(message, (err, info)=>{
        if(err){
            return res.status(500).json({
                message: "Failed to send OTP",
                error: err.message
            })
        }else{
            res.json({
                message: "OTP sent successfully"
            })
        }
    })    
    }catch(error){
        res.status(500).json({
            message: "Failed to sent OTP",
            error: error.message
        })
    }
    
}

export async function updatePassword(req, res){
    try {
        const {otp, newPassword, email} = req.body

        const otpRecord = await Otp.findOne({ email:email, otp:otp })

        if(otpRecord == null){
            return res.status(400).json({
                message: "Invalid OTP"
            })
        }

        await Otp.deleteMany({ email:email })

        const hashedPassword = bcrypt.hashSync(newPassword, 10)

        await User.updateOne({ email:email }, { $set: { password:hashedPassword, isEmailVerified:true } })
            .then(()=>{
                res.json({
                    message: "Password updated successfully"
                })
            })
            .catch((err)=>{
                res.status(500).json({
                message: "Failed to fetch user",
                error: err.message
            })
            })
    }catch(error){
        res.status(500).json({
            message: "Failed to update password",
            error: error.message
        })
    }
}

export function isAdmin(req){
    if(req.user == null){
        return false
    }

    if(req.user.role != "admin"){
        return false
    }

    return true
}

export function getUser(req, res){
    if(req.user == null){
        return res.status(401).json({
            message: "Unauhorized"
        })
    }

    res.json(req.user)  
}

export async function getAllUsers(req, res){
    if(!isAdmin(req)){
        return res.status(401).json({
            message: "Unauthorized"
        })
    }

    try {
        const users = await User.find()
        res.json(users)

    }catch(error){
        res.status(500).json({
            message: "Error fetching user",
            error: error.message
        })
    }
}

export async function updateUserStatus(req, res){
    if(!isAdmin(req)){
        return res.status(401).json({
            message: "Unauthorized"
        })
    }

    const email = req.params.email

    if(req.user.email == email){
        return res.status(400).json({
            message: "Admins cannot change their own status"
        })
    }

    const isBlocked = req.body.isBlocked

    try {
        await User.updateOne({ email: email }, { $set: { isBlocked: isBlocked } })
        res.json({
            message: "User status updated successfully"
        })   
    }catch(error){
        res.status(500).json({
            message: "Error updating user status",
            error: error.message
        })
    }
}

export async function sendMail(req, res){
    const {email, name, text} = req.body

    try {
        // const user = await User.find({email:email})
        
        // if(user == null){
        //     return res.status(404).json({
        //         message: "User not found"
        //     })
        // }

        const message = {
        from: "vinujavithanage88@gmail.com",
        to: "vinujavithanage88@gmail.com",
        subject: `Email from ${name} ${email}`,
        text: text
        // from: `"Customer Message" <vinujavithanage88@gmail.com>`,
        // to: "vinujavithanage88@gmail.com",
        // subject: `New Contact Form Message from ${name}`,
        // text: `Sender Email: ${email}\n\nMessage:\n${text}`,
        // replyTo: email
    }

    transporter.sendMail(message, (err, info)=>{
        if(err){
            return res.status(500).json({
                message: "Failed to send Email",
                error: err.message
            })
        }else{
            res.json({
                message: "Email send successfully"
            })
        }
    })

    }catch(error){
        res.status(500).json({
            message: "Failed to send Email",
            error: error.message
        })    
    }
}