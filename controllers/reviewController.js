import Review from "../models/Review.js";

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

          const duplicateReview = Review.find({ email: email, productID: productID })

          if(duplicateReview!=null){
               return res.status(409).json({
                    message: "Duplicate review"
               })
          }

          const newReview = new Review({
               productID: productID,
               stars: stars,
               name: name || "",
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