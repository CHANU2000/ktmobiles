const mongoose = require('mongoose');

const salesReturnItemSchema = new mongoose.Schema({
  itemCode: { type: String, required: true }, // link to stock
  itemName: { type: String, required: true },
  brand: String,
  model: String,
  quality: String,
  unitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true }, // quantity returned
  returnType: {
    type: String,
    enum: ['return stock', 'return lost', 'replaced', 'not return'],
    required: true,
    default: 'not return'
  }
});

const salesReturnServiceSchema = new mongoose.Schema({
  serviceName: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  returnType: {
    type: String,
    enum: ['return', 'not return'],
    required: true,
    default: 'not return'
  }
});

const salesReturnSchema = new mongoose.Schema({
  salesReturnNumber: { type: Number, unique: true }, // auto-increment
  originalInvoiceNo: { type: String, required: true },
  customer: { type: String, required: true },
  phone: { type: String, required: true },
  paymentMethod: { type: String },
  items: [salesReturnItemSchema],
  services: [salesReturnServiceSchema],
  totalRefund: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('SalesReturn', salesReturnSchema);




