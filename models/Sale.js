const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

// Item schema
const itemSchema = new mongoose.Schema({
  itemCode: { type: String, required: false },
  itemName: { type: String, required: true },
  brand: { type: String },
  model: { type: String },
  quality: { type: String },
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
}, { _id: false });

// Service schema
const serviceSchema = new mongoose.Schema({
  serviceName: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
}, { _id: false });

// Installment schema for loan payments
const installmentSchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 0 },
  date: { type: Date, default: Date.now },
   method: { type: String, enum: ['Cash', 'Bank', 'Loan'], default: 'Cash' },
}, { _id: false });
// Sale schema
const saleSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true, unique: true },
  jobNo: { type: String },
  prebillDate: { type: Date },
  customer: { type: String },
  phone: { type: String },
  brand: { type: String },
  model: { type: String },
  customerType: {
  type: String,
  enum: ['new', 'prebill'],
  required: true,
},

  advance: { type: Number, default: 0, min: 0 },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Unpaid', 'Pending'],
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank','Loan'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Repairedinstock', 'Repairedissue', 'Returninstock', 'Returnissue'],
    default: 'Pending',
  },
  saleDate: { type: Date, default: Date.now },
  items: [itemSchema],
  services: [serviceSchema],
  totalAmount: { type: Number, min: 0 },
    remainingBalance: { type: Number, min: 0, default: 0 },
  installments: [installmentSchema], 
  sequence: { type: Number }, // Auto-incrementing ID
}, { timestamps: true });



// Add auto-increment plugin for the sequence field
saleSchema.plugin(AutoIncrement, { inc_field: 'sequence' });

module.exports = mongoose.model('Sale', saleSchema);
