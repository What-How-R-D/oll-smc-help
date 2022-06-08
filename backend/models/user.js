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
	hvac: {type: Boolean, default: false,},
	keys: {type: Boolean, default: false,},
	},
 	{ timestamps: true }
)

module.exports = mongoose.model('User', userSchema)