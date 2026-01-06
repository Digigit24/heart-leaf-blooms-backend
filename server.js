const express = require("express");
const app = express();
require("dotenv").config();
const vendorRoute = require("./routes/vendorRoutes");
const adminRoutes = require("./routes/adminRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const PORT = process.env.PORT;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.get("/", (req, res) => {

    res.send("blooms server is running");
});

app.use("/vendor", vendorRoute);
app.use("/admin", adminRoutes);

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
})