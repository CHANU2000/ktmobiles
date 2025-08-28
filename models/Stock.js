const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  stockId: { type: Number},
  formattedStockId: { type: String, required: true },

  supplier: { type: String, required: true },
  brand: { type: String, required: true },
  model: String,
  item: { type: String, required: true },
  quality: String,
  description: String,

  unitPrice: { type: Number, default: 0 },
  quantity: { type: Number, default: 0 },           // Purchased quantity
  soldQuantity: { type: Number, default: 0 },       // How many were sold
  lostQuantity: { type: Number, default: 0 },       // Lost or replaced
  returnStockQuantity: { type: Number, default: 0}, // Returned into stock ✅

  availability: { type: String, default: 'Available' },

  othercost: { type: Number, default: 0 },      // total other cost for this stock row
  unitothercost: { type: Number, default: 0 },  // computed per unit other cost
  totalprice: { type: Number, default: 0 },     // unitPrice * quantity
  totalcost: { type: Number, default: 0 },      // unittotalcost * quantity
  unittotalcost: { type: Number, default: 0 },  // unitPrice + unitothercost

  saleprice: { type: Number, default: 0 },
  itemCode: { type: String, required: true },

  instockQuantity: { type: Number, default: 0 },
  instockValue: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

// Pre-save hook to calculate derived fields
stockSchema.pre('save', async function (next) {
  const Stock = mongoose.models.Stock || mongoose.model('Stock');

  // auto-increment numeric stockId
  if (!this.stockId) {
    const latest = await Stock.findOne().sort({ stockId: -1 }).select('stockId').lean();
    this.stockId = latest?.stockId ? latest.stockId + 1 : 1;
  }

  // formatted id if not provided
  if (!this.formattedStockId) {
    const year = new Date().getFullYear();
    const padded = String(this.stockId).padStart(4, '0');
    this.formattedStockId = `STK-${year}-${padded}`;
  }

  // compute unitothercost (spread othercost across quantity)
  if (this.quantity && this.quantity > 0) {
    this.unitothercost = (this.othercost || 0) / this.quantity;
  } else {
    this.unitothercost = this.unitothercost || 0;
  }

  // unit total cost
  this.unittotalcost = (this.unitPrice || 0) + (this.unitothercost || 0);

  // compute total price
this.totalprice = (this.unitPrice || 0) * (this.quantity || 0);

// total cost = total price + other cost
this.totalcost = this.totalprice + (this.othercost || 0);

// unit total cost per item
this.unittotalcost = qty ? this.totalcost / (this.quantity || 1) : 0;


  // instock quantity = purchased − sold + returned
  let instockQty = (this.quantity || 0) - (this.soldQuantity || 0) + (this.returnStockQuantity || 0);
  this.instockQuantity = instockQty < 0 ? 0 : instockQty;

  // instock value
  this.instockValue = this.unittotalcost * this.instockQuantity;

  next();
});

// Virtual: net sold (sold - lost)
stockSchema.virtual('soldBalanceQuantity').get(function () {
  return (this.soldQuantity || 0) - (this.lostQuantity || 0);
});

// Virtual: sold balance value
stockSchema.virtual('soldBalanceValue').get(function () {
  return (this.soldBalanceQuantity || 0) * (this.unittotalcost || 0);
});

// Include virtuals in JSON/Object
stockSchema.set('toJSON', { virtuals: true });
stockSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Stock', stockSchema);
