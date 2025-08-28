const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');

router.post('/', async (req, res) => {
  try {
    const newPurchase = new Purchase(req.body);
    await newPurchase.save();
    res.status(201).json(newPurchase);
  } catch (err) {
    res.status(500).json({ error: "Failed to add purchase" });
  }
});

router.get('/', async (req, res) => {
  try {
    const purchases = await Purchase.find().sort({ purchaseDate: -1 });
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch purchases" });
  }
});

module.exports = router;
