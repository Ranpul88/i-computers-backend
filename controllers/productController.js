import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

export function createProduct(req, res){
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
                message: "Erroe creating product.",
                error: error.message
            })
        })
}

export function getAllProducts(req, res){
    if(isAdmin(req)){
        Product.find()
            .then((products)=>{
                res.json(products)
            })
            .catch((error)=>{
                req.status(500).json({
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
                req.status(500).json({
                    message: "Error fetching data",
                    error: error.message
                })
            })
    }
}

export function deleteProduct(req, res){
    if(!isAdmin(req)){
        res.status(403).json({
            message: "Only admin can delete products."
        })

        return
    }

    const productID = req.body.productID

    Product.deleteOne({productID: productID})
        .then(()=>{
            res.json({
                message: "Product deleted successfully."
            })
        })
}