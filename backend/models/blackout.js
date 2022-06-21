const mongoose = require("mongoose")
var moment = require('moment');

const blackoutSchema = new mongoose.Schema(
	{
		name: { type: String },
		rooms: [{type: String}],
		startTime: {type: Date}, 
		endTime: {type: Date},
		requestor: {type: String},
	},
 	{ timestamps: true }
)

module.exports = mongoose.model('Blackout', blackoutSchema)