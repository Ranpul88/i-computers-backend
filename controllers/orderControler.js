import Order from "../models/order.js";
import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

export async function createOrder(req, res){

    if(req.user == null){
        res.status(401).json({
            message: "Unauthorized"
        })
        return
    }

    try {
        const latestOrder = await Order.findOne().sort({date: -1})

    let orderID = "ORD000001"

    if(latestOrder != null){
            let latestOrderID = latestOrder.orderID
            let latestOrderNumberString = latestOrderID.replace("ORD", "")
            let latestOrderNumber = parseInt(latestOrderNumberString)

            let newOrderNumber = latestOrderNumber + 1
            let newOrderNumberString = newOrderNumber.toString().padStart(6, '0')

            orderID = "ORD" + newOrderNumberString
        }

        const items = []
        let total = 0

        for(let i = 0; i < req.body.items.length; i++){
            const product = await Product.findOne({ productID: req.body.items[i].productID })

            if(product == null){
                return res.status(400).json({
                    message : `product with ID ${req.body.items[i].productID} not found.`
                })
            }

            // if(product.stock < req.body.items[i].qunatity){
            //     return res.status(400).json({
            //         message: `Only ${product.stock} number of items are available.`
            //     })
            // }

            items.push({
                productID: product.productID,
                name: product.name,
                price: product.price,
                quantity: req.body.items[i].quantity,
                image: product.images[0]
            })

            total += product.price * req.body.items[i].quantity
        }

        let name = req.body.name

        if(name == null){
            name = req.user.firstName + " " + req.user.lastName
        }

        const newOrder = new Order({
            orderID: orderID,
            email: req.user.email,
            name: name,
            address: req.body.address,
            total: total,
            items: items,
            phone: req.body.phone
        })

        await newOrder.save()

        // for(let i = 0; i < items.length; i++){
        //     await Product.updateOne({ productID: items[i].productID }, { stock: items[i].stock - req.body.items[i].qunatity })
        // }

        return res.json({
            message: "Order placed successfully",
            orderID: orderID
        })

    } catch (error) {
        return res.status(500).json({
            message: "Error creating order.",
            error: error.message
        })
    }
}

export async function getOrders(req, res){
    if(req.user == null){
        res.status(401).json({
            message: "Unauthorized"
        })
        return
    }

    if(isAdmin){
        const orders = await Order.find().sort({ date:-1 })
        res.json(orders)
    }else{
        const orders = await Order.find({ email:req.user.email }).sort({ date:-1 })
        res.json(orders)
    }
}