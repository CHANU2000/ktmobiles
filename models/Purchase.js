const mongoose = require('mongoose');
const { required } = require('react-admin');

const PurchaseSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  brand:{type:String,required:true},
  ql:{type:String,required:true},
  supplier: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  purchasePrice: { type: Number, required: true, default: 0 },
  purchaseDate: { type: Date, default: Date.now 
  },
});

module.exports = mongoose.model('Purchase', PurchaseSchema);
