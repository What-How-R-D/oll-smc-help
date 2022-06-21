let roomSchema = require('../models/room')

module.exports = async function (room_id) {
	return roomSchema.findById(room_id, (error, data) => {
		if (error) {
		  return next(error)
		} else {
		  	return data
		}
	  }).clone()
}