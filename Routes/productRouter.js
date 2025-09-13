import express from 'express'
import { createProduct, deleteProduct, getAllProducts } from '../controllers/productController.js'

const productRouter = express.Router()

productRouter.get('/', getAllProducts)
productRouter.post('/', createProduct)
productRouter.delete('/:productID', deleteProduct)

export default productRouter