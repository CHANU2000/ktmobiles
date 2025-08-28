const mongoose = require('mongoose');
const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: String,
  phone: String,
  address:String,
  desc:String
});
module.exports = mongoose.model('Supplier', SupplierSchema);
