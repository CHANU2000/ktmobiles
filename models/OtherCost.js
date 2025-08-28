const mongoose = require('mongoose');

const OtherCostSchema = new mongoose.Schema({
  category: { type: String, required: true },
  item: { type: String, default: '' },
  details: { type: String, default: '' },
  unitPrice: { type: Number, default: 0 },
  quantity: { type: Number, default: 0 },
  total: { type: Number, required: true },
  date: { type: Date, required: true }
});

module.exports = mongoose.model('OtherCost', OtherCostSchema);
