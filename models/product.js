import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productID: {
        type: String,
        required: true,
        unique: true
    },

    name: {
        type: String,
        required: true
    },

    altNames: {
        type: [String],
        default: []
    },

    description: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    labelledPrice: {
        type: Number,
        required: true
    },

    images: {
        type: [String],
        required: true
    },

    category: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true,
        default: "Standard"
    },

    brand: {
        type: String,
        required: true,
        default: "Generic"
    },

    stock: {
        type: Number,
        required: true,
        default: 0
    },

    ratings: {
            noOfRatings: {
            type: Number,
            default: 0
        },

        stars: {
            type: Number,
            required: true,
            default: 0
        },

        fiveStar: {
            type: Number,
            default: 0
        },

        fourStar: {
            type: Number,
            default: 0
        },

        threeStar: {
            type: Number,
            default: 0
        },
        twoStar: {
            type: Number,
            default: 0
        },
        oneStar: {
            type: Number,
            default: 0
        },
    },

    isAvailable: {
        type: Boolean,
        default: true
    }
})

const Product = mongoose.model("product", productSchema)

export default Product