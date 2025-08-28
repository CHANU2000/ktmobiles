const mongoose = require('mongoose');

const purchaseCounterSchema = new mongoose.Schema({
  year: Number,
  count: Number
});

module.exports = mongoose.model('PurchaseCounter', purchaseCounterSchema);
