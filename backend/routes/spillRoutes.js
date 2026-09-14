const express = require("express");
const Spill = require("../models/spill.js");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const spill = await Spill.create(req.body);

        res.status(201).json({
            message: "Oil spill recorded successfully",
            spill
        });
    } catch (error) {
        res.status(500).json({
            message: "Error recording oil spill",
            error: error.message
        });
    }
});

router.get("/", async (req, res) => {
    try {
        const spills = await Spill.find();

        res.json(spills);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching oil spills",
            error: error.message
        });
    }
});

module.exports = router;