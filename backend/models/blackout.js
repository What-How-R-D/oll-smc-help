const mongoose = require("mongoose")
var moment = require('moment');

const blackoutSchema = new mongoose.Schema(
	{
		name: { type: String },
		rooms: [{type: String}],
		gcal_id: [ {type: Object} ],
		startTime: {type: Date}, 
		endTime: {type: Date},
		requester: {type: String},
	},
 	{ timestamps: true }
)

module.exports = mongoose.model('Blackout', blackoutSchema)