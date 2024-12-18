const express = require('express');
const CartService = require('../services/cartService');
const router = express.Router();

// Create a new cart for a user
router.post('/:userId', async (req, res) => {
  try {
    const cart = await CartService.createCart(req.params.userId);
    res.status(201).json(cart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add an item to the cart
router.post('/:cartId/items', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cartItem = await CartService.addItemToCart(req.params.cartId, productId, quantity);
    res.status(201).json(cartItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all items in a cart
router.get('/:cartId/items', async (req, res) => {
  try {
    const items = await CartService.getCartItems(req.params.cartId);
    res.json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update quantity of a cart item
router.put('/:cartId/items/:itemId', async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartItem = await CartService.updateCartItem(req.params.itemId, quantity);
    res.json(cartItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Remove an item from the cart
router.delete('/:cartId/items/:itemId', async (req, res) => {
  try {
    await CartService.removeCartItem(req.params.itemId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
