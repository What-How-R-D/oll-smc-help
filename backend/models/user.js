const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
	{
    name: { type: String },
    email: { type: String },
	valid_email: {type: Boolean, default: false,},
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
	emp_min: {type: Boolean, default: false,},
	},
 	{ timestamps: true }
)

module.exports = mongoose.model('User', userSchema)