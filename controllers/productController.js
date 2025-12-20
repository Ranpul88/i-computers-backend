import Order from "../models/Order.js";
import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

export function createProduct(req, res){
    try {
        if(!isAdmin(req)){
            res.status(403).json({
                message: "Forbidden"
            })
            return
        }

        const product = new Product(req.body)
        
        product.save()
            .then(()=>{
                res.json({
                    message: "Product created scuccessfully"
                })
            })
            .catch((error)=>{
                res.status(500).json({
                    message: "Error creating product.",
                    error: error.message
                })
            })
    }catch(error){
        req.status(500).json({
            message: "Error Creating product",
            error: error.message
        })
    }
    
}

export function getAllProducts(req, res){
    try {
        if(isAdmin(req)){
            Product.find()
                .then((products)=>{
                    res.json(products)
                })
                .catch((error)=>{
                    res.status(500).json({
                        message: "Error fetching data",
                        error: error.message
                    })
                })
        }else{
            Product.find({isAvailable: true})
                .then((products)=>{
                    res.json(products)
                })
                .catch((error)=>{
                    res.status(500).json({
                        message: "Error fetching data",
                        error: error.message
                    })
                })
        }   
    }catch(error){
        res.status(500).json({
            message: "Error fetching product",
            error: error.message
        })
    }
    
}

export function deleteProduct(req, res){
    try {
        if(!isAdmin(req)){
            res.status(403).json({
                message: "Only admin can delete products."
            })

            return
        }

        const productID = req.params.productID

        Product.deleteOne({productID: productID})
            .then(()=>{
                res.json({
                    message: "Product deleted successfully."
                })
            })
            .catch((error)=>{
                res.status(500).json({
                    message: "Error deleting product",
                    error: error.message
                })
            })    
    } catch(error){
        res.status(500).json({
            message: "Error deleting product",
            error: error.message
        })
    }
    
}

export function updateProduct(req, res){
    try {
        if(!isAdmin(req)){
            res.status(403).json({
                message: "Only admin can update products."
            })
            return
        }

        const productID = req.params.productID

        Product.updateOne({productID: productID}, req.body)
            .then(()=>{
                res.json({
                    message: "Product updated successfully."
                })
            })
            .catch((error)=>{
                res.status(500).json({
                    message: "Error fetching product.",
                    error: error.message
                })
            })    
    }catch(error){
        res.status(500).json({
            message: "Error updating product.",
            error: error.message
        })
    }
    
}

export function getProductByID(req, res){
    try {
        const productID = req.params.productID

        Product.findOne({productID: productID})
            .then((product)=>{
                if(product==null){
                    res.status(404).json({
                        message: "Product not found."
                    })
                }else{
                    if(product.isAvailable){
                        res.json(product)
                    }else{
                        if(isAdmin(req)){
                            res.json(product)
                        }else{
                            res.status(404).json({
                                message: "Product not found."
                            })
                        }
                    }
                }
            })
            .catch((error)=>{
                res.status(500).json({
                    message: "Error fetching product.",
                    error: error.message
                })
            })    
    }catch(error){
        res.status(500).json({
            message: "Error fetching product.",
            error: error.message
        })
    }
    
}

export async function searchProduct(req, res){
    const query = req.params.query

    try {
        const products = await Product.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { altNames: { $elemMatch : { $regex: query, $options: "i" } } }
            ],
            isAvailable: true
        })
        return res.json(products)

    }catch(error){
        res.status(500).json({
            message: "Error searching product",
            error: error.message
        })
    }
}

export async function updateRatings(req, res){
    if(req.user == null){
        return res.status(401).json({
            message: "Unauthorized"
        })
    }

    try {
        const email = req.user.email
        const productID = req.params.productID
        const stars = req.body.stars

        const orderStatus = await Order.find({ email: email, status: "completed", "items.productID": productID })

        if(orderStatus == null){
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        const lastReview = await Product.findOne({ productID: productID })

        let noOfRatings = 1
        let fiveStar = 0
        let fourStar = 0
        let threeStar = 0
        let twoStar = 0
        let oneStar = 0

        if(lastReview != null){
            noOfRatings = lastReview.noOfRatings + 1
            fiveStar = lastReview.fiveStar
            fourStar = lastReview.fourStar
            threeStar = lastReview.threeStar
            twoStar = lastReview.twoStar
            oneStar = lastReview.oneStar
        }

        if(stars == 5){
            fiveStar += 1
        }else if(stars == 4){
            fourStar += 1
        }else if(stars == 3){
            threeStar += 1
        }else if(stars == 2){
            twoStar += 1
        }else{
            oneStar += 1
        }

        const totalStars = (5 * fiveStar) + (4 * fourStar) + (3 * threeStar) + (2 * twoStar) + (oneStar)
        const averageStars = totalStars/noOfRatings

        await Product.updateOne({ productID: productID }, 
            {
                $set: {
                    "ratings.noOfRatings": noOfRatings,
                    "ratings.stars": parseFloat(averageStars.toFixed(1)),
                    "ratings.fiveStar": fiveStar,
                    "ratings.fourStar": fourStar,
                    "ratings.threeStar": threeStar,
                    "ratings.twoStar": twoStar,
                    "ratings.oneStar": oneStar
                }
            }
        )

        return res.json({
            message: "Review created successfully"
        })

    }catch(error){
        res.status(500).json({
            message: "Error creating review.",
            error: error.message
        })
    }
}