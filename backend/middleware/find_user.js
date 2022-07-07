let userSchema = require('../models/user')

module.exports = async function (user_id) {
	return userSchema.findById(user_id, (error, data) => {
		if (error) {
			console.log(error)
			return next(error)
		} else {
		  	return data
		}
	  }).clone()
}