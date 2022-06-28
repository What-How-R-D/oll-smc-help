const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
	{
    name: { type: String },
    email: { type: String },
    password: { type: String },
	type: {    
		type: String,
		enum: ["Admin", "Basic"],
		default: "Basic", 
		},
	bm: {type: Boolean, default: false,},
	rooms: [{type: String}],
	phone: { type: String },
	hvac: {type: Boolean, default: false,},
	locks: {type: Boolean, default: false,},
	reset_token: { type: String }
	},
 	{ timestamps: true }
)

module.exports = mongoose.model('User', userSchema)