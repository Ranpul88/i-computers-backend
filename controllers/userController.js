import User from "../models/User.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from "dotenv"
import axios from "axios";

dotenv.config()

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
        const res = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                Authorization: `Bearer ${req.body.token}`
            }
        })

        const user = await User.findOne({ email: res.data.email })

        if(user == null){
            const user = new User({
                email: res.data.email,
                firstName: res.data.given_name,
                lastName: res.data.family_name,
                password: "123",
                image: res.data.picture
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