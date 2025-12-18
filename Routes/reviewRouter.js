import express from "express"
import { createReview, getReviews } from "../controllers/reviewController.js"

const reviewRouter = express.Router()

reviewRouter.post("/:productID", createReview)
reviewRouter.get("/:productID", getReviews)

export default reviewRouter