const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Stock = require('../models/Stock');
const OtherCost = require('../models/OtherCost');
const SalesReturn = require('../models/SalesReturn');

// Helper to normalize keys
function normalize(str) {
  return (str && typeof str === 'string') ? str.trim().toLowerCase() : '';
}

// Helper: get date range
function getDateRange(type, monthIndex = null, day = null, year = null) {
  const now = new Date();
  const selYear = year !== null ? year : now.getFullYear();
  let start, end;

  if (type === 'daily') {
    const month = monthIndex !== null ? monthIndex : now.getMonth();
    const selectedDay = day !== null ? day : now.getDate();
    start = new Date(selYear, month, selectedDay, 0, 0, 0);
    end = new Date(selYear, month, selectedDay, 23, 59, 59);
  } else if (type === 'weekly') {
    const dayOfWeek = now.getDay();
    start = new Date(selYear, now.getMonth(), now.getDate() - dayOfWeek, 0, 0, 0);
    end = new Date(selYear, now.getMonth(), now.getDate() + (6 - dayOfWeek), 23, 59, 59);
  } else if (type === 'monthly') {
    const month = monthIndex !== null ? monthIndex : now.getMonth();
    start = new Date(selYear, month, 1, 0, 0, 0);
    end = new Date(selYear, month + 1, 0, 23, 59, 59);
  } else if (type === 'yearly') {
    start = new Date(selYear, 0, 1, 0, 0, 0);
    end = new Date(selYear, 11, 31, 23, 59, 59);
  } else {
    const month = monthIndex !== null ? monthIndex : now.getMonth();
    start = new Date(selYear, month, 1, 0, 0, 0);
    end = new Date(selYear, month + 1, 0, 23, 59, 59);
  }

  return { start, end };
}

// Shared calculation logic
async function calculateSummary(start, end) {
  // Aggregate stock info (grouped by item/brand/model/quality)
  const stockSummary = await Stock.aggregate([
    {
      $group: {
        _id: { item: "$item", brand: "$brand", model: "$model", quality: "$quality" },
        totalQuantity: { $sum: "$quantity" },
        totalCostSum: { 
          $sum: { $multiply: [{ $add: ["$unitPrice", "$unitothercost"] }, "$quantity"] } 
        },
        salePrice: { $avg: "$saleprice" },
      }
    }
  ]);

  // Map for cost lookup (unit cost = unitPrice + unitothercost)
  const costMap = {};
  stockSummary.forEach(entry => {
    const key = [
      normalize(entry._id.item),
      normalize(entry._id.brand),
      normalize(entry._id.model),
      normalize(entry._id.quality)
    ].join('_');
    const unitCost = entry.totalCostSum / entry.totalQuantity || 0;
    costMap[key] = unitCost;
  });

  // Fetch sales in period
  const sales = await Sale.find({ saleDate: { $gte: start, $lte: end } });
  let stockIncome = 0, stockProfit = 0, repairIncome = 0;
  let cashInHand = 0, bankBalance = 0;

  sales.forEach(sale => {
    // --- income/profit ---
    if (Array.isArray(sale.items)) {
      sale.items.forEach(item => {
        const qty = Number(item.quantity) || 0;
        const salePrice = Number(item.unitPrice) || 0;
        const key = [
          normalize(item.item || item.itemName),
          normalize(item.brand),
          normalize(item.model),
          normalize(item.quality)
        ].join('_');
        const costPrice = costMap[key] || 0;
        stockIncome += salePrice * qty;
        stockProfit += (salePrice * qty) - (costPrice * qty);
      });
    }
    if (Array.isArray(sale.services)) {
      sale.services.forEach(service => {
        repairIncome += Number(service.price) || 0;
      });
    }

    // --- payment method (cash/bank) ---
    let paymentAmount = 0;
    if (sale.totalAmount != null) {
      paymentAmount = Number(sale.totalAmount) || 0;
    } else {
      if (Array.isArray(sale.items)) {
        paymentAmount += sale.items.reduce(
          (sum, i) => sum + ((Number(i.unitPrice) || 0) * (Number(i.quantity) || 0)), 0
        );
      }
      if (Array.isArray(sale.services)) {
        paymentAmount += sale.services.reduce(
          (sum, s) => sum + (Number(s.price) || 0), 0
        );
      }
    }

    const method = (sale.paymentMethod || '').toLowerCase();
    if (method === 'cash') cashInHand += paymentAmount;
    if (method === 'bank') bankBalance += paymentAmount;
  });

  // Handle sales returns
  const salesReturns = await SalesReturn.find({ createdAt: { $gte: start, $lte: end } });
  let repairReturn = 0, stockReturn = 0;

  salesReturns.forEach(sr => {
    if (Array.isArray(sr.services)) {
      sr.services.forEach(service => {
        if (service.returnType === 'return') repairReturn += Number(service.price) || 0;
      });
    }
    if (Array.isArray(sr.items)) {
      sr.items.forEach(item => {
        const qty = Number(item.quantity) || 0;
        const key = [
          normalize(item.item || item.itemName),
          normalize(item.brand),
          normalize(item.model),
          normalize(item.quality)
        ].join('_');
        const costPrice = costMap[key] || 0;
        stockReturn += costPrice * qty;
      });
    }
  });

  const repairProfit = repairIncome - repairReturn;

  // Other costs
  const periodOtherCosts = await OtherCost.find({ createdAt: { $gte: start, $lte: end } });
  const allOtherCosts = await OtherCost.find();
  const otherCostPeriod = periodOtherCosts.reduce((sum, c) => sum + (Number(c.total) || 0), 0);
  const totalOtherCost = allOtherCosts.reduce((sum, c) => sum + (Number(c.total) || 0), 0);

// -----------------------------
  // Loans from OtherCost + Sale.paymentStatus = 'Loan'
  // -----------------------------
  const loansFromOtherCost = allOtherCosts
    .filter(c => (c.category || '').trim().toLowerCase() === 'loan')
    .reduce((sum, c) => sum + (Number(c.total) || 0), 0);

  const loansFromSales = await Sale.aggregate([
    {
      $match: {
        saleDate: { $gte: start, $lte: end },
        paymentStatus: 'Loan'
      }
    },
    {
      $group: { _id: null, total: { $sum: '$totalAmount' } }
    }
  ]);

  const totalLoans = loansFromOtherCost + (loansFromSales[0]?.total || 0);

  // ✅ Total purchased stock value (ever purchased)
  const purchasedAgg = await Stock.aggregate([
    {
      $group: {
        _id: null,
        total: {
          $sum: { $multiply: [{ $add: ["$unitPrice", "$unitothercost"] }, "$quantity"] }
        }
      }
    }
  ]);
  const totalStockValue = purchasedAgg[0]?.total || 0;

  // ✅ In-hand stock value (current)
  const inStockValue = stockSummary.reduce((sum, s) => sum + ((Number(s.totalCostSum) || 0)), 0);

  const totalIncome = stockIncome + repairIncome;
  const totalProfit = stockProfit + repairProfit - otherCostPeriod - stockReturn;

  return {
    stockIncome,
    stockProfit,
    stockReturn,
    repairIncome,
    repairReturn,
    repairProfit,
    totalIncome,
    totalProfit,
    totalOtherCost,
    otherCostPeriod,
    totalStockValue, // all purchased
    inStockValue,    // current remaining
    cashInHand,
    bankBalance,
    loans: totalLoans,          // 🔹 add total loans
  };
}

// Routes
router.get('/daily/:year/:monthIndex/:day', async (req, res) => {
  try {
    const year = parseInt(req.params.year, 10);
    const monthIndex = parseInt(req.params.monthIndex, 10);
    const day = parseInt(req.params.day, 10);
    const { start, end } = getDateRange('daily', monthIndex, day, year);
    res.json(await calculateSummary(start, end));
  } catch (err) {
    res.status(500).json({ message: 'Failed to calculate daily summary', error: err.message });
  }
});

router.get('/weekly', async (req, res) => {
  try {
    const { start, end } = getDateRange('weekly');
    res.json(await calculateSummary(start, end));
  } catch (err) {
    res.status(500).json({ message: 'Failed to calculate weekly summary', error: err.message });
  }
});

router.get('/month/:monthIndex', async (req, res) => {
  try {
    const monthIndex = parseInt(req.params.monthIndex, 10);
    const { start, end } = getDateRange('monthly', monthIndex);
    res.json(await calculateSummary(start, end));
  } catch (err) {
    res.status(500).json({ message: 'Failed to calculate monthly summary', error: err.message });
  }
});

router.get('/yearly/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year, 10);
    const { start, end } = getDateRange('yearly', null, null, year);
    res.json(await calculateSummary(start, end));
  } catch (err) {
    res.status(500).json({ message: 'Failed to calculate yearly summary', error: err.message });
  }
});


module.exports = router;
