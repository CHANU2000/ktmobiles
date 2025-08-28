const express = require('express');
const router = express.Router();
const OtherCost = require('../models/OtherCost');

// Create a new cost
router.post('/', async (req, res) => {
  try {
    const {
      category,
      item,
      details,
      unitPrice,
      quantity,
      total,
      date
    } = req.body;

    if (!category || !total || !date) {
      return res.status(400).json({ message: 'Category, total, and date are required.' });
    }

    const cost = await OtherCost.create({
      category,
      item,
      details,
      unitPrice,
      quantity,
      total,
      date
    });

    res.status(201).json(cost);
  } catch (err) {
    console.error('POST / error:', err);
    res.status(500).json({ message: 'Failed to add cost' });
  }
});

// Get all or filtered costs by date
router.get('/', async (req, res) => {
  try {
    const { start, end } = req.query;
    const query = {};

    if (start && end) {
      query.date = {
        $gte: new Date(start),
        $lte: new Date(end)
      };
    }

    const costs = await OtherCost.find(query).sort({ date: -1 });
    res.json(costs);
  } catch (err) {
    console.error('GET / error:', err);
    res.status(500).json({ message: 'Failed to fetch costs' });
  }
});

// Update cost
router.put('/:id', async (req, res) => {
  try {
    const updated = await OtherCost.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Cost not found' });

    res.json(updated);
  } catch (err) {
    console.error('PUT /:id error:', err);
    res.status(500).json({ message: 'Failed to update cost' });
  }
});

// Delete cost
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await OtherCost.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Cost not found' });

    res.status(204).end();
  } catch (err) {
    console.error('DELETE /:id error:', err);
    res.status(500).json({ message: 'Failed to delete cost' });
  }
});

module.exports = router;
