const mongoose = require("mongoose")

const roomSchema = new mongoose.Schema(
	{
    name: { type: String },
	building: { type: String },
	occupancy: { type: Number },
	},
 	{ timestamps: true }
)

module.exports = mongoose.model('Room', roomSchema)