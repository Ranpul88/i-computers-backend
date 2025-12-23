import express from "express"
import { createReview, deleteReview, getAllReviews, getReviews } from "../controllers/reviewController.js"

const reviewRouter = express.Router()

reviewRouter.post("/:productID", createReview)
reviewRouter.get("/:productID", getReviews)
reviewRouter.get("/", getAllReviews)
reviewRouter.delete("/:productID", deleteReview)

export default reviewRouter