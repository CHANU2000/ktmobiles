const express = require('express');
const router = express.Router();
const Customerreceipt = require('../models/Customerreceipt');

router.get('/by-invoice/:invoiceNo', async (req, res) => {
  try {
    const invoice = await Customerreceipt.findOne({ formattedJobNumber: req.params.invoiceNo });
    if (!invoice) {
      return res.status(404).json({ message: 'Pre-invoice not found' });
    }
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// GET next job number (formatted)
router.get('/next-invoice-number', async (req, res) => {
  try {
    const last = await Customerreceipt.findOne().sort({ sequence: -1 });
    const nextSeq = last ? last.sequence + 1 : 1;
    const year = new Date().getFullYear();
    const yearSuffix = String(year).slice(-2);
    const formattedJobNumber = `KT${yearSuffix}-${String(nextSeq).padStart(4, '0')}`;
    res.json({ formattedJobNumber, nextSeq });
  } catch (err) {
    console.error('Error getting next invoice number:', err);
    res.status(500).json({ error: 'Server error fetching next job number' });
  }
});


// GET all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Customerreceipt.find().sort({ sequence: 1 });
    res.json(jobs);
  } catch (err) {
    console.error('GET all jobs error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create new job
router.post('/', async (req, res) => {
  try {
    const newJob = new Customerreceipt(req.body);
    await newJob.save();
    res.status(201).json(newJob);
  } catch (err) {
    console.error('POST create job error:', err);
    res.status(400).json({ error: 'Failed to create job' });
  }
});

// PUT update job
router.put('/:id', async (req, res) => {
  try {
    const updatedJob = await Customerreceipt.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedJob);
  } catch (err) {
    console.error('PUT update job error:', err);
    res.status(400).json({ error: 'Failed to update job' });
  }
});

// DELETE job
router.delete('/:id', async (req, res) => {
  try {
    await Customerreceipt.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error('DELETE job error:', err);
    res.status(400).json({ error: 'Failed to delete job' });
  }
});


module.exports = router;
