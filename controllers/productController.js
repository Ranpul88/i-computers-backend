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