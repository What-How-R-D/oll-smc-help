var nodemailer = require('nodemailer');
require('dotenv').config()

module.exports = function (recipient, subject, content) {

	var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.MY_EMAIL,
		pass: process.env.MY_PWD
	}
	});


	var mailOptions = {
		from: `OLL-SMC-building management ${process.env.MY_EMAIL}`,
		to: recipient,
		subject: subject,
		text: content
	};

	transporter.sendMail(mailOptions, function(error, info){
	if (error) {
		console.log(error);
	} else {
		console.log('Email sent to: ' + recipient + " wrt "+ subject);
	}
	});

};