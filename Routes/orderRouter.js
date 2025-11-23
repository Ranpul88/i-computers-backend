import express from "express";
import { createOrder, getOrders, updateOrderStatus } from "../controllers/orderControler.js";

const orderRouter = express.Router()

orderRouter.post("/", createOrder)
orderRouter.get("/", getOrders)
orderRouter.put("/:orderID", updateOrderStatus)

export default orderRouter