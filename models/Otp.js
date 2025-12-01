import mongoose from "mongoose";

const OtpSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    otp: {
        type: String,
        required: true
    }
    
})

const Otp = mongoose.model("Otp", OtpSchema)

export default Otp