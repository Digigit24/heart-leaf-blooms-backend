const express = require("express");
const app = express();
require("dotenv").config();
const vendorRoute = require("./routes/vendorRoutes");
const PORT = process.env.PORT;
app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.get("/",(req,res)=>{
    
    res.send("blooms server is running");
});

app.use("/vendor",vendorRoute);

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
})