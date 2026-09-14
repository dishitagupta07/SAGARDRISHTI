const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const express = require("express");
const cors = require("cors");
const spillRoutes = require("./routes/spillRoutes");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/spills", spillRoutes);

connectDB();

app.get("/", (req, res) => {
    res.json({
        message: "OilWatch AI Backend is running"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});