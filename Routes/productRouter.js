import express from 'express'
import { createProduct, deleteProduct, getAllProducts, getProductByID, searchProduct, updateProduct, updateRatings } from '../controllers/productController.js'

const productRouter = express.Router()

productRouter.get('/', getAllProducts)
productRouter.post('/', createProduct)
productRouter.get('/search/:query', searchProduct)
productRouter.get('/:productID', getProductByID)
productRouter.delete('/:productID', deleteProduct)
productRouter.put('/:productID', updateProduct)
productRouter.put('/ratings/:productID', updateRatings)

export default productRouter