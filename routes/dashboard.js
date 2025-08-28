// routes/dashboard.js
const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');

router.get('/summary', async (req, res) => {
  try {
    const { year, month } = req.query;

    const dateFilter = {};
    if (year) {
      const y = parseInt(year);
      const m = month ? parseInt(month) - 1 : 0;

      const startDate = new Date(y, m, 1);
      const endDate = month
        ? new Date(y, m + 1, 1)
        : new Date(y + 1, 0, 1);

      dateFilter.date = { $gte: startDate, $lt: endDate };
    }

    const sales = await Sale.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } }
    ]);
    const purchases = await Purchase.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, totalPurchases: { $sum: "$totalAmount" } } }
    ]);

    const totalSales = sales[0]?.totalSales || 0;
    const totalPurchases = purchases[0]?.totalPurchases || 0;
    const profit = totalSales - totalPurchases;

    res.json({ totalSales, totalPurchases, profit });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    res.status(500).json({ message: 'Error fetching summary' });
  }
});

module.exports = router;
