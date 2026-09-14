const mongoose = require("mongoose");

const spillSchema = new mongoose.Schema(
    {
        latitude: {
            type: Number,
            required: true
        },

        longitude: {
            type: Number,
            required: true
        },

        area: {
            type: Number,
            required: true
        },

        confidence: {
            type: Number,
            required: true
        },

    

        spilltype: {
            type: String,
            required: true,
        },

    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Spill", spillSchema);