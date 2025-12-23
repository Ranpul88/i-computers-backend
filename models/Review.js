import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    productID : {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    stars: {
        type: Number,
        required: true
    },

    name: {
        type: String,
        required: true,
        default: "Anonymous"
    },

    message: {
        type: String
    },

    date: {
        type: Date,
        required: true,
        default: Date.now
    }
})

const Review = mongoose.model("review", reviewSchema)

export default Review