let userSchema = require('../models/user')

module.exports = async function (room_id) {
	return await userSchema.find({ locks: true, can_spam: true, rooms: room_id.toString() }, function (err, docs) {
		if (err){
			console.log(err);
			return err
		}
		else {
			return docs
		}
	}).clone();
}