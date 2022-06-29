const mongoose = require("mongoose")

const roomSchema = new mongoose.Schema(
	{
    name: { type: String },
	building: { type: String },
	occupancy: { type: Number },
	calendar_id: { type: String },
	emp_min: { type: Boolean, default: false }
	},
 	{ timestamps: true }
)

module.exports = mongoose.model('Room', roomSchema)