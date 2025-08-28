const express = require('express');
const router = express.Router();
const SalesReturn = require('../models/SalesReturn');
const Counter = require('../models/Counter'); // auto-increment counter model
const Stock = require('../models/Stock');

// POST: Create a new sales return
router.post('/', async (req, res) => {
  try {
    const { originalInvoiceNo, customer, phone, items, services, paymentMethod } = req.body;

    // Validate items or services
    if (!items?.length && !services?.length) {
      return res.status(400).json({ error: 'No items or services provided for return' });
    }

    // Auto-increment salesReturnNumber
    const counter = await Counter.findOneAndUpdate(
      { name: 'salesReturn' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // Compute total refund
    const itemsTotal = (items || []).reduce((sum, i) => {
      const type = (i.returnType || '').toLowerCase();
      return type === 'return stock' ? sum + (i.unitPrice * i.quantity) : sum;
    }, 0);

    const servicesTotal = (services || []).reduce((sum, s) => {
      const type = (s.returnType || '').toLowerCase();
      return type === 'return' ? sum + s.price : sum;
    }, 0);

    const totalRefund = itemsTotal + servicesTotal;

    // Add type field to each item/service if missing
    const preparedItems = (items || []).map(i => ({
      ...i,
      type: i.returnType || 'Return Stock'
    }));

    const preparedServices = (services || []).map(s => ({
      ...s,
      type: s.returnType || 'Return'
    }));

    // Save SalesReturn
    const salesReturn = new SalesReturn({
      salesReturnNumber: counter.seq,
      originalInvoiceNo,
      customer,
      phone,
      paymentMethod,
      items: preparedItems,
      services: preparedServices,
      totalRefund
    });

    await salesReturn.save();

    // Update stock for returned items
    for (const i of preparedItems) {
      const lowerType = (i.type || '').toLowerCase();
      if (lowerType === 'return stock') {
        // Return to stock: increase available and instock quantities
        await Stock.findOneAndUpdate(
          { itemCode: i.itemCode },
          {
            $inc: {
              availableQuantity: i.quantity,
              instockQuantity: i.quantity,
              instockValue: i.quantity * i.unitPrice
            }
          }
        );
      } else if (lowerType === 'return lost' || lowerType === 'replaced') {
        // Track lost or replaced quantity
        await Stock.findOneAndUpdate(
          { itemCode: i.itemCode },
          { $inc: { lostQuantity: i.quantity || 0 } }
        );
      }
    }

    res.status(201).json({ message: 'Sales return saved', salesReturn });
  } catch (err) {
    console.error('Error saving sales return:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET: Fetch all sales returns
router.get('/', async (req, res) => {
  try {
    const returns = await SalesReturn.find().sort({ createdAt: -1 });
    res.json(returns);
  } catch (err) {
    console.error('Error fetching sales returns:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET: Fetch only service returns with returnType = 'return'
router.get('/services', async (req, res) => {
  try {
    const serviceReturns = await SalesReturn.find({ 'services.0': { $exists: true } })
      .sort({ createdAt: -1 });

    // Filter services to include only those with type 'return'
    const filteredReturns = serviceReturns.map(sr => ({
      ...sr.toObject(),
      services: sr.services.filter(s => (s.returnType || '').toLowerCase() === 'return')
    })).filter(sr => sr.services.length > 0); // remove entries with no returned services

    res.json(filteredReturns);
  } catch (err) {
    console.error('Error fetching service returns:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
