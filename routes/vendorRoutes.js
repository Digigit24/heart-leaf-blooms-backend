const express = require("express");
const vendorRoute = express.Router();


vendorRoute.get("/",(req,res)=>{
    res.send("vendor route")
})



module.exports = vendorRoute;
