import Order from "../models/Order.js";
import Product from "../models/product.js";
import Review from "../models/Review.js";
import { isAdmin } from "./userController.js";

export async function createReview(req, res){
     if(req.user == null){
          return res.status(401).json({
               message: "Unauthorized"
          })
     }

     try {
          const productID = req.params.productID
          const { stars, name, message } = req.body
          const email = req.user.email

          const orderStatus = await Order.find({ email: email, status: "completed", "items.productID": productID })

                  if(orderStatus.length == 0){
                      return res.status(401).json({
                          message: "Unauthorized"
                      })
                  }

          const duplicateReview =await Review.find({ email: email, productID: productID })

          if(duplicateReview != 0){
               return res.status(409).json({
                    message: "Duplicate review"
               })
          }

          const newReview = new Review({
               productID: productID,
               email: email,
               stars: stars,
               name: name,
               message: message || ""
          })

          await newReview.save()

          return res.json({
               message: "Review saved succesfully."
          })
     }catch(error){
          res.status(500).json({
               message: "Error saving review",
               error: error.message
          })
     }
     
}

export async function getReviews(req, res){
     try {
         const productID = req.params.productID
          
         const reviews = await Review.find({productID: productID}).sort({ date: -1 })
         res.json(reviews)
     
     }catch(error){
          res.status(500).json({
               message: "Error fetching reviews",
               error: error.message
          })
     }
}

export async function getAllReviews(req, res){
     if(!isAdmin(req)){
          return res.status(401).json({
               message: "Unauthorized"
          })
     }
     try {
         const reviews = await Review.find()
          res.json(reviews) 
     }catch(error){
          res.status(500).json({
               message: "Error fetching reviews",
               error: error.message
          })
     }
     
}

export async function deleteReview(req, res){
     if(!isAdmin(req)){
          return res.status(401).json({
               message: "Unauthorized"
          })
     }

     try {
          const productID = req.params.productID
          const email = req.body.email
         
          const review = await Review.findOne({ productID: productID, email: email })

          const stars = review.stars

          const starFieldMap = {
               5: 'ratings.fiveStar',
               4: 'ratings.fourStar',
               3: 'ratings.threeStar',
               2: 'ratings.twoStar',
               1: 'ratings.oneStar'
          }

          await Review.deleteOne({ productID: productID, email:email })

          const product = await Product.findOne({ productID: productID })

          const newNoOfRatings = product.ratings.noOfRatings - 1
          const newTotalStars = product.ratings.stars - stars
          const newAverageStars = newNoOfRatings > 0 ? newTotalStars / newNoOfRatings : 0

          await Product.updateOne({ productID: productID }, {
               $set: {
                    "ratings.noOfRatings": newNoOfRatings,
                    "ratings.stars": newTotalStars,
                    "ratings.averageStars": newAverageStars,
                    [starFieldMap[stars]]: product.ratings[starFieldMap[stars].split('.')[1]] - 1
               }
          })

          return res.json({
               message: "Review deleted successfully."
          })

     }catch(error){
          res.status(500).json({
               message: "Error deleting review",
               error: error.message
          })
     }
}