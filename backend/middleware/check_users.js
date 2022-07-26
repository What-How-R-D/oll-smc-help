let userSchema = require('../models/user')

module.exports = async function (user_email) {
	var user = await userSchema.find({ email: user_email}, function (err, docs) {
				if (err){
					console.log(err);
					return err
				}
				else {
					return docs
				}
			}).clone();

	if (user.length === 0) {return ""}
	else if (user.length === 1) { return  user[0]._id.toString() }
	else {	
		console.log(`Multiple user found with email: ${user_email}`);
		return user[0]._id.toString()
	}
}