let userSchema = require('../models/user')

module.exports = async function () {
	return await userSchema.find({ hvac: true, can_spam: true}, function (err, docs) {
		if (err){
			console.log(err);
			return err
		}
		else {
			return docs
		}
	}).clone();
}