const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const customerReceiptSchema = new mongoose.Schema({
  sequence: { type: Number, unique: true }, // auto-increment number
formattedJobNumber: { type: String, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  issue: { type: String, required: true },
  condition: { type: String, required: true },
  screenLockType: { type: String },
  screenLockCode: { type: String },
  note: { type: String },
  status: { type: String, default: 'Pending' },
  date: { type: Date, required: true },
  advance: {type: Number, require:true},
  description: { type: String },
  cost: { type: Number },
  salePrice: { type: Number },
  specialNote: { type: String },
  createdAt: { type: Date, default: Date.now },
});

customerReceiptSchema.pre('save', function (next) {
  if (!this.formattedJobNumber) {
    const year = new Date().getFullYear();
    const yearSuffix = String(year).slice(-2);
    this.formattedJobNumber = `KT${yearSuffix}-${String(this.sequence).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Customerreceipt', customerReceiptSchema);
