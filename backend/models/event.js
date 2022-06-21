const mongoose = require("mongoose")
var moment = require('moment');

const eventSchema = new mongoose.Schema(
	{
		name: { type: String },
		requestor: { type: String },
		event_gcal_id: { type: String },
		attendance: { type: Number },
		contact: {type: String},
		email: {type: String},
		phone: {type: String},
		room: { type: String },
		startTime: {type: Date}, 
		endTime: {type: Date},
		lockStartTime: {type: Date}, 
		lockEndTime: {type: Date},
		status: {    
			type: String,
			enum: ["Pending", "Approved", "Rejected", "Canceled"],
			default: "Pending", 
			},
		paid: {type:Boolean, default:false},
		locksSet: {type:Boolean, default:false},
		hvacSet: {type:Boolean, default:false},
		notes: {type:String},
	},
 	{ timestamps: true }
)

module.exports = mongoose.model('Event', eventSchema)