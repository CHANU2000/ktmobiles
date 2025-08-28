const express=require("express");
const mongoose=require("mongoose");
const cors=require("cors");
require("dotenv").config();
const productRoutes=require('./routes/productRoutes');
const supplierRoutes=require('./routes/supplierRoutes');
const purchaseRoutes=require('./routes/purchaseRoutes');
const salesRoutes=require('./routes/salesRoutes');
const stockRoutes=require('./routes/stockRoutes');
const receiptRoutes=require('./routes/receiptRoutes');
const othercostRoutes=require('./routes/othercostRoutes');
const finalaccountRoutes=require('./routes/finalaccount');
const salesReturnRoutes =require('./routes/salesReturns');


const app=express();
app.use(cors());
app.use(express.json());


const mongoURL = process.env.MONGO_URL || "mongodb://localhost:27017/ktmobiles";

mongoose.connect(mongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB connected to", mongoURL);
})
.catch((err) => {
  console.error("❌ MongoDB connection failed:", err.message);
  process.exit(1); // exit app if DB fails
});

app.use("/api/products", productRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/purchases",purchaseRoutes);
app.use("/api/sales",salesRoutes);
app.use("/api/stocks",stockRoutes);
app.use("/api/invoices",receiptRoutes);
app.use("/api/costs",othercostRoutes);
app.use('/api/finalaccount', finalaccountRoutes);
app.use('/api/sales-returns',salesReturnRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
