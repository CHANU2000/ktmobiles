const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Customerreceipt = require('../models/Customerreceipt');
const Stock = require('../models/Stock');

// Valid options
const validPaymentStatus = ['Paid', 'Unpaid', 'Pending'];
const validPaymentMethod = ['Cash', 'Bank', 'Loan'];

// ------------------------------
// GET all sales (optional date filter)
// ------------------------------
router.get('/', async (req, res) => {
  try {
    const { from, to } = req.query;
    let filter = {};
    if (from || to) {
      filter.saleDate = {};
      if (from) filter.saleDate.$gte = new Date(from);
      if (to) filter.saleDate.$lte = new Date(to);
    }
    const sales = await Sale.find(filter).sort({ invoiceNo: 1  });
    res.json(sales);
  } catch (err) {
    console.error('Error fetching sales:', err);
    res.status(500).json({ message: 'Failed to fetch sales' });
  }
});

// ------------------------------
// GET sale by invoice number
// ------------------------------
router.get('/by-invoice/:invoiceNo', async (req, res) => {
  try {
    const sale = await Customerreceipt.findOne({ formattedJobNumber: req.params.invoiceNo });
    if (!sale) return res.status(404).json({ message: 'Prebill not found' });
    res.json(sale);
  } catch (err) {
    console.error('Error fetching prebill:', err);
    res.status(500).json({ message: 'Failed to fetch prebill' });
  }
});

// ------------------------------
// POST new sale
// ------------------------------
router.post('/', async (req, res) => {
  const {
    customerType,
    invoiceNo,
    prebillDate,
    customer,
    phone,
    brand,
    model,
    issue,
    condition,
    advance = 0,
    status,
    paymentMethod,
    saleDate,
    items = [],
    services = [],
    customerReceiptStatus,
    totalAmount = 0,
  } = req.body;

  let jobData = {};

  try {
    const type = customerType.toLowerCase();

    if (type === 'new') {
      const last = await Customerreceipt.findOne().sort({ sequence: -1 });
      const nextSeq = last ? last.sequence + 1 : 1;
      const yearSuffix = String(new Date().getFullYear()).slice(-2);
      const formattedJobNumber = `KT${yearSuffix}-${String(nextSeq).padStart(4, '0')}`;

      const receiptStatus = customerReceiptStatus || 'Repair done - issued';

      const newJob = new Customerreceipt({
        sequence: nextSeq,
        formattedJobNumber,
        name: customer,
        phone,
        brand,
        model,
        issue,
        condition,
        date: prebillDate ? new Date(prebillDate) : new Date(),
        advance,
        status: receiptStatus,
      });

      await newJob.save();

      jobData = {
        jobNo: newJob.formattedJobNumber,
        customer: newJob.name,
        phone: newJob.phone,
        brand: newJob.brand,
        model: newJob.model,
      };
    } else if (type === 'prebill') {
      if (!invoiceNo) {
        return res.status(400).json({ message: 'Invoice number is required for prebill customers.' });
      }

      const existingJob = await Customerreceipt.findOne({ formattedJobNumber: invoiceNo });
      if (!existingJob) {
        return res.status(400).json({ message: 'Referenced invoice not found in customer receipts.' });
      }

      existingJob.status = customerReceiptStatus || 'Repair done - issued';
      await existingJob.save();

      jobData = {
        jobNo: existingJob.formattedJobNumber,
        customer: existingJob.name,
        phone: existingJob.phone,
        brand: existingJob.brand,
        model: existingJob.model,
      };
    }
  } catch (err) {
    console.error('Error processing job data:', err);
    return res.status(500).json({ message: 'Error creating or retrieving job.' });
  }
  try {
    const saleData = req.body;

    // Validate payment status/method
    const paymentStatus = validPaymentStatus.includes(saleData.paymentStatus)
      ? saleData.paymentStatus
      : 'Unpaid';
    const paymentMethod = validPaymentMethod.includes(saleData.paymentMethod)
      ? saleData.paymentMethod
      : 'Cash';

    const sale = new Sale({
      invoiceNo: saleData.invoiceNo,
      prebillDate: saleData.prebillDate ? new Date(saleData.prebillDate) : null,
      customer: saleData.customer,
      phone: saleData.phone,
      brand: saleData.brand,
      model: saleData.model,
      jobNo: saleData.invoiceNo,
      customerType: saleData.customerType,
      advance: saleData.advance || 0,
      status: saleData.status || 'Pending',
      paymentStatus,
      paymentMethod,
      saleDate: new Date(),
      items: saleData.items || [],
      services: saleData.services || [],
      totalAmount: saleData.totalAmount || 0,
      remainingBalance: (saleData.totalAmount || 0) - (saleData.advance || 0),
      installments: [],
    });

    await sale.save();
    res.status(201).json({ message: 'Sale saved successfully', sale });
  } catch (err) {
    console.error('Error saving sale:', err);
    res.status(500).json({ message: 'Failed to save sale' });
  }
});

// ------------------------------
// GET next invoice/job number
// ------------------------------
router.get('/next-invoice-number', async (req, res) => {
  try {
    const last = await Customerreceipt.findOne().sort({ sequence: -1 });
    const nextSeq = last ? last.sequence + 1 : 1;
    const yearSuffix = String(new Date().getFullYear()).slice(-2);
    const formattedJobNumber = `KT${yearSuffix}-${String(nextSeq).padStart(4, '0')}`;
    res.json({ formattedJobNumber, sequence: nextSeq });
  } catch (err) {
    console.error('Error generating invoice number:', err);
    res.status(500).json({ message: 'Failed to generate invoice number' });
  }
});

// ------------------------------
// GET stock summary
// ------------------------------
router.get('/stocks/summary', async (req, res) => {
  try {
    const stockItems = await Stock.find();
    const items = stockItems.map(item => ({
      itemCode: item.itemCode,
      itemName: item.itemName,
      brand: item.brand,
      model: item.model,
      quality: item.quality,
      unitPrice: item.unitPrice,
    }));
    res.json({ items });
  } catch (err) {
    console.error('Error fetching stock summary:', err);
    res.status(500).json({ message: 'Failed to fetch stock summary' });
  }
});

// ------------------------------
// GET unit price by item details
// ------------------------------
router.get('/stocks/unit-price', async (req, res) => {
  try {
    const { item, brand, model, quality } = req.query;
    const stockItem = await Stock.findOne({ itemName: item, brand, model, quality });
    if (!stockItem) return res.status(404).json({ message: 'Unit price not found' });
    res.json({ unitPrice: stockItem.unitPrice });
  } catch (err) {
    console.error('Error fetching unit price:', err);
    res.status(500).json({ message: 'Failed to fetch unit price' });
  }
});

// ------------------------------
// GET stock by itemCode
// ------------------------------
router.get('/stocks/by-item-code/:itemCode', async (req, res) => {
  try {
    const itemCode = req.params.itemCode;
    const stockItem = await Stock.findOne({ itemCode });
    if (!stockItem) return res.status(404).json({ message: 'Item code not found' });
    res.json(stockItem);
  } catch (err) {
    console.error('Error fetching stock by itemCode:', err);
    res.status(500).json({ message: 'Failed to fetch stock item' });
  }
});
// ------------------------------
// PUT /api/sales/:id/settle (Installment / Full Payment)
// ------------------------------
router.put('/:id/settle', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });

    const { amount, method } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid payment amount' });

    // Add installment entry
    sale.installments.push({
      amount,
      method: method || 'Cash',
      date: new Date(),
    });

    // Calculate total paid
    const totalPaid = sale.installments.reduce((sum, inst) => sum + inst.amount, 0);

    // Update remaining balance
    sale.remainingBalance = sale.totalAmount - sale.advance - totalPaid;

    // Update payment status and method if fully paid
    if (sale.remainingBalance <= 0) {
      sale.paymentStatus = 'Paid';
      sale.paymentMethod = method || 'Cash';
    } else {
      // Keep as Pending if not fully paid
      sale.paymentStatus = 'Pending';
    }

    await sale.save();
    res.json({ message: 'Payment updated successfully', sale });
  } catch (err) {
    console.error('Error settling payment:', err);
    res.status(500).json({ message: 'Failed to settle payment' });
  }
});

module.exports = router;
