const express =require('express');
const router=express.Router();
const New =require('../../src/pages/new/New');

router.get('/',async (req,res)=>{
    const users=await New.find();
    res.json(users);
});


router.post('/',async(req,res)=> {
    const {name,email,phone,address}=req.body;
    const newUser=new New({name,email,phone,address});
    await newUser.save();
    res.json(newUser);
});

module.exports=router;
