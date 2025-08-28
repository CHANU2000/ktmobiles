const express=require('express');
const router=express.Router();
const Supplier=require('../models/Supplier');


router.post('/', async (req, res) => {
  try{
  const newSupplier = new Supplier(req.body);
  await newSupplier.save();
  res.status(201).json(newSupplier);
  }catch (err){
    res.status(500).json({error:"Error saving supplier"});
  }
});


router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: "Error fetching suppliers" });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { _id, ...updateData } = req.body; // remove _id if present
    const updatedSupplier = await Supplier.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    res.json(updatedSupplier);
  } catch (err) {
    res.status(500).json({ error: "Error updating supplier" });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Supplier.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Supplier not found" });
    res.json({ message: "Supplier deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting supplier" });
  }
});




module.exports = router;
