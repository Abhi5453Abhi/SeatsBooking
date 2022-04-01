const mongoose = require("mongoose");

const SeatSchema = new mongoose.Schema({
    name: String,
    value: String
})
module.exports = mongoose.model("Seat",SeatSchema)