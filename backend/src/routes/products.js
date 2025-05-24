const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  sellProduct
} = require('../controllers/products');

// Get all products
router.get('/', authenticateUser, getProducts);

// Get a single product
router.get('/:id', authenticateUser, getProduct);

// Create a new product
router.post('/', authenticateUser, createProduct);

// Update a product
router.put('/:id', authenticateUser, updateProduct);

// Delete a product
router.delete('/:id', authenticateUser, deleteProduct);

// Sell a product
router.post('/:id/sell', authenticateUser, sellProduct);

module.exports = router; 